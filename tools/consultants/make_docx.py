#!/usr/bin/env python3
"""Writes downloads/al-swati-guide-specification-04-42-00-stone-cladding.docx:
"04 42 00 Exterior Stone Cladding - Mechanically Fixed (Guide Specification)", three options, blanks for project values.
Run from the repository root:  python3 tools/consultants/make_docx.py   (needs python-docx)"""
import os
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
OUT = os.path.join(ROOT, "downloads", "al-swati-guide-specification-04-42-00-stone-cladding.docx")
LABEL = "Guide only – to be edited by the specifier; project design by the project engineer"
TITLE = "04 42 00 Exterior Stone Cladding – Mechanically Fixed (Guide Specification)"
B = "[____]"  # a blank for a project value

d = Document()
sec = d.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2.2); sec.top_margin = Cm(2.2); sec.bottom_margin = Cm(2)
st = d.styles["Normal"]; st.font.name = "Calibri"; st.font.size = Pt(10.5)
st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
for name, size in (("Heading 1", 15), ("Heading 2", 12), ("Heading 3", 11)):
    s = d.styles[name]; s.font.name = "Calibri"; s.font.size = Pt(size); s.font.bold = True; s.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
GOLD = RGBColor(0x8A, 0x6D, 0x1F)

def field(par, code):
    r = par.add_run()
    for t, txt in (("begin", None), (None, code), ("end", None)):
        if t:
            e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), t)
        else:
            e = OxmlElement("w:instrText"); e.set(qn("xml:space"), "preserve"); e.text = txt
        r._r.append(e)
    return r

hp = sec.header.paragraphs[0]; hr = hp.add_run("04 42 00 Exterior Stone Cladding – Mechanically Fixed   |   " + LABEL); hr.font.size = Pt(8); hr.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
fp = sec.footer.paragraphs[0]; fr = fp.add_run("AL-Swati Contracting, Riyadh · al-swaticontracting.com · November 2026 · Guide specification, revision 0 · Page "); fr.font.size = Pt(8)
field(fp, "PAGE").font.size = Pt(8)

def P(text="", bold=False, italic=False, size=None, color=None, align=None, after=4, indent=None):
    p = d.add_paragraph(); r = p.add_run(text); r.bold = bold; r.italic = italic
    if size: r.font.size = Pt(size)
    if color: r.font.color.rgb = color
    if align: p.alignment = align
    p.paragraph_format.space_after = Pt(after)
    if indent is not None: p.paragraph_format.left_indent = Cm(indent)
    return p
def note(text):  # note to the specifier: italic, to be deleted before issue
    p = P("Specifier note: " + text, italic=True, size=9.5, color=GOLD, after=6); return p
def art(num, title): d.add_heading(f"{num}  {title}", level=2)
def para(letter, text, level=0):
    p = d.add_paragraph(); p.paragraph_format.left_indent = Cm(0.9 + 0.8 * level); p.paragraph_format.first_line_indent = Cm(-0.7); p.paragraph_format.space_after = Pt(3)
    p.add_run(f"{letter}.\t{text}")
    return p
def items(lst, level=0, start="A"):
    for i, t in enumerate(lst):
        if isinstance(t, (list, tuple)):
            para(chr(ord(start) + i) if level == 0 else str(i + 1), t[0], level); items(t[1], level + 1)
        else:
            para(chr(ord(start) + i) if level == 0 else str(i + 1), t, level)

