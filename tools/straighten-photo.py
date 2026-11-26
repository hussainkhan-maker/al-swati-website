# Straightens the verticals of a building photo (keystone correction). Nothing is drawn or filled: the photo is only
# re-projected and cropped to the part that still has picture in it.
import cv2, numpy as np, sys, json, math, random
def segments(gray):
    try:
        lsd=cv2.createLineSegmentDetector(0); l=lsd.detect(gray)[0]
        return l.reshape(-1,4) if l is not None else np.zeros((0,4))
    except Exception:
        e=cv2.Canny(gray,60,160); l=cv2.HoughLinesP(e,1,np.pi/360,60,minLineLength=gray.shape[0]//12,maxLineGap=6)
        return l.reshape(-1,4).astype(float) if l is not None else np.zeros((0,4))
def vanishing(im):
    h,w=im.shape[:2]; sc=1000/max(h,w); g=cv2.cvtColor(cv2.resize(im,None,fx=sc,fy=sc,interpolation=cv2.INTER_AREA),cv2.COLOR_BGR2GRAY)
    S=segments(g)/sc; cx,cy=w/2,h/2
    L=[]
    for x1,y1,x2,y2 in S:
        dx,dy=x2-x1,y2-y1; ln=math.hypot(dx,dy)
        if ln<0.05*h: continue
        if abs(math.degrees(math.atan2(dx,dy if dy else 1e-9)))%180>32 and abs(abs(math.degrees(math.atan2(dx,dy)))-180)>32: continue
        L.append((x1-cx,y1-cy,x2-cx,y2-cy,ln))
    if len(L)<6: return None,0,len(L)
    L=np.array(L); P1=np.c_[L[:,0],L[:,1],np.ones(len(L))]; P2=np.c_[L[:,2],L[:,3],np.ones(len(L))]
    lines=np.cross(P1,P2); mid=(L[:,:2]+L[:,2:4])/2; d=L[:,2:4]-L[:,:2]; d/=np.linalg.norm(d,axis=1)[:,None]; wt=L[:,4]
    def score(v):
        if abs(v[2])<1e-12: t=np.tile(v[:2],(len(L),1))
        else: t=v[:2]/v[2]-mid
        n=np.linalg.norm(t,axis=1); n[n==0]=1; t=t/n[:,None]
        ang=np.degrees(np.arccos(np.clip(np.abs((t*d).sum(1)),0,1)))
        inl=ang<1.2; return wt[inl].sum(),inl
    best=(0,None,None); rnd=random.Random(7); idx=list(range(len(L)))
    for _ in range(1500):
        i,j=rnd.sample(idx,2); v=np.cross(lines[i],lines[j])
        if np.linalg.norm(v)==0: continue
        s,inl=score(v)
        if s>best[0]: best=(s,v,inl)
    s,v,inl=best
    A=lines[inl]/np.linalg.norm(lines[inl][:,:2],axis=1)[:,None]*np.sqrt(wt[inl])[:,None]
    v2=np.linalg.svd(A)[2][-1]
    s2,_=score(v2)
    if s2>=s*0.98: v=v2; s=s2
    return v, s/wt.sum(), int(inl.sum())
def straighten(im, strength=None, fk=0.62):
    h,w=im.shape[:2]; v,conf,n=vanishing(im)
    info={'conf':round(float(conf),2),'n':n}
    if v is None or conf<0.35: info['skip']='no clear verticals'; return None,info
    if abs(v[2])<1e-9: info['skip']='already straight'; return None,info
    vx,vy=v[0]/v[2],v[1]/v[2]; dist=math.hypot(vx,vy)
    roll=math.degrees(math.atan2(vx,-vy)) if vy<0 else math.degrees(math.atan2(-vx,vy))
    info.update(vp=[round(vx),round(vy)],roll=round(roll,2),tilt=round(math.degrees(math.atan(fk*max(w,h)/dist)),1))
    if dist>25*h and abs(roll)<0.4: info['skip']='already straight'; return None,info
    if abs(roll)>12: info['skip']='verticals not found reliably'; return None,info
    if strength is None: strength=0.92 if info['tilt']<40 else 0.8
    info['strength']=strength
    r=math.radians(roll); R=np.array([[math.cos(r),-math.sin(r),0],[math.sin(r),math.cos(r),0],[0,0,1.]])
    d=dist*(-1 if vy<0 else 1)            # signed y of the vanishing point after the roll is removed
    p=-strength/d                           # third row: sends the vanishing point (0,d) towards infinity
    P=np.array([[1,0,0],[0,1,0],[0,p,1.]])
    k=min(1.22,math.sqrt(1+(fk*max(w,h)*strength/dist)**2)); K=np.diag([1,k,1.])
    C=np.array([[1,0,-w/2],[0,1,-h/2],[0,0,1.]])
    H0=K@P@R@C
    c=cv2.perspectiveTransform(np.float32([[[0,0]],[[w,0]],[[w,h]],[[0,h]]]),H0).reshape(-1,2)
    mn=c.min(0); mx=c.max(0); T=np.array([[1,0,-mn[0]],[0,1,-mn[1]],[0,0,1.]]); W,Hh=int(mx[0]-mn[0]),int(mx[1]-mn[1])
    if W*Hh>60e6: info['skip']='too tilted'; return None,info
    H=T@H0
    out=cv2.warpPerspective(im,H,(W,Hh),flags=cv2.INTER_LANCZOS4)
    mask=cv2.warpPerspective(np.full((h,w),255,np.uint8),H,(W,Hh),flags=cv2.INTER_NEAREST)
    mask=cv2.erode(mask,np.ones((5,5),np.uint8))
    sky=cv2.warpPerspective(sky_mask(im),H,(W,Hh),flags=cv2.INTER_NEAREST)
    x0,y0,x1,y1=best_rect(mask,H,sky,h)
    info['kept']=round(float(kept_fraction(H,(x0,y0,x1,y1),w,h)),2)
    return out[y0:y1,x0:x1],info
def kept_fraction(H,r,w,h):
    Hi=np.linalg.inv(H); x0,y0,x1,y1=r
    q=cv2.perspectiveTransform(np.float32([[[x0,y0]],[[x1,y0]],[[x1,y1]],[[x0,y1]]]),Hi).reshape(-1,2)
    return cv2.contourArea(q)/(w*h)
def sky_mask(im):
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV); m=((hsv[:,:,0]>92)&(hsv[:,:,0]<128)&(hsv[:,:,1]>55)&(hsv[:,:,2]>135)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))
    n,lab=cv2.connectedComponents(m); keep=set(np.unique(lab[0,:]))-{0}      # only sky that reaches the top edge (not blue glass)
    return (np.isin(lab,list(keep))*255).astype(np.uint8)
