# Full facade rectification: verticals vertical AND the facade's horizontals level (by a chosen fraction).
import cv2, numpy as np, sys, math, random, json
import importlib.util, os
_sp = importlib.util.spec_from_file_location("S", os.path.join(os.path.dirname(os.path.abspath(__file__)), "straighten-photo.py")); S = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(S)
def vp_family(im, horizontal):
    h,w=im.shape[:2]; sc=1000/max(h,w); g=cv2.cvtColor(cv2.resize(im,None,fx=sc,fy=sc,interpolation=cv2.INTER_AREA),cv2.COLOR_BGR2GRAY)
    seg=S.segments(g)/sc; cx,cy=w/2,h/2; L=[]
    for x1,y1,x2,y2 in seg:
        dx,dy=x2-x1,y2-y1; ln=math.hypot(dx,dy)
        if ln<0.04*h: continue
        a=abs(math.degrees(math.atan2(dy,dx)))%180; a=min(a,180-a)      # 0 = horizontal, 90 = vertical
        if horizontal and a>42: continue
        if not horizontal and a<58: continue
        L.append((x1-cx,y1-cy,x2-cx,y2-cy,ln))
    L=np.array(L); P1=np.c_[L[:,0],L[:,1],np.ones(len(L))]; P2=np.c_[L[:,2],L[:,3],np.ones(len(L))]
    lines=np.cross(P1,P2); mid=(L[:,:2]+L[:,2:4])/2; d=L[:,2:4]-L[:,:2]; d/=np.linalg.norm(d,axis=1)[:,None]; wt=L[:,4]
    def score(v):
        t=np.tile(v[:2],(len(L),1)) if abs(v[2])<1e-12 else v[:2]/v[2]-mid
        n=np.linalg.norm(t,axis=1); n[n==0]=1; t=t/n[:,None]
        ang=np.degrees(np.arccos(np.clip(np.abs((t*d).sum(1)),0,1))); inl=ang<1.2; return wt[inl].sum(),inl
    best=(0,None,None); rnd=random.Random(3); idx=list(range(len(L)))
    for _ in range(2500):
        i,j=rnd.sample(idx,2); v=np.cross(lines[i],lines[j])
        if np.linalg.norm(v)==0: continue
        s,inl=score(v)
        if s>best[0]: best=(s,v,inl)
    s,v,inl=best
    A=lines[inl]/np.linalg.norm(lines[inl][:,:2],axis=1)[:,None]*np.sqrt(wt[inl])[:,None]; v2=np.linalg.svd(A)[2][-1]
    if score(v2)[0]>=s*0.98: v=v2
    return v, s/wt.sum()
def rot_to(a,b):
    a=a/np.linalg.norm(a); b=b/np.linalg.norm(b); v=np.cross(a,b); c=a@b
    if np.linalg.norm(v)<1e-12: return np.eye(3)
    vx=np.array([[0,-v[2],v[1]],[v[2],0,-v[0]],[-v[1],v[0],0]]); return np.eye(3)+vx+vx@vx/(1+c)
def front(im, hfrac=1.0, f=None, top_keep=0.12):
    h,w=im.shape[:2]; vv,cv_=vp_family(im,False); vh,ch=vp_family(im,True)
    info={'conf_v':round(float(cv_),2),'conf_h':round(float(ch),2)}
    if f is None:
        if abs(vv[2])>1e-9 and abs(vh[2])>1e-9:
            dot=(vv[0]/vv[2])*(vh[0]/vh[2])+(vv[1]/vv[2])*(vh[1]/vh[2]); f=math.sqrt(-dot) if dot<0 else 0.62*max(w,h)
        else: f=0.62*max(w,h)
    f=float(np.clip(f,0.35*max(w,h),1.6*max(w,h))); info['f']=round(f)
    Ki=np.diag([1/f,1/f,1.]); K=np.diag([f,f,1.])
    up=Ki@vv; up/=np.linalg.norm(up)
    if up[1]>0: up=-up                                   # image-up direction (y is down in the image)
    R1=rot_to(up,np.array([0,-1.,0]))
    d=R1@(Ki@vh); d/=np.linalg.norm(d)
    if d[0]<0: d=-d
    psi=math.atan2(d[2],d[0]); info['tilt']=round(math.degrees(math.acos(-up[1])),1); info['yaw']=round(math.degrees(psi),1)
    a=psi*hfrac; Ry=np.array([[math.cos(a),0,math.sin(a)],[0,1,0],[-math.sin(a),0,math.cos(a)]])
    C=np.array([[1,0,-w/2],[0,1,-h/2],[0,0,1.]]); H0=K@Ry@R1@Ki@C
    c=cv2.perspectiveTransform(np.float32([[[0,0]],[[w,0]],[[w,h]],[[0,h]]]),H0).reshape(-1,2)
    if (np.array([[0,0,1],[w,0,1],[w,h,1],[0,h,1.]])@H0.T)[:,2].min()<=0.05: info['skip']='too steep'; return None,info
    mn=c.min(0); mx=c.max(0); sc=min(2.2,5200/max(mx-mn)); T=np.array([[sc,0,-mn[0]*sc],[0,sc,-mn[1]*sc],[0,0,1.]])
    W,Hh=int((mx[0]-mn[0])*sc),int((mx[1]-mn[1])*sc); H=T@H0
    out=cv2.warpPerspective(im,H,(W,Hh),flags=cv2.INTER_LANCZOS4)
    mask=cv2.erode(cv2.warpPerspective(np.full((h,w),255,np.uint8),H,(W,Hh),flags=cv2.INTER_NEAREST),np.ones((5,5),np.uint8))
    sky=cv2.warpPerspective(S.sky_mask(im),H,(W,Hh),flags=cv2.INTER_NEAREST)
    x0,y0,x1,y1=S.best_rect(mask,H,sky,h)
    info['kept']=round(float(S.kept_fraction(H,(x0,y0,x1,y1),w,h)),2); info['size']=[int(x1-x0),int(y1-y0)]
    return out[y0:y1,x0:x1],info
if __name__=='__main__':
    im=cv2.imread(sys.argv[1]); out,info=front(im,float(sys.argv[3]) if len(sys.argv)>3 else 1.0)
    if out is not None: cv2.imwrite(sys.argv[2],out,[cv2.IMWRITE_JPEG_QUALITY,95])
    print(json.dumps(info))