# ---------- cover ----------
P("SECTION 04 42 00", bold=True, size=12, color=GOLD, after=2)
d.add_heading("EXTERIOR STONE CLADDING – MECHANICALLY FIXED", level=1)
P("Guide Specification", bold=True, size=13, after=10)
box = d.add_table(rows=1, cols=1); box.style = "Table Grid"
c = box.rows[0].cells[0]; c.paragraphs[0].add_run(LABEL + ".").bold = True
c.add_paragraph("This document is general guidance issued by AL-Swati Contracting, Riyadh (experience since 1994), for architects, consultants and specifiers. It is not a design, a calculation or an offer. Every value in square brackets is a blank or a choice for the specifier and the project engineer. Notes to the specifier are in italics: delete them before issue.")
c.add_paragraph("Date: November 2026. Revision 0.")
P("", after=6)
d.add_heading("How to use this guide", level=3)
for t in ("Keep one fixing option (A, B or C) for each stone or panel type and delete the others. Different options may be used on different parts of a building.",
          "Fill every blank " + B + ". Where a value is not known, write who will provide it and when; do not leave it blank in an issued specification.",
          "Check every referenced standard against its current edition. Standards are named here by number; this guide does not reproduce their text.",
          "Wind loads, safety factors, deflection limits, anchor and bolt sizes and stone thickness are outputs of the project engineer's design. This guide gives no project values."):
    d.add_paragraph(t, style="List Bullet").paragraph_format.space_after = Pt(2)
d.add_heading("The three fixing options", level=3)
t = d.add_table(rows=1, cols=4); t.style = "Table Grid"
for i, h in enumerate(("Option", "System", "Evidence it carries", "Typical use")):
    t.rows[0].cells[i].paragraphs[0].add_run(h).bold = True
for row in (("A – Economy / local", "Pin (dowel) or Up-Down brackets, optionally on vertical C-channels, with locally available accessories", "Project calculation by the facade engineer; fixing tests in the project stone; material certificates per batch", "Stone of 30 mm and more on concrete or solid masonry"),
            ("B – Engineered system", "Proprietary rail and bracket system with the system supplier's design", "Supplier's calculation, shop drawings and data sheets for the project", "Ventilated facades, weak infill walls, regular grids"),
            ("C – Assessed undercut anchors", "Undercut anchors holding a European Technical Assessment (ETA), on horizontal rails", "ETA and declaration of performance; stone-specific resistance from the ETA or from tests", "Thin hard stone, porcelain, large panels, replaceable panels")):
    cells = t.add_row().cells
    for i, v in enumerate(row): cells[i].text = v
for row in t.rows:
    for cell in row.cells:
        for p in cell.paragraphs:
            for r in p.runs: r.font.size = Pt(9.5)
d.add_page_break()