def best_rect(mask,H,sky,srch,G=56):
    # the crop that keeps the most of the ORIGINAL photo (stretched sky does not count for more than it was)
    Hh,W=mask.shape; xs=np.linspace(0,W,G+1).astype(int); ys=np.linspace(0,Hh,G+1).astype(int)
    Hi=np.linalg.inv(H); wgt=np.zeros((G,G)); bad=np.zeros((G,G))
    for j in range(G):
        for i in range(G):
            cell=mask[ys[j]:ys[j+1],xs[i]:xs[i+1]]
            if cell.size==0 or cell.min()==0: bad[j,i]=1; continue
            q=cv2.perspectiveTransform(np.float32([[[xs[i],ys[j]]],[[xs[i+1],ys[j]]],[[xs[i+1],ys[j+1]]],[[xs[i],ys[j+1]]]]),Hi).reshape(-1,2)
            wgt[j,i]=cv2.contourArea(q)*(1-0.9*(sky[ys[j]:ys[j+1],xs[i]:xs[i+1]]>0).mean())*(1+1.2*(float(q[:,1].mean())/srch)**2)   # the ground floor matters more than the roof line
    Iw=np.pad(wgt.cumsum(0).cumsum(1),((1,0),(1,0))); Ib=np.pad(bad.cumsum(0).cumsum(1),((1,0),(1,0)))
    best=(0,None)
    for j0 in range(G):
        for j1 in range(j0+4,G+1):
            for i0 in range(G):
                # widest valid span from i0 by binary search (bad count is monotone in i1)
                lo,hi=i0,G
                while lo<hi:
                    m=(lo+hi+1)//2
                    if Ib[j1,m]-Ib[j0,m]-Ib[j1,i0]+Ib[j0,i0]==0: lo=m
                    else: hi=m-1
                if lo-i0<4: continue
                v=Iw[j1,lo]-Iw[j0,lo]-Iw[j1,i0]+Iw[j0,i0]
                if v>best[0]: best=(v,(i0,j0,lo,j1))
    i0,j0,i1,j1=best[1]; x0,y0,x1,y1=xs[i0],ys[j0],xs[i1],ys[j1]
    # trim empty sky above the building, leaving a band of about 12 % of the building's height
    rows=(sky[y0:y1,x0:x1]>0).mean(1); top=np.argmax(rows<0.97) if (rows<0.97).any() else 0
    y0=int(max(y0,y0+top-0.12*(y1-(y0+top))))
    return x0,y0,x1,y1
if __name__=='__main__':
    im=cv2.imread(sys.argv[1]); out,info=straighten(im,float(sys.argv[3]) if len(sys.argv)>3 else None)
    if out is not None: cv2.imwrite(sys.argv[2],out,[cv2.IMWRITE_JPEG_QUALITY,95])
    print(json.dumps(info))