# ---------- PART 1 ----------
d.add_heading("PART 1 – GENERAL", level=1)
art("1.1", "SUMMARY")
items([
    ("Section includes:", [
        f"Natural stone cladding panels, mechanically fixed: {B} (stone types, for example limestone, marble, granite).",
        f"[Porcelain / ceramic cladding panels, mechanically fixed: {B}.]",
        "Stone fixings and their connection to the substructure or to the building structure.",
        "[Steel] [Aluminium] substructure behind the cladding, with its anchors to the building structure.",
        "[Insulation, membranes and cavity barriers within the cladding zone, where shown.]",
        "Delegated design of the cladding system by the Contractor's facade engineer [where shop drawings are not issued by the Consultant]."]),
    ("Related sections:", [f"Section {B} – Joint Sealants.", f"Section {B} – Waterproofing and Thermal Insulation.", f"Section {B} – Fire Stopping and Cavity Barriers.", f"Section {B} – Structural Steel / Metal Fabrications."]),
])
note("State who designs: either the Consultant or Main Contractor issues approved shop drawings and the installer builds to them, or the installer appoints an independent facade engineer for the project. Edit 1.1.A.6, 1.4.A and 1.5 to match.")
art("1.2", "REFERENCES")
P("Use the edition current at the date of the Contract unless a date is given. Where standards conflict, the Engineer decides.", after=3)
items([
    f"Saudi Building Code: SBC 201 (General), SBC 301 (Loads), SBC 304 (Concrete), SBC 306 (Steel), SBC 801 (Fire). Edition: {B}.",
    "ASTM C1242 – Guide for selection, design and installation of dimension stone attachment systems.",
    "ASTM C1354 – Strength of individual stone anchorages. ASTM C880 – Flexural strength. ASTM C99 – Modulus of rupture. ASTM C97 – Absorption and bulk specific gravity. ASTM C170 – Compressive strength.",
    "ASTM C568 (limestone), ASTM C503 (marble), ASTM C615 (granite) – material specifications. ASTM C1528 – Guide for selecting dimension stone.",
    "EN 1469 – Natural stone slabs for cladding. EN 13364 – Breaking load at a dowel hole. EN 12372 / EN 13161 – Flexural strength. EN 1926 – Compressive strength. EN 13755 – Water absorption. EN 1936 – Density and porosity. [EN 16306 – Resistance of marble to thermal and moisture cycles.]",
    "BS 8298-4 – Stone cladding on rainscreen support systems. [BS 8298-2 – Traditional handset external cladding.] [DIN 18516-3 – Rear-ventilated natural stone cladding.]",
    "EN 10088 / EN ISO 3506 – Stainless steels and stainless fasteners. ISO 1461 or ASTM A123 – Hot-dip galvanising. ASTM A780 – Repair of galvanised coatings. ISO 12944 – Paint systems for steel.",
    "EN 10204 – Inspection documents for metallic products.",
    "BS 8539 – Selection, installation and site testing of post-installed anchors.",
    "EAD 330030-00-0601 – Fasteners for rear fixing of facade panels (basis of ETAs for undercut anchors).",
    "[ISO/TS 17870-3 – Mechanical installation of large-format porcelain tiles and panels; EN 14411 / ISO 13006 – Ceramic tiles; the panel manufacturer's facade guide.]",
])
art("1.3", "DEFINITIONS")
items([
    "Loadbearing fixing: a fixing that carries the dead load of a panel. Restraint fixing: a fixing that resists wind and holds the panel in position without carrying dead load.",
    "Edge fixing: a pin (dowel), kerf blade or Up-Down tongue engaged in a hole or slot in the panel edge.",
    "Undercut anchor: a form-fit anchor set in an undercut hole in the back of the panel.",
    "Substructure: brackets, channels, rails or frames between the building structure and the stone fixings.",
    "Engineer: the facade engineer responsible for the design of the cladding system on this Project.",
    "Movement joint: a joint that allows thermal and structural movement without loading the panels.",
])
art("1.4", "PERFORMANCE REQUIREMENTS")
items([
    f"Design responsibility: [Delegated design. The Contractor shall appoint a qualified facade engineer, accredited to practise in the Kingdom, to design the cladding system, its substructure and its anchors.] [Design by the Consultant: install to the approved shop drawings.] Engineering documents shall carry the engineer's name, professional grade and accreditation number.",
    f"Wind loads: components-and-cladding pressures per SBC 301 edition {B}. Basic wind speed {B}; risk category {B}; exposure category {B}; mean roof height {B} m. Design pressures: field of wall {B} kN/m²; corner and edge zones {B} kN/m². State on the drawings.",
    f"Seismic: per SBC 301. Seismic design category {B}; [check the cladding as a non-structural component] [state why not required].",
    "Dead load: each panel carries its own weight to its loadbearing fixings. Panels shall not bear on the panels below. Fixing capacity shall not rely on epoxy, resin or grout.",
    f"Safety factors on stone: {B} for panel bending and {B} at the fixing, per {B} (standard). Base all values on tests of the Project stone (see 1.7).",
    f"Deflection of members supporting stone under wind: not more than span/{B}. Vertical deflection under panel weight: not more than span/{B} and not more than {B} mm. State the wind level used for the check.",
    f"Thermal movement: design air temperature range {B} °C to {B} °C; surface temperature allowance {B}. Provide fixed and sliding points and movement joints so that no panel is restrained.",
    f"Building movement: accommodate storey drift of {B} mm and slab edge deflection of {B} mm.",
    "Corrosion: materials and coatings as Part 2. Separate dissimilar metals where the joint can remain damp.",
    f"Fire: cladding components non-combustible unless shown otherwise; insulation, membranes and cavity barriers per the Project fire strategy {B}.",
])
note("Published safety-factor tables differ by stone and by standard (for example ASTM C1242 lists different factors for granite, marble, limestone, sandstone and travertine). Name the standard the Engineer is to use. ASTM C1242 treats a backup more flexible than L/600 as a case for a stone specialist; the building code's general deflection limit for walls is less strict; state the limit the Engineer is to use.")
art("1.5", "SUBMITTALS")
items([
    ("Pre-qualification:", ["Company profile and list of similar projects.", "Name, qualification and accreditation of the facade engineer [where design is delegated].", "Name and experience of the site supervisor.", "[Commercial registration and other documents required by the Employer.]"]),
    ("Material submittals, for each material:", [
        f"Stone: source and quarry, petrographic name, finish, range samples ({B} pieces, {B} × {B} mm); test reports not older than {B} years to 1.7.",
        "Fixings: data sheets and drawings of each bracket, pin, rail and clip; material and grade; mill certificates; galvanising certificates where applicable.",
        "Undercut anchors [Option C]: ETA with annexes, declaration of performance, and stone-specific resistance or the test plan.",
        "Anchors to the structure: approval (ETA or equivalent), data sheet and design output.",
        "Substructure: profile data sheets, material and grade, coating system, isolators, fasteners.",
        "[Porcelain: manufacturer's data sheet, classification, facade installation guide, fixing system approval for the panel, mesh backing data.]",
        "[Sealant: stain test on the Project stone, compatibility and adhesion.]"]),
    ("Design submittals [where design is delegated]:", [
        "Design basis statement: codes and editions, wind parameters, seismic parameters, temperature range, deflection limits, corrosion category, anchor design route.",
        "Structural calculations: wind by zone; panel bending; fixing in stone; brackets; substructure members and deflection; anchors to the structure including the concrete or masonry side; movement.",
        "Shop drawings: elevations with panel numbering; fixing layout per panel; typical and special details (corners, openings, soffits, parapet, base); movement joints; tolerances; shim method; anchor type and installation data.",
        "Part list of the substructure."]),
    ("Method and quality documents:", ["Method statement with risk assessment.", "Inspection and test plan with hold and witness points.", "[Mock-up proposal.]", "[Pull-out test proposal: number, proof load, acceptance, equipment calibration.]"]),
    ("Closeout:", ["Record (as-built) drawings with panel numbering.", "Material and test record file.", "Maintenance guide.", f"Attic stock: {B} % of each stone type.", "Warranty (see 1.10)."]),
])
art("1.6", "QUALITY ASSURANCE")
items([
    f"Installer: a firm with at least {B} years' experience of mechanically fixed stone cladding and {B} completed projects of similar size; installation by the installer's own crew under a full-time site supervisor.",
    "[Option C: drilling of undercut holes and setting of anchors by operators instructed in the anchor manufacturer's procedure, using the manufacturer's drilling equipment and gauges.]",
    "No substitution of stone source, fixing type, fixing material or anchor product without the written approval of the Engineer and the Consultant.",
    f"[Mock-up: build a mock-up of {B} m × {B} m at {B}, including a typical panel, a corner and an opening jamb, from approved materials and by the Project crew. Obtain inspection of anchors and substructure before stone is fixed. The approved mock-up is the standard of workmanship [and may remain as part of the Work].]",
    "Pre-installation meeting with the Consultant, the Engineer and the Main Contractor before work starts.",
    "[Engineer's site visits: {B} per {B} during installation, with a written report.]".replace("{B}", B),
])
art("1.7", "PRE-CONSTRUCTION TESTING")
items([
    f"Stone properties, by a laboratory acceptable to the Consultant, on the Project stone at Project thickness and finish: absorption and density (ASTM C97 or EN 13755 / EN 1936); compressive strength (ASTM C170 or EN 1926); flexural strength, wet and dry (ASTM C880 or EN 12372 / EN 13161). Number of specimens: {B}.",
    f"Strength at the fixing, in the Project stone, for each fixing type: ASTM C1354 or EN 13364 [Options A and B]; tests to the anchor's assessment document where the stone is not covered by the ETA [Option C]. Number of specimens: {B}.",
    "[Exterior marble: resistance to thermal and moisture cycles to EN 16306, or documented local performance acceptable to the Engineer.]",
    "Anchors to the structure: where the base material is not covered by the anchor's approval, preliminary tests on the actual substrate to derive the allowable resistance.",
])
note("Stone test data should be current. Practice differs between about three years and longer where the quarry bed is unchanged; state the Project requirement in 1.5.B.1.")
art("1.8", "DELIVERY, STORAGE AND HANDLING")
items(["Deliver stone on A-frames or pallets with non-staining spacers; panels marked with their numbers.", "Store off the ground, under cover, away from site traffic and from staining materials.", "Protect edges and fixing holes. Reject cracked, chipped or stained panels.", "Store fixings dry and separated by type and material."])
art("1.9", "SITE CONDITIONS")
items(["Survey the structure before fabrication of the substructure; report deviations beyond the adjustment range of the fixings.", "Do not start until waterproofing, insulation and adjacent trades in the cladding zone are complete and inspected."])
art("1.10", "WARRANTY")
items([f"Installer's written workmanship warranty: {B} years from the date of handover.", "Manufacturers' product warranties for anchors and proprietary systems, where offered."])

# ---------- PART 2 ----------
d.add_heading("PART 2 – PRODUCTS", level=1)
art("2.1", "STONE")
items([
    f"Stone type 1: {B} (trade name), {B} (petrographic name), source {B}; finish {B}; thickness {B} mm; maximum panel size {B} × {B} mm.",
    f"Stone type 2: {B}.",
    "Classification: limestone to ASTM C568 class " + B + "; marble to ASTM C503 (soundness Group A for exterior use); granite to ASTM C615; or EN equivalents declared to EN 1469.",
    "Thickness: not less than the thickness required by the Engineer's calculation for the fixing type selected in 2.3, and not less than the thickness shown.",
    "Panels free of open seams, active cracks and repairs at fixing positions.",
    "[Back mesh where specified: for fragment retention and handling only; not to be counted in the strength of the panel.]",
])
note("Edge fixings (pin, kerf, Up-Down) need enough stone on each side of the hole or slot: published rules give about 10 to 12 mm each side for strong stone, which makes about 30 mm the practical minimum. Exterior panels of 20 mm on edge fixings are acceptable only with fixing tests in the Project stone and the Engineer's calculation; otherwise use Option C or a thicker panel.")
art("2.2", "PORCELAIN PANELS [IF INCLUDED]")
items([f"Manufacturer and range: {B}; thickness {B} mm; [mesh-backed].", "Fixing system: as the panel manufacturer's facade guide and the approval of the fixing for that panel. Site-cut kerfs are not permitted in thin panels."])
art("2.3", "FIXING SYSTEM")
P("Select one option for each stone or panel type. Delete the others.", italic=True, after=4)
d.add_heading("Option A – Economy / local", level=3)
items([
    "System: [pin (dowel) brackets] [Up-Down brackets], [fixed directly to the structure] [on vertical C-channels].",
    "Parts in contact with the stone (pins, tongues, kerf blades, clips): stainless steel grade [1.4301 (304, A2)] [1.4401 (316, A4)].",
    f"Wall brackets and channels: [stainless steel grade {B}] [steel hot-dip galvanised after fabrication to ISO 1461, minimum mean coating {B} µm], separated from stainless parts where the joint can remain damp.",
    "Thickness and sizes of brackets, pins, channels and bolts: per the Engineer's calculation.",
    "Pin fixings: sliding sleeve on one side of each joint; hole position, diameter and depth as the shop drawings; [fill holes with a non-staining, non-rigid filler; rigid epoxy fill is not permitted].",
    "Mill certificates (EN 10204 type 3.1) for each batch of brackets, pins and bolts.",
])
note("Published stone-industry guidance recommends stainless steel for parts in direct contact with stone and accepts hot-dip galvanised steel only for parts that do not touch the stone. Edit the second and third paragraphs to the Project decision.")
d.add_heading("Option B – Engineered system", level=3)
items([
    f"System: proprietary rail and bracket system {B} (manufacturer and system name) or equal approved, with [kerf rail] [clip] [undercut hanger] fixing of the panels.",
    "Supplied with the system supplier's structural calculation for the Project wind loads, shop drawings and data sheets.",
    f"Rails and brackets: [aluminium alloy and temper {B}] [stainless steel grade {B}]; fasteners stainless steel; isolators between dissimilar metals.",
    "Fixed and sliding points for each rail length as the supplier's design.",
])
d.add_heading("Option C – Assessed undercut anchors", level=3)
items([
    f"Anchors: undercut anchors for rear fixing of facade panels holding a European Technical Assessment to EAD 330030-00-0601: {B} (manufacturer, anchor type and ETA number) or equal approved; stainless steel.",
    "Stone-specific characteristic resistance from the ETA for the Project stone, or from tests to the assessment document where the stone is not listed.",
    "At least four anchors per panel in a rectangular layout unless the calculation shows otherwise; edge distances, spacing and panel size within the limits of the ETA.",
    "Hangers and horizontal rails: the anchor manufacturer's system or a system approved by the Engineer, with fixed and sliding points and locking of hangers.",
    "Drill undercut holes with the manufacturer's equipment; check every hole with the manufacturer's gauge; tighten to the manufacturer's torque; keep records.",
])
note("An ETA assesses the anchor. Whether it covers a particular stone must be confirmed with the anchor manufacturer; expect Project tests for stone that is not listed. Published manufacturer data sets a larger minimum thickness for limestone and sandstone than for granite-type stone.")
art("2.4", "ANCHORS TO THE STRUCTURE")
items([
    f"Post-installed anchors with an ETA or equivalent approval for the base material and for cracked concrete where applicable: {B} (product). Type, diameter and embedment per the Engineer's calculation.",
    "The calculation shall cover steel failure and the concrete or masonry side (breakout, pull-out or bond, edge and splitting) for the actual edge distances and member thickness.",
    "Hollow or weak masonry: loadbearing brackets shall be fixed to reinforced concrete unless the Engineer demonstrates capacity by approved anchors and site tests.",
])
art("2.5", "STEEL SUBSTRUCTURE [IF INCLUDED]")
items([
    f"Sections and plates: specification and grade {B}; sizes per the Engineer's calculation and the shop drawings.",
    f"Corrosion protection: [hot-dip galvanised after fabrication to ISO 1461, minimum mean coating {B} µm, with vent and drain holes agreed with the galvaniser] [paint system to ISO 12944 for corrosivity category {B}, total dry film thickness {B} µm].",
    f"Site cuts and welds in coated steel: repaired by {B} (method to ASTM A780 or the paint manufacturer's procedure) and inspected before being covered.",
    "Connections: shop welded and site bolted where practicable; weld sizes and bolt grades on the shop drawings.",
])
art("2.6", "ACCESSORIES")
items(["Shims: stainless steel or high-density plastic; maximum packing as the shop drawings.", "Isolators: non-conductive washers, bushes and pads.", "Sleeves and setting pads as the fixing system.", f"[Sealant and backer rod: {B}, non-staining to the Project stone.]", "[Insect mesh and cavity closers at ventilation openings.]"])
art("2.7", "FABRICATION")
items(["Cut holes, kerfs and undercuts in the workshop, to the shop drawings. Hand-held grinder kerfs are not permitted.", f"Fabrication tolerances: to EN 1469 or {B}; fixing holes within {B} mm of position.", "Mark each panel with its number and orientation."])
art("2.8", "SOURCE QUALITY CONTROL")
items([f"Quality control tests on delivered stone: {B} sets per {B} m².", "[Option C: gauge records for undercut holes for every panel.]"])

# ---------- PART 3 ----------
d.add_heading("PART 3 – EXECUTION", level=1)
art("3.1", "EXAMINATION")
items(["Examine the structure and the survey. Do not proceed until unsatisfactory conditions are corrected.", "Confirm that the drawings on site are the approved revision."])
art("3.2", "PREPARATION")
items(["Set out grid and level lines from the Project datum.", "Protect adjacent finished work."])
art("3.3", "INSTALLATION OF ANCHORS AND SUBSTRUCTURE")
items([
    "Drill, clean and install anchors to the manufacturer's instructions; tighten with calibrated torque tools.",
    "Install brackets, channels, rails or frames true to line, level and plumb, with fixed and sliding points as the shop drawings.",
    "Fit isolators between dissimilar metals as detailed.",
    "Repair site cuts and welds in coated steel as 2.5. Do not cover until inspected.",
])
art("3.4", "INSTALLATION OF STONE")
items([
    "Check each panel number, thickness and fixing holes before lifting.",
    "Install panels in the sequence of the shop drawings, with the number and type of fixings shown for each panel.",
    "Maintain the clearance shown between each bracket and the panel below so that no load passes between panels.",
    "Do not cut or drill panels on the wall except as approved by the Engineer.",
    "Replace panels damaged during installation.",
])
art("3.5", "JOINTS")
items([f"Joint width {B} mm; [open] [sealed]. Movement joints at the positions and widths on the shop drawings; keep them free of shims and debris.", "Keep ventilation openings at the base and top of the cavity clear."])
art("3.6", "TOLERANCES")
items([f"Plumb: {B} mm in {B} m. Level: {B} mm in {B} m. Joint width: ± {B} mm. Lippage between adjacent panels: {B} mm maximum."])
art("3.7", "FIELD QUALITY CONTROL")
items([
    f"[Pull-out proof tests on anchors to the structure: {B} % of anchors and not fewer than {B} in each area, at a proof load of {B} × the design action, by [the anchor manufacturer] [an independent laboratory], witnessed by the Consultant. On failure, increase the sample as directed by the Engineer.]",
    "Inspection requests: materials on delivery; setting out; anchors; substructure before stone; stone installation; joints; completed elevations.",
    "Hold points: substructure and anchors before they are covered; [mock-up]; [pull-out tests]; completed elevation.",
    "Non-conforming work: stop, record, propose the correction in writing, obtain approval, correct and re-inspect.",
])
note("Published UK practice to BS 8539 proof-tests a sample of anchors at 1.5 times the design action. A test report is evidence for the Engineer; it is not an approval in itself.")
art("3.8", "CLEANING AND PROTECTION")
items(["Clean with clean water and soft brushes; neutral cleaners only where needed. No acids on limestone or marble. Test any cleaner on a small area first.", "Protect completed work from following trades until handover."])
art("3.9", "SCHEDULE")
sch = d.add_table(rows=1, cols=5); sch.style = "Table Grid"
for i, h in enumerate(("Location", "Stone / panel type", "Thickness (mm)", "Fixing option (A / B / C)", "Joint")):
    sch.rows[0].cells[i].paragraphs[0].add_run(h).bold = True
for _ in range(4):
    cells = sch.add_row().cells
    for cl in cells: cl.text = B
P("", after=6)
P("END OF SECTION", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, after=10)
d.add_heading("Public sources behind this guide", level=3)
for s in ("ASTM C1242, Guide for selection, design and installation of dimension stone attachment systems – store.astm.org/standards/c1242",
          "Natural Stone Institute, Dimension Stone Design Manual (vertical surfaces; limestone chapter) – naturalstoneinstitute.org",
          "Building Stone Institute, Recommended Best Practices – indystone.com/publications/BSI_Recommended_Practices.pdf",
          "Harrison Goldman, The Design of Fixings for Natural Stone Cladding (reports BS 8298:2020) – harrisongoldman.com",
          "DIBt, European Technical Assessments for undercut anchors for facade panels – dibt.de",
          "Construction Fixings Association, Procedure for Site Testing Construction Fixings (to BS 8539)",
          "Published guide and project specifications for Section 04 42 00 Exterior Stone Cladding (three-part format)",
          "Full list with links: al-swaticontracting.com/for-consultants/specification/"):
    p = d.add_paragraph(s, style="List Bullet"); p.paragraph_format.space_after = Pt(1)
    for r in p.runs: r.font.size = Pt(9)
P(LABEL + ". AL-Swati Contracting, Riyadh · +966 51 182 6313 · info@al-swaticontracting.com", italic=True, size=9, after=0)

d.core_properties.title = TITLE; d.core_properties.author = "AL-Swati Contracting"; d.core_properties.subject = LABEL; d.core_properties.comments = "November 2026, revision 0"
os.makedirs(os.path.dirname(OUT), exist_ok=True)
d.save(OUT)
print("wrote", os.path.relpath(OUT, ROOT), os.path.getsize(OUT), "bytes")
