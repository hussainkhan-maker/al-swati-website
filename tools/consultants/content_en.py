# English content of the "For Architects & Consultants" section. {{key}} marks a source from build.py SOURCES.
# Company facts are fixed by the owner (see the report): claim nothing that is not in them.
PDF_EN = "/downloads/al-swati-stone-facade-maintenance-guide-en.pdf"
PDF_AR = "/downloads/al-swati-stone-facade-maintenance-guide-ar.pdf"
DOCX = "/downloads/al-swati-guide-specification-04-42-00-stone-cladding.docx"
SIZES = "per the engineer's calculation and the consultant's specification"


def pages(h):
    u = h.u
    P = {}

    # ------------------------------------------------------------------ 1. landing
    P[""] = dict(
        title="For Architects & Consultants | AL-Swati Contracting",
        desc="For architects and consultants in Riyadh: how AL-Swati delivers mechanically fixed stone facades, fixing systems, thickness, QA/QC and a guide specification.",
        crumb="For Architects & Consultants", eyebrow="Technical section", h1="For Architects &amp; Consultants",
        lead="AL-Swati Contracting supplies and installs mechanically fixed natural stone, marble, granite and porcelain facades in Riyadh, and installs the steel substructure behind them to the engineer's design. This section says plainly how we work, what we install and what we can submit, so you can decide early whether we fit your project.",
        btns=f'<div class="btns"><a class="btn btn-gold" href="{u("send-drawings")}"><span>Send us your drawings</span><span class="arrow"></span></a><a class="btn btn-line" href="{u("specification")}"><span>Guide specification</span><span class="chev"></span></a></div>',
        sections=[
            ("Who it is for", "Written for the People Who Specify and Approve",
             h.cards([
                 ("Design", "Architects and designers", "You are choosing the stone, the panel sizes and the joint pattern, and need to know which fixing system and thickness make them buildable.", "", ""),
                 ("Review", "Consultants and facade engineers", "You write or review the specification and the submittals, and want to see the process, the tests and the records before the work starts.", "", ""),
                 ("Delivery", "Main contractors' technical offices", "You prepare prequalification and submittal packages and need a stone subcontractor whose statements hold up when the consultant reads them.", "", ""),
             ]) + h.prose(h.p("AL-Swati Contracting is based in Riyadh. Our team's experience goes back to 1994. Our scope is the supply and installation of mechanically fixed natural stone (mainly Riyadh limestone), marble, granite and porcelain facades, and the installation of the steel substructure behind them to the engineer's design."))),
            ("When to call us", "Three Moments a Consultant Needs Us",
             h.cards([
                 ("1 · Design stage", "Which system, which thickness", h.ul("Which fixing systems suit the stone, the backup wall and the height", "What published guidance says about panel thickness", "Which tests to ask for before the stone is approved"), u("thickness-and-fixing"), "Thickness and fixing"),
                 ("2 · Tender and prequalification", "How the work will be delivered", h.ul("Two engineering routes, stated openly", "Own installation team with a site supervisor", "5-year written workmanship warranty"), u("how-we-deliver"), "How we deliver"),
                 ("3 · Construction submittals", "What we submit and record", h.ul("Material submittals and samples", "Mock-up and anchor pull-out tests on request", "Inspection stages, hold points and records"), u("quality"), "Quality"),
             ])),
            ("The section", "What You Will Find Here",
             h.cards([
                 ("Process", "How we deliver", "Routes A and B for engineering, submittals, mock-up, installation, site visits, tests, handover and warranty, including the steel substructure.", u("how-we-deliver"), "Open"),
                 ("Comparison", "Fixing systems", "Up-Down, pin, C-Channel, kerf rail, undercut and porcelain clips in one table: mechanism, use, thickness, limits.", u("fixing-systems"), "Open"),
                 ("Explainer", "Thickness and fixing", "Why 30 mm for edge fixings, what 20 mm marble or granite needs, the square law and published safety factors.", u("thickness-and-fixing"), "Open"),
                 ("QA/QC", "Quality", "Inspection and test stages, hold points, records, non-conformance and no substitution without approval.", u("quality"), "Open"),
                 ("Guide + PDF", "Maintenance and handover", "Inspection, cleaning and what not to do, with a guide to download in English and Arabic.", u("maintenance"), "Open"),
                 ("Reference", "Arabic–English glossary", "The fixing, testing and submittal terms used on site and in specifications, in both languages.", u("glossary"), "Open"),
                 ("DOCX", "Guide specification 04 42 00", "Exterior stone cladding, mechanically fixed: three options and blanks for the project values.", u("specification"), "Open"),
                 ("Form", "Send us your drawings", "Send elevations and the stone choice; we reply with suitable systems, published thickness guidance, likely substructure needs and a test list.", u("send-drawings"), "Open"),
                 ("Spec sheet", "Spec sheet and CAD request", "A one-page spec sheet to save as PDF or Excel, the mechanical versus wet fixing comparison, and the form to request CAD details and a method statement.", "/technical-specs/", "Open"),
             ])),
            ("Plain facts", "What We Install, Scope and Limits",
             h.prose(
                 h.h3("What we install"),
                 h.ul(
                     "Systems: Up-Down angles, pin (PEN) fixing, C-Channel, kerf rail and undercut anchors.",
                     "Undercut experience: Hilti undercut anchors on 30 mm natural stone and on 20 mm porcelain, on an ongoing commercial project for a major Saudi main contractor.",
                     "Brackets and angles: stainless steel or hot-dip galvanised steel, according to the project specification.",
                     f"Anchor and bolt sizes: {SIZES}.",
                     "Thickness: natural stone typically 30 mm, thicker on demand; marble and granite often 20 mm. Exterior 20 mm panels on edge fixings need the engineer's check and stone tests, or an undercut system.",
                     "Brands we can install: Hilti, fischer, Rockany, and local or imported accessories.",
                     "Warranty: a 5-year written workmanship warranty attested by the Chamber of Commerce, issued by the contracting company."),
                 h.h3("Scope and limits"),
                 h.p("Design is by the project engineer or consultant: we install to approved shop drawings, or appoint an independent facade engineer for the project. Brand names say what we can install; we hold no manufacturer certification. Sizes, wind values and stone strengths belong to each project's calculation and tests."))),
        ])

    # ------------------------------------------------------------------ 2. how we deliver
    P["how-we-deliver"] = dict(
        title="How We Deliver a Stone Facade | AL-Swati Contracting",
        desc="How AL-Swati delivers a mechanically fixed stone facade in Riyadh: two engineering routes, submittals, mock-up, steel substructure, tests, handover, warranty.",
        crumb="How we deliver", eyebrow="Process", h1="How We Deliver a Facade",
        lead="From the first drawing to the warranty certificate: who does the engineering, what we submit, how the steel substructure and the stone are installed, and what you receive at handover.",
        sections=[
            ("Scope", "What We Do",
             h.prose(h.p("We supply and install mechanically fixed natural stone (mainly Riyadh limestone), marble, granite and porcelain facades. We also install the steel substructure behind them, to the engineer's design. Installation is by our own team with a site supervisor.",
                         "The fixing systems we install are Up-Down angles, pin (PEN) fixing, C-Channel, kerf rail and undercut anchors. They are compared on the <a href=\"" + u("fixing-systems") + "\">fixing systems</a> page."))),
            ("Engineering", "Two Routes, Stated Openly",
             h.cards([
                 ("Route A", "We install to your approved shop drawings", "The consultant or the main contractor supplies approved shop drawings. We install to them and raise any site conflict before proceeding.", "", ""),
                 ("Route B", "We appoint an independent facade engineer", "For the project, the engineer prepares the design basis, wind loads per the current SBC 301, calculations for the steel substructure, shop drawings and a part list, and visits the site weekly.", "", ""),
             ]) + h.prose(h.p("On both routes the design belongs to the project engineer or consultant, and the installation follows the approved documents.",
                              "Under the Law of Practising Engineering Professions (Art. 8), accredited engineers write their name, professional grade and accreditation number on their engineering works {{sce}}. Wind loads are calculated for each project to the current SBC 301 {{sbc}}; the calculation states the code edition used."))),
            ("Step by step", "From Enquiry to Warranty",
             h.steps([
                 ("Enquiry and drawings", "We review the elevations, the stone, the backup wall and the heights, and say which fixing systems suit them. You can start with the <a href=\"" + u("send-drawings") + "\" style=\"color:var(--gold);text-decoration:underline\">send drawings</a> form.", ""),
                 ("Engineering route agreed", "Route A (your approved shop drawings) or Route B (an independent facade engineer appointed for the project) is fixed before pricing is final.", ""),
                 ("Material submittals and samples", "Stone samples that show the range, and data for the fixings, brackets and anchors, are submitted for approval. Bracket material is stainless steel or hot-dip galvanised steel, according to the project specification.", ""),
                 ("Mock-up", "Built from the approved materials and drawings, by the same crew, and kept as the benchmark once approved.", "On request"),
                 ("Setting out", "Grid and level lines are set and the wall is checked against the drawings before any anchor is drilled.", ""),
                 ("Steel substructure", f"Wall brackets, channels or frames are installed to the engineer's design. Anchor and bolt sizes are {SIZES}.", ""),
                 ("Anchor pull-out tests", "Arranged with the anchor manufacturer or a testing laboratory, and witnessed by the consultant.", "On request"),
                 ("Stone installation", "By our own team with a site supervisor, panel by panel to the approved drawings: fixing engagement, clearances and joints are checked as the work rises.", ""),
                 ("Engineer's site visits", "On projects where we appoint the engineer (Route B), the engineer visits the site weekly.", "Route B"),
                 ("Handover", "Final inspection and snagging with the consultant, the project records, and the <a href=\"" + u("maintenance") + "\" style=\"color:var(--gold);text-decoration:underline\">maintenance and handover guide</a>.", ""),
                 ("Warranty", "A 5-year written workmanship warranty attested by the Chamber of Commerce, issued by the contracting company.", ""),
             ])),
            ("Behind the stone", "The Steel Substructure",
             h.prose(
                 h.p("We install the steel substructure; the engineer designs it. These are the points a design basis for a substructure normally settles, with the published guidance behind them. They are general guidance, not project values."),
                 h.ul(
                     "<b>Wind.</b> Wind loads on the stone and its supports are calculated for each project to the current SBC 301, and the design pressures are stated on the documents {{sbc}}.",
                     "<b>Stiffness.</b> Stone tolerates very little movement of its support. ASTM C1242 treats a backup more flexible than L/600 as a case for a stone specialist {{c1242}}; the limit used is the engineer's decision.",
                     "<b>Anchors to concrete.</b> The steel of the bolt is only one check. A steel connection program does not prove the concrete side: pull-out, bond and splitting come from the anchor's own technical data {{idea}}. A separate anchor calculation for the actual product is part of the design.",
                     "<b>Hollow block.</b> Anchors in hollow masonry have low capacity in the maker's published data {{hilti_hy270}}, and one maker states it has no test data for the top of an ungrouted hollow wall {{hilti_block}}. Loadbearing brackets and frames go to reinforced concrete unless the engineer proves otherwise by tests.",
                     "<b>Corrosion protection.</b> Hot-dip galvanising is specified to a standard with a minimum coating thickness {{wedge}}; hollow sections need vent and drain holes {{ga_vent}}; site cuts and welds remove the zinc and are repaired by a named method {{aga_repair}}.",
                     "<b>Dissimilar metals.</b> Stainless fasteners on larger galvanised or carbon steel parts cause little problem; the reverse arrangement is the dangerous one. Where the joint can stay damp, the metals are separated with isolating washers or pads {{euroinox}}{{aga_ss}}.",
                     "<b>Movement.</b> Steel moves roughly two to two and a half times as much as stone with temperature {{nrc}}. Each member has a fixed point and sliding points, and the stone has movement joints where the engineer places them.",
                     "<b>Tolerances.</b> Structural steel tolerances are looser than stone tolerances {{aisc303}}, so the adjustment range is designed into the bracket between frame and stone."))),
            ("Your side", "What Helps Us Help You",
             h.prose(h.ul(
                 "Architectural elevations and wall sections (PDF or DWG), with building height and storey heights.",
                 "The stone or panel: type, finish, panel sizes and the thickness you have in mind.",
                 "The backup wall: reinforced concrete, solid block, hollow block or a mix.",
                 "The project specification section for stone cladding, if one exists. If not, our <a href=\"" + u("specification") + "\">guide specification</a> is a starting point.",
                 "Which engineering route you prefer, A or B."))),
        ])

    # ------------------------------------------------------------------ 3. fixing systems
    own = "<span class=\"fc-own\">One of the systems our team installs.</span>"
    P["fixing-systems"] = dict(
        title="Stone Fixing Systems Compared | AL-Swati Contracting",
        desc="Up-Down, pin, C-Channel, kerf rail, undercut and porcelain clip fixing compared: mechanism, best use, published thickness guidance, replaceability and limits.",
        crumb="Fixing systems", eyebrow="Comparison", h1="Fixing Systems Compared",
        lead="Six ways to hold a stone or porcelain panel on a facade, side by side. The thickness column reports published guidance, not a project value; the last column says what we have actually done.",
        sections=[
            ("One table", "Mechanism, Use, Thickness, Limits",
             h.table(
                 ["System", "Mechanism", "Best use", "Typical panel thickness (published guidance)", "Concealed or visible", "Replacing one panel", "Limits", "What we have done"],
                 [
                     ["Up-Down angle", "One angle with a split tongue: one half turns up into the panel above, the other down into the panel below {{bsi_bp}}.", "Low and medium rise, regular coursing, solid backup, stone of 30 mm and more.", "30 mm practical minimum, as for all edge fixings {{din}}; about 32 mm general minimum in US guidance {{nsi_vert}}.", "Concealed in the joint.", "Difficult: one bracket holds two panels. The industry guide prefers individual anchors {{bsi_bp}}.", "Edge slots weaken thin panels. The tongue must not rest on the panel below.", own],
                     ["Pin (PEN / dowel)", "A bracket carries a round pin that enters holes drilled in the edges of two adjacent panels. Bottom pins carry weight; top pins restrain against wind.", "The most common hand-set system for stone of 30 mm and more on concrete or solid masonry.", "30 mm for pin-fixed panels in the German rule read here (older edition) {{din}}; about 32 mm in US guidance {{nsi_vert}}.", "Concealed in the joint.", "Panels are fixed in sequence, so a single panel is hard to release.", "Needs enough stone on each side of the hole {{din}}{{hg}}; a sliding sleeve on one side; break-out strength proven by test, never by epoxy {{transbay}}.", own],
                     ["C-Channel", "Vertical steel channels on wall brackets and anchors. The stone brackets (pin, Up-Down or kerf clips) bolt to the channel.", "Hollow block or weak infill walls, large cavities, tall storeys: the channels span to the concrete.", "Set by the stone fixing used on the channel.", "Concealed behind the stone.", "As for the stone fixing used.", "Channels, brackets and anchors need calculation; fixed and sliding points per channel; site cuts in galvanised channels need coating repair {{aga_repair}}.", own],
                     ["Kerf rail", "The blade of a rail or clip sits in a sawn slot (kerf) along the top and bottom edges of the panel, locally or continuously {{c1242p}}.", "Regular grids of equal panels and rail-based ventilated facades.", "At least 10 mm of stone on each side of the groove in the German rule {{din}}; in practice 30 mm and more.", "Concealed in the joint.", "Limited: a broken local kerf cannot be repaired, the panel is replaced {{bsi_bp}}.", "Kerfs are cut in the workshop, not by hand grinder. No rigid epoxy fill: it has spalled stone through thermal expansion {{epoxy}}. Kerf damage can hide on the back face {{wje}}.", own],
                     ["Undercut anchor", "A hole with a widened base is drilled in the back of the panel; the anchor locks into it by shape. A hanger on the anchor hooks onto a horizontal rail {{hilti_hsu}}{{fischer_fzp}}.", "Thin hard stone, large panels, soffits and reveals, open-joint ventilated facades.", "From 20 mm for granite-type stone; 25 to 30 mm for limestone and sandstone in one maker's data {{hilti_hsu}}. Stoneware panels from 8 mm in one anchor's assessment {{keil}}.", "Fully concealed: nothing in the joints.", "Each panel hangs alone and can be replaced.", "Holes are drilled with the maker's machine and checked with its gauge. Stone not listed in the anchor's assessment needs tests {{hilti_hsu}}. Higher cost.", "<span class=\"fc-own\">Hilti undercut anchors on 30 mm natural stone and on 20 mm porcelain, on an ongoing commercial project for a major Saudi main contractor.</span>"],
                     ["Porcelain clip or edge groove", "Stainless clips hold the panel edges on vertical profiles: visible clips, or concealed clips in a milled edge groove {{laminam}}{{mirage}}.", "Porcelain and ceramic slabs on a ventilated substructure.", "By the slab maker's system: clips for thin meshed slabs; a concealed edge groove needs a 20 mm slab; undercut and kerf need 12 or 20 mm slabs in one maker's guide {{laminam}}{{mirage}}.", "Visible (clips) or concealed (edge groove).", "Depends on the maker's system.", "The panel maker's rules apply, not stone rules. No site-cut kerfs in thin slabs. Mesh backing keeps fragments in place if a panel breaks; it is not a fixing {{laminam}}{{iso17870}}.", "<span class=\"fc-own\">Porcelain facades are in our scope. Our undercut experience on 20 mm porcelain is noted above.</span>"],
                 ], wide=True)),
            ("Choosing", "What Usually Decides the System",
             h.prose(h.ul(
                 "<b>The backup wall.</b> Reinforced concrete takes brackets directly. Hollow block usually means channels or frames spanning to the concrete.",
                 "<b>The panel thickness.</b> Edge fixings (Up-Down, pin, kerf) need about 30 mm of stone. Thinner hard stone and porcelain point to undercut anchors or the panel maker's own system. See <a href=\"" + u("thickness-and-fixing") + "\">thickness and fixing</a>.",
                 "<b>Replaceability.</b> If single panels must be removable for maintenance, each panel needs its own fixings: undercut on rails does this.",
                 "<b>The joints.</b> Open-joint ventilated facades suit rail systems; sealed joints suit hand-set fixings.",
                 "<b>Evidence required.</b> For natural stone, the assessed fixings we found in published sources are undercut anchors {{eta_hilti}}{{eta_fischer}}; some porcelain panel systems hold their own assessments {{laminam}}."))),
            ("Materials and brands", "Brackets, Sizes and Names",
             h.prose(
                 h.p("Brackets and angles are stainless steel or hot-dip galvanised steel, according to the project specification. " + f"Anchor and bolt sizes are {SIZES}; we do not publish sizes."),
                 h.p("As general guidance, published sources recommend stainless steel for the parts in direct contact with the stone, such as pins, tongues and kerf blades {{hg}}{{bsi_bp}}{{nsi_vert}}. One of them accepts hot-dip galvanised parts only where they do not touch the stone {{bsi_bp}}. The project specification decides."),
                 h.p("We can install systems from Hilti, fischer and Rockany {{rockany}}, and local or imported accessories."))),
        ])

    # ------------------------------------------------------------------ 4. thickness and fixing
    P["thickness-and-fixing"] = dict(
        title="Stone Thickness and Fixing Guide | AL-Swati Contracting",
        desc="Why edge-fixed stone is 30 mm, what 20 mm marble or granite needs, porcelain and undercut, the bending square law, safety factors and the tests to ask for.",
        crumb="Thickness and fixing", eyebrow="Explainer", h1="Which Thickness, Which Fixing",
        lead="Panel thickness is not a habit; it follows from how the panel is held and how strong the stone is. This page explains the reasoning with published sources, and gives no project values.",
        sections=[
            ("Short answer", "What We Typically Install",
             h.prose(h.ul(
                 "Natural stone, mainly Riyadh limestone: typically 30 mm, thicker on demand.",
                 "Marble and granite: often 20 mm.",
                 "Exterior 20 mm panels on edge fixings (Up-Down, pin, kerf) need the engineer's check and stone tests, or an undercut system.",
                 "Porcelain: the thickness and the fixing come from the panel maker's system."),
                 h.p("Wind loads are calculated for each project to the current SBC 301 {{sbc}}, and the stone values come from tests on the actual stone. Nothing on this page replaces that calculation."))),
            ("Edge fixings", "Why 30 mm for Pin, Kerf and Up-Down",
             h.prose(
                 h.p("An edge fixing sits in a hole or slot cut into the panel edge. What holds the panel is the stone left on each side of that hole. Published rules set a minimum for it:"),
                 h.ul(
                     "The German rule read here (an older edition of DIN 18516-3) asks for at least 10 mm of stone on each side of a pin hole or groove, and 30 mm minimum thickness for pin-fixed panels {{din}}.",
                     "BS 8298-2, as reported by a stone engineer, asks for 12 mm on each side of a fixing mortice in strong stone and 25 mm in weaker stone, unless testing proves otherwise {{hg}}.",
                     "US industry guidance puts mechanically attached exterior panels at about 32 mm (1¼ in) as a general minimum {{nsi_vert}}."),
                 h.p("Add the hole to 10 mm of stone on each side and the result is 28 to 30 mm. That is why 30 mm is the practical floor for edge fixings, and why a 20 mm panel cannot meet these geometry rules."))),
            ("Bending", "The Square Law",
             h.prose(
                 h.p("Wind bends the panel between its fixings. For a strip of panel spanning a distance L between two lines of support under a pressure w, textbook beam theory gives the bending stress as:"),
                 h.math("stress = 0.75 × w × L² ÷ t²"),
                 h.p("The thickness t is squared. With the same panel and the same wind:")) +
             h.table(["Change in thickness", "Bending stress becomes"], [["30 mm to 25 mm", "1.44 times higher"], ["30 mm to 20 mm", "2.25 times higher"]]) +
             h.prose(h.p("This is a simplification for explanation. Real panels on four point fixings are analysed as plates, and the stone around each fixing is checked separately {{yates}}{{nsi_test}}. If either check fails, the answer is thicker stone, a smaller panel, more fixings or a different fixing type."))),
            ("Safety factors", "Published Ranges, Not One Number",
             h.prose(h.p("Stone varies from block to block, so the factors applied to its tested strength are large. Published values run from 3 to 8 and above, depending on the stone and the document:")) +
             h.table(["Source", "Factor on tested strength", "Note"], [
                 ["ASTM C1242 table (2016 edition preview) {{c1242p}}", "Granite 3; marble (soundness Group A) 5; limestone 6; sandstone 6; travertine 8", "Generally accepted values; the engineer may adjust them"],
                 ["Natural Stone Institute, limestone chapter {{nsi_lime}}", "8 for wind or seismic loads; 10 for concentrated loads", "Limestone"],
                 ["BS 8298 as reported in 2009 {{yates}}", "Between 3 and 6, depending on the part and on whether mean or lowest expected values are used", "To be checked against the current edition"],
                 ["DIN 18516-3, older edition {{din}}", "3 on a statistical lower-bound value from at least 10 tests", "Pin fixing and bending"],
                 ["Undercut anchor maker's design method {{hilti_hsu}}", "Partial factor 1.8 on stone resistance", "Limit-state format; not comparable one to one with the rows above"],
             ]) +
             h.prose(h.p("The factor used on a project is the engineer's decision under the code named in the specification. Wet strength can be lower than dry strength, and some finishes remove thickness {{yates}}{{nsi_lime}}."))),
            ("20 mm panels", "What 20 mm Marble or Granite Needs",
             h.prose(
                 h.p("Marble and granite are often installed at 20 mm. For exterior panels that is acceptable only when one of these is in place:"),
                 h.ol(
                     "<b>Edge fixing with proof.</b> The fixing is outside the published geometry rules above, so it is justified by tests of the fixing in the actual stone (ASTM C1354 or EN 13364, wet and dry) and by the engineer's calculation {{astm_list}}{{hg}}. Expect smaller panels and more fixings.",
                     "<b>An undercut system.</b> Undercut anchors with a European Technical Assessment are the documented route for hard stone at 20 mm, with stone-specific resistance from the assessment or from tests, four anchors per panel and gauge-checked holes {{hilti_hsu}}{{fischer_fzp}}.",
                     "<b>A thicker panel.</b>"),
                 h.p("Three more points from the published guidance:"),
                 h.ul(
                     "Epoxy or resin must not carry the load. A flexible connection is needed; rigid epoxy in kerfs has spalled stone through thermal expansion {{nsi_anchor}}{{epoxy}}.",
                     "Mesh on the back of stone is fragment retention and handling protection. We found no published source that lets it count toward panel strength.",
                     "Marble outdoors can bow and lose strength under repeated heating; in documented cases tests projected a large loss of bending strength {{thin_marble}}. A European test exists for it (EN 16306) {{en16306}}. For exterior marble in Riyadh sun, ask the engineer whether it is required."),
                 h.p("Limestone in undercut systems is a separate case: one maker's data sets 25 to 30 mm minimum for limestone and sandstone, and stone not listed in the assessment needs additional tests {{hilti_hsu}}. Our typical 30 mm limestone fits that range."))),
            ("Porcelain", "Porcelain Follows the Panel Maker",
             h.prose(h.ul(
                 "The fixing type depends on the slab thickness. In one slab maker's guide, thin slabs of about 3 to 6 mm use adhesive, clips, rivets or frames, while undercut and kerf fixing need the 12 or 20 mm slabs {{laminam}}.",
                 "An undercut anchor assessed for stoneware starts at 8 mm panel thickness, with at least four anchors per panel {{keil}}.",
                 "ISO/TS 17870-3 covers mechanical fixing of large-format porcelain: fixing systems, wind load factors, anchor pull-out and edge fracture tests, impact and anti-shatter mesh {{iso17870}}.",
                 "Wind and impact performance belongs to the tested combination of panel, fixing and substructure, not to the panel alone {{laminam}}.",
                 "Stone habits do not transfer: edge distances and hole depths come from the anchor's assessment."),
                 h.p("Our undercut experience on porcelain is with 20 mm panels on Hilti undercut anchors."))),
            ("Testing", "The Tests Consultants Ask For",
             h.table(["Property", "ASTM", "EN", "Why it is asked"], [
                 ["Absorption and density", "C97", "EN 13755, EN 1936", "Classifies the stone {{astm_list}}{{bre_ce}}"],
                 ["Compressive strength", "C170", "EN 1926", "Classifies the stone"],
                 ["Flexural strength", "C880", "EN 12372 or EN 13161", "The value used for panel bending; specimens at project thickness and finish {{iibec}}{{nsi_test}}"],
                 ["Modulus of rupture", "C99", "", "Small-prism bending strength used in the material specifications {{nsi_test}}"],
                 ["Strength at the fixing", "C1354", "EN 13364 (dowel hole)", "Measures the breaking load at the fixing in the actual stone; the engineer applies the safety factor {{hg}}"],
                 ["Petrography", "", "EN 12407", "Confirms what the stone is {{bre_ce}}"],
                 ["Marble bowing", "", "EN 16306", "Heat and moisture cycling of marble {{en16306}}"],
                 ["Anchors to the structure", "", "", "Site pull-out proof tests on the installed wall anchors {{cfa}}"],
             ]) +
             h.prose(h.ul(
                 "Reports should be current. US practice as reported asks for data less than three years old; a UK guide accepts older data if the quarry bed has not changed. The project specification decides {{iibec}}{{stonefed}}.",
                 "Flexural strength is tested wet and dry, and in both directions of the bedding where it matters {{iibec}}.",
                 "\"Riyadh limestone\" is a trade name covering several quarries and beds. The class and the design strength come from current tests on the actual source, which is why we publish no strength value."))),
        ])

    # ------------------------------------------------------------------ 5. quality
    P["quality"] = dict(
        title="Facade QA/QC: Inspections and Records | AL-Swati",
        desc="How AL-Swati controls quality on mechanically fixed stone facades: inspection and test stages, hold points, records, non-conformance and no substitution.",
        crumb="Quality", eyebrow="QA/QC", h1="Quality: Inspections, Hold Points, Records",
        lead="We build to the approved documents and ask for inspection before work is covered. This page lists the stages, what is recorded and what happens when something does not conform. Items marked on request are arranged when the project asks for them.",
        sections=[
            ("Principle", "Build to the Approved Documents",
             h.prose(h.ul(
                 "Work starts from approved shop drawings and approved material submittals.",
                 "Installation is by our own team with a site supervisor.",
                 "No substitution without approval: the stone source, the fixing type, the bracket material and the anchor product stay as approved unless the engineer or consultant approves a change in writing.",
                 "What will be hidden is inspected before it is hidden: anchors and substructure before stone."))),
            ("Stages", "Inspection and Test Stages",
             h.prose(h.p("A typical outline. Hold and witness points are agreed with the consultant in the project's inspection and test plan. H = hold (work stops until released), W = witness, R = review.")) +
             h.table(["Stage", "What is checked", "Record", "Consultant"], [
                 ["Documents", "Shop drawings and material submittals approved; current revision on site", "Approval references", "R / H"],
                 ["Stone delivery", "Type, finish, dimensions, thickness, visible cracks; match with the approved samples", "Material inspection request", "W"],
                 ["Fixings delivery", "Type and material (stainless or hot-dip galvanised steel as specified), supplier's documents", "Material inspection request", "W"],
                 ["Setting out", "Grid and level lines; wall checked against the drawings", "Survey record", "H"],
                 ["Anchors", "Position, drilling and installation to the anchor maker's instructions", "Work inspection request", "W"],
                 ["Pull-out tests <em>(on request)</em>", "Proof tests arranged with the anchor manufacturer or a testing laboratory", "Test report", "H"],
                 ["Substructure", "Line, level and plumb; fixed and sliding points; separation of dissimilar metals; coating repair", "Work inspection request", "H before stone"],
                 ["Mock-up <em>(on request)</em>", "Materials, fixings, joints and finish as approved", "Signed mock-up approval", "H"],
                 ["Stone installation", "Fixings per panel, engagement, clearances, shims; each panel carries its own weight", "Work inspection requests", "W, ongoing"],
                 ["Joints", "Widths, alignment, movement joints clean and continuous", "Work inspection request", "W"],
                 ["Completed elevation", "Plumb, level, joint width and lippage against the project tolerances", "Elevation sign-off", "H"],
                 ["Handover", "Cleaning, snagging, records and warranty", "Handover file", "R"],
             ])),
            ("Records", "What Is Kept",
             h.prose(h.p("Records kept where the project's inspection and test plan asks for them:"), h.ul(
                 "Approved shop drawings and material approvals.",
                 "Material and work inspection requests, with the consultant's comments.",
                 "Pull-out test reports, when tests are done.",
                 "For undercut anchors, the hole checks and tightening records that the anchor manufacturer's instructions require.",
                 "The engineer's site visit reports, on projects where we appoint the engineer.",
                 "Non-conformance reports and their close-out.",
                 "Photographs of anchors and substructure before the stone covers them."))),
            ("When it goes wrong", "Non-Conformance",
             h.steps([
                 ("Stop", "Work on the affected area stops when the supervisor, the engineer or the consultant finds something that does not match the approved documents.", ""),
                 ("Record", "A non-conformance report states what was found, where, and on which panels or anchors.", ""),
                 ("Propose", "The correction is proposed in writing. Where it changes a material, a fixing or a detail, it goes to the engineer or consultant for approval.", ""),
                 ("Correct and release", "The correction is carried out, inspected and signed before the area is released.", ""),
             ])),
            ("Tests and mock-up", "Arranged on Request",
             h.prose(
                 h.h3("Anchor pull-out tests"),
                 h.p("On request, pull-out tests on site are arranged with the anchor manufacturer or a testing laboratory, and witnessed by the consultant. The number of tests and the proof load are set by the engineer and the project specification."),
                 h.p("For reference, published UK practice to BS 8539 tests at least 2.5% of the anchors, and at least three in each area, at 1.5 times the design action; a failure increases the sample {{cfa}}. A test report is evidence for the engineer, not an approval in itself {{fischer_site}}."),
                 h.h3("Mock-up"),
                 h.p("On request, a mock-up is built from the approved materials and drawings by the same crew, inspected before the fixings are covered, and kept as the quality benchmark once approved. Guide specifications commonly require one before the work proceeds {{polycor}}{{transbay}}."),
                 h.h3("Material submittals and samples"),
                 h.p("Submitted for approval: stone samples that show the range, and the data for fixings, brackets and anchors."))),
            ("Scope", "Scope of This Page",
             h.prose(h.p("A test or a mock-up is recorded as done only where the project asked for it. The design, the acceptance criteria and the tolerances belong to the project engineer or consultant."))),
        ])

    # ------------------------------------------------------------------ 6. maintenance
    P["maintenance"] = dict(
        title="Stone Facade Maintenance & Handover Guide | AL-Swati",
        desc="Maintenance and handover guide for mechanically fixed stone and porcelain facades: inspection, cleaning, what not to do. PDF in English and Arabic.",
        crumb="Maintenance and handover", eyebrow="Guide", h1="Maintenance and Handover Guide",
        lead="A mechanically fixed facade needs little maintenance, but not none. This guide is for the owner and the facility team; consultants can attach it to the handover file.",
        sections=[
            ("Download", "The Guide as a PDF",
             h.dl("Stone Facade Maintenance and Handover Guide", "PDF, A4, November 2026. General guidance; the project engineer sets the inspection interval and any project-specific instruction.", [("English PDF", PDF_EN), ("Arabic PDF", PDF_AR)])),
            ("Handover", "What the Handover File Contains",
             h.prose(h.ul(
                 "A description of the facade: stone or panel types, the fixing system and the drawing references.",
                 "The approved shop drawings, and the project records agreed for handover.",
                 "Test reports, where tests were done.",
                 "The 5-year written workmanship warranty attested by the Chamber of Commerce, issued by the contracting company.",
                 "This maintenance guide, with the location of any spare panels kept for the building."))),
            ("Inspection", "Look at the Facade Regularly",
             h.prose(
                 h.p("The project engineer sets the inspection interval. As general guidance, look at the facade once a year and after any storm or impact, and check for:"),
                 h.ul("Cracked, chipped, displaced or loose panels.", "Joints that have opened, closed or lost their sealant.", "Rust-coloured or white stains running from a joint.", "Blocked ventilation openings at the base and top of the cavity.", "Anything fixed to the facade since handover: signs, lights, cables, cameras."),
                 h.p("Report anything on this list to the building's engineer and to us before repairing it. A stain or a moved panel is information about what is happening behind the stone."))),
            ("Cleaning", "Clean Gently",
             h.prose(h.ul(
                 "Remove dust with clean water and a soft brush.",
                 "Where a cleaner is needed, use a neutral one. Do not use acids or salt-based cleaners on limestone or marble {{bsi_bp}}.",
                 "Test any cleaner on a small hidden area first {{stoneworld}}.",
                 "Do not use high-pressure washing at close range.",
                 "Keep irrigation spray and water features off the facade."))),
            ("Do not", "What Not to Do",
             h.prose(h.ul(
                 "Do not drill into panels or fix anything to them (signs, lights, cables) without engineering approval.",
                 "Do not fill the ventilation gaps or open joints. Venting the cavity is part of how the facade works {{nsi_vert}}.",
                 "Do not replace a panel with a different stone, thickness or fixing without the engineer's approval.",
                 "Do not let trades lean ladders or scaffolding on unprotected panel edges."))),
            ("Repairs", "Replacing a Panel",
             h.prose(
                 h.p("How a panel is replaced depends on the system:"),
                 h.ul("<b>Undercut on rails:</b> each panel hangs alone and can be taken off and replaced on its own.", "<b>Pin, kerf and Up-Down:</b> the fixings sit in the joints and are shared with neighbours, so panels are released in sequence. This is work for the installer."),
                 h.p("Sealant joints, where the facade has them, have a limited life and are replaced when they crack or lose adhesion. Contact us for any replacement during or after the warranty period."))),
        ])

    # ------------------------------------------------------------------ 7. glossary
    G = [
        ("التثبيت الميكانيكي", "Mechanical fixing", "Holding each panel on metal fixings instead of bedding it in cement mortar."),
        ("تركيب الحجر", "Stone cladding (installation)", "Fixing stone panels to a facade or wall. In Saudi usage the work is called تركيب."),
        ("حجر الرياض (حجر جيري)", "Riyadh limestone", "A trade name for limestone from several quarries around Riyadh; properties come from tests on the actual source."),
        ("لوح", "Panel", "One piece of stone or porcelain as fixed on the wall."),
        ("السماكة", "Thickness", "Panel thickness, set by the fixing type and the tested strength of the stone."),
        ("الهيكل المعدني (الشاسيه)", "Substructure", "The steel or aluminium frame between the building and the stone fixings."),
        ("زاوية تثبيت", "Bracket / angle", "The metal part that connects the panel fixing to the wall or to the substructure."),
        ("زاوية Up-Down", "Up-Down angle (split-tail anchor)", "An angle with one tongue up into the panel above and one down into the panel below."),
        ("دبوس (PEN)", "Pin / dowel", "A round pin in holes drilled in the panel edges."),
        ("شق الحافة (Kerf)", "Kerf", "A slot sawn along the panel edge to receive a blade or tongue."),
        ("مجرى Kerf", "Kerf rail", "A rail whose blade sits in the kerf, locally or continuously."),
        ("مجرى C-Channel", "C-Channel", "A vertical steel channel that carries the stone brackets and spans between strong points."),
        ("مرساة Undercut", "Undercut anchor", "An anchor locked by shape into a widened hole in the back of the panel."),
        ("مشبك التعليق", "Hanger (agraffe)", "The clasp on an undercut anchor that hooks onto the horizontal rail."),
        ("تثبيت حامل", "Loadbearing fixing", "A fixing that carries the weight of the panel."),
        ("تثبيت ساند", "Restraint fixing", "A fixing that holds the panel against wind but carries no weight."),
        ("انكر", "Wall anchor", "The anchor that fixes a bracket to concrete or masonry."),
        ("اختبار السحب", "Pull-out test", "A site test that loads an installed anchor to a proof load."),
        ("نموذج تجريبي (Mock-up)", "Mock-up", "A sample area built before the work, approved as the benchmark."),
        ("المخططات التنفيذية", "Shop drawings", "Drawings that show every panel, fixing and detail as it will be built."),
        ("طلب اعتماد مواد", "Material submittal", "Data and samples submitted for the consultant's approval."),
        ("طريقة التنفيذ", "Method statement", "The written sequence and controls for the work."),
        ("خطة الفحص والاختبار", "Inspection and test plan (ITP)", "The list of checks, criteria, records and hold points."),
        ("نقطة توقف", "Hold point", "A stage where work stops until the consultant releases it."),
        ("نقطة حضور", "Witness point", "A stage the consultant is invited to witness."),
        ("تقرير عدم مطابقة", "Non-conformance report (NCR)", "The record of work that does not match the approved documents."),
        ("فاصل حركة", "Movement joint", "A joint that lets the facade move with temperature and the structure."),
        ("فاصل مفتوح", "Open joint", "A joint left unsealed in a ventilated facade."),
        ("فراغ مهوّى", "Ventilated cavity", "The air space behind the stone."),
        ("نقطة ثابتة / نقطة منزلقة", "Fixed point / sliding point", "Where a member is held, and where it is free to move with temperature."),
        ("رقائق ضبط", "Shims", "Thin packers used to adjust a bracket; stainless steel or plastic."),
        ("عازل بين المعادن", "Isolator", "A washer or pad that separates two different metals."),
        ("ستانلس ستيل", "Stainless steel", "Corrosion-resistant steel used for fixings."),
        ("مجلفن على الساخن", "Hot-dip galvanised", "Steel coated with zinc by dipping after fabrication."),
        ("أحمال الرياح", "Wind load", "Pressure and suction from wind, calculated for each project to SBC 301."),
        ("معامل الأمان", "Safety factor", "The factor applied to tested strength to obtain an allowable value."),
        ("مقاومة الانحناء", "Flexural strength", "The bending strength of the stone, from tests."),
        ("فرق المنسوب بين لوحين", "Lippage", "The step between the faces of two adjacent panels."),
        ("التفاوت المسموح", "Tolerance", "The permitted deviation in line, level, plumb and joint width."),
        ("التزهّر", "Efflorescence", "White salt deposits on the face, usually from cement mortar and moisture."),
        ("شبكة خلفية", "Back mesh", "Mesh bonded to the back of a panel to hold fragments if it breaks."),
        ("التقييم الفني الأوروبي", "European Technical Assessment (ETA)", "A published assessment of a construction product, such as an undercut anchor."),
        ("ضمان التنفيذ", "Workmanship warranty", "The installer's written warranty on the installation work."),
    ]
    P["glossary"] = dict(
        title="Stone Cladding Glossary: Arabic–English | AL-Swati",
        desc="Arabic–English glossary of mechanically fixed stone cladding terms: fixings, substructure, tests, submittals and quality words used on Riyadh projects.",
        crumb="Glossary", eyebrow="Reference", h1="Arabic–English Glossary",
        lead="The words used on site in Riyadh and the words used in specifications are not always the same. This glossary pairs them, so drawings, submittals and site instructions mean the same thing to everyone.",
        sections=[
            ("Terms", "Fixing, Testing and Submittal Terms",
             h.table(["English", "Arabic", "Meaning"], [[e, f'<span lang="ar" dir="rtl">{a}</span>', m] for a, e, m in G])),
            ("Note", "How We Use These Words",
             h.prose(h.p("System names such as Up-Down, PEN, C-Channel, Kerf and Undercut are used in Latin letters on Riyadh sites and in our documents, in both languages. Where a project specification defines a term differently, the specification governs."))),
        ])
    P["glossary"]["_G"] = G

    # ------------------------------------------------------------------ 8. specification
    P["specification"] = dict(
        title="Guide Specification 04 42 00 Stone Cladding | AL-Swati",
        desc="Download a guide specification for 04 42 00 Exterior Stone Cladding, mechanically fixed: three fixing options and blanks for project values. To be edited.",
        crumb="Guide specification", eyebrow="DOCX download", h1="Guide Specification 04 42 00",
        lead="A three-part guide specification for exterior stone cladding, mechanically fixed, written to be edited. It offers three fixing options and leaves blanks for every project value.",
        sections=[
            ("Download", "04 42 00 Exterior Stone Cladding – Mechanically Fixed",
             h.dl("04 42 00 Exterior Stone Cladding – Mechanically Fixed (Guide Specification)", "DOCX, English, November 2026. Guide only – to be edited by the specifier; project design by the project engineer.", [("Download DOCX", DOCX)]) +
             h.prose(h.p("<b>Guide only – to be edited by the specifier; project design by the project engineer.</b> The document is general guidance. It is not a design and not an offer. Square brackets mark blanks and choices; notes to the specifier are in italics and are deleted before issue."))),
            ("Options", "Three Fixing Options",
             h.table(["Option", "System", "Evidence it carries", "Typical use"], [
                 ["A · Economy / local", "Pin or Up-Down brackets, optionally on vertical C-channels, with locally available accessories", "Project calculation by the facade engineer; fixing tests in the project stone; material certificates per batch", "Stone of 30 mm and more on concrete or solid masonry"],
                 ["B · Engineered system", "A proprietary rail and bracket system with the system supplier's design", "The supplier's calculation, shop drawings and data sheets for the project", "Ventilated facades, weak infill walls, regular grids"],
                 ["C · Assessed undercut anchors", "Undercut anchors holding a European Technical Assessment, on horizontal rails", "The anchor's assessment and declaration of performance, with stone-specific resistance from the assessment or from tests {{eta_hilti}}{{eta_fischer}}", "Thin hard stone, porcelain, large panels, replaceable panels"],
             ]) +
             h.prose(h.p("The specifier keeps one option per stone type and deletes the others. An assessment describes the anchor; whether it covers a particular stone is confirmed with the manufacturer, and stone not listed needs tests {{hilti_hsu}}."))),
            ("Contents", "What the Document Covers",
             h.prose(
                 h.h3("Part 1 – General"),
                 h.p("Summary and related sections; references; definitions; performance requirements (delegated design by a qualified facade engineer, wind loads per the current SBC 301, dead load carried per panel, safety factors, deflection limits, movement, corrosion and separation of dissimilar metals, fire); submittals; quality assurance; pre-construction testing; delivery and storage; site conditions; warranty."),
                 h.h3("Part 2 – Products"),
                 h.p("Stone and porcelain panels; fixing system (Options A, B, C); anchors to the structure; steel substructure and its corrosion protection; accessories; fabrication; source quality control."),
                 h.h3("Part 3 – Execution"),
                 h.p("Examination; preparation; installation of anchors and substructure; installation of stone; joints; tolerances; field quality control with pull-out proof tests; cleaning and protection; schedule of stone types and fixing options."),
                 h.p("The structure follows the three-part format used in published guide and project specifications {{polycor}}{{transbay}}, and the content draws on the stone industry guidance cited across this section {{c1242}}{{nsi_vert}}{{bsi_bp}}{{hg}}."))),
            ("Blanks", "Project Values You Fill In",
             h.prose(h.ul(
                 "Code editions, wind parameters and design pressures from the project engineer.",
                 "Stone type, source, finish and thickness for each stone.",
                 "Safety factors and the standard they come from.",
                 "Deflection limits for the substructure and the backup.",
                 "Design temperature range and movement joint positions.",
                 "Bracket material: stainless steel grade, or hot-dip galvanised steel, and where each is used.",
                 "Number and proof load of site pull-out tests.",
                 "Tolerances, mock-up size and location, and warranty terms."),
                 h.p("If you would like us to read your draft against what we can build, use the <a href=\"" + u("send-drawings") + "\">send drawings</a> form and paste a link to it."))),
        ])

    # ------------------------------------------------------------------ 9. send drawings
    msgs = {"name": "Please write your name.", "company": "Please write your company or office.", "contact": "Please add an email or a phone number.", "phone": "Please check the phone number.", "email": "Please check the email.",
            "link": "Please check the link: it should start with https://", "sending": "Sending…", "sent": "✓ Request received{ref}. Thank you. Our technical contact will review it and reply by email or phone.", "ref": " (ref. {r})", "dup": "We already have a request from you today. Please send further drawings to info@al-swaticontracting.com or WhatsApp +966 51 182 6313.",
            "failed": "Could not send. Please email info@al-swaticontracting.com or WhatsApp +966 51 182 6313."}
    import json, html as _h
    form = f'''<div class="tc-req"><div class="fc-prose" style="margin-top:0">
<h3 style="margin-top:0">What the reply contains</h3>
<ul><li>The fixing systems that suit your stone, wall and height.</li><li>What published guidance says about thickness for your stone and fixing type.</li><li>Whether the wall is likely to need a substructure, for the engineer to confirm.</li><li>A list of the tests to ask for.</li></ul>
<p>The reply is indicative guidance from an installer. It is not a design, a calculation or a quotation; the project is designed by its engineer or consultant.</p>
<h3>No file upload on this site</h3>
<p>Paste a link to your drawings (Google Drive, OneDrive, Dropbox, WeTransfer or similar), or send the files directly:</p>
<ul><li>Email: <a href="mailto:info@al-swaticontracting.com?subject=Drawings%20for%20review">info@al-swaticontracting.com</a></li><li>WhatsApp: <a href="https://wa.me/966511826313" target="_blank" rel="noopener">+966 51 182 6313</a></li></ul>
</div>
<form class="tc-form fc-form" id="drawings-form" method="post" onsubmit="return false" novalidate data-msgs="{_h.escape(json.dumps(msgs, ensure_ascii=False), quote=True)}">
<div class="est-fields">
<label>Your name<input name="name" autocomplete="name" required maxlength="80"></label>
<label>Company / office<input name="company" autocomplete="organization" required maxlength="120"></label>
</div>
<div class="est-fields">
<label>Role<select name="role"><option value="Consultant / engineering office">Consultant / engineering office</option><option value="Architect">Architect</option><option value="Main contractor">Main contractor</option><option value="Developer / owner">Developer / owner</option><option value="Other">Other</option></select></label>
<label>Project location<input name="location" maxlength="120" placeholder="City, district"></label>
</div>
<div class="est-fields">
<label>Email<input name="email" type="email" autocomplete="email" maxlength="120" placeholder="name@company.com" dir="ltr"></label>
<label>Phone<input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="22" placeholder="05x xxx xxxx" dir="ltr"></label>
</div>
<p class="tc-hint" style="margin-bottom:0">Email or phone, at least one.</p>
<div class="est-fields">
<label>Project stage<select name="stage"><option value="Design stage">Design stage</option><option value="Tender / prequalification">Tender / prequalification</option><option value="Construction submittals">Construction submittals</option><option value="Other">Other</option></select></label>
<label>Stone / material<select name="material"><option value="">Not decided yet</option><option value="Riyadh limestone">Riyadh limestone</option><option value="Other natural stone">Other natural stone</option><option value="Marble">Marble</option><option value="Granite">Granite</option><option value="Porcelain">Porcelain</option><option value="More than one">More than one</option></select></label>
</div>
<div class="est-fields">
<label>Approximate area (m²)<input name="area" inputmode="numeric" maxlength="12" dir="ltr"></label>
<label>Link to your drawings<input name="link" type="url" inputmode="url" maxlength="300" placeholder="https://" dir="ltr"></label>
</div>
<div class="est-fields tc-full"><label>Message<textarea name="message" maxlength="1500" placeholder="Panel sizes, thickness in mind, backup wall, building height, what you would like us to look at."></textarea></label></div>
<button type="submit" class="btn btn-gold tc-send"><span>Send request</span><span class="arrow"></span></button>
<p class="est-note" role="status"></p>
<p class="est-fine">Your details are used only to answer this request. See the <a href="/privacy/">privacy notice</a>.</p>
<noscript><p class="est-fine">This form needs JavaScript. Please email or WhatsApp us.</p></noscript>
</form></div>'''
    P["send-drawings"] = dict(
        title="Send Us Your Facade Drawings | AL-Swati Contracting",
        desc="Send your facade drawings and stone choice to AL-Swati in Riyadh. We reply with suitable fixing systems, published thickness guidance and a list of tests.",
        crumb="Send us your drawings", eyebrow="Early-stage review", h1="Send Us Your Drawings",
        lead="At design stage a short answer from an installer saves redesign later. Send the elevations and the stone you have in mind, and we will tell you which systems fit, what published guidance says about thickness and which tests to ask for.",
        sections=[
            ("Request", "Tell Us About the Project", form),
            ("Useful to include", "What to Send",
             h.prose(h.ul(
                 "Elevations and typical wall sections, as PDF or DWG.",
                 "Building height and storey heights.",
                 "The stone or panel type, the finish and the panel sizes you would like.",
                 "The backup wall: reinforced concrete, solid block or hollow block.",
                 "The specification section for the stone, if it exists, and the stage of the project."),
                 h.p("If the specification is not written yet, the <a href=\"" + u("specification") + "\">guide specification</a> and the <a href=\"" + u("thickness-and-fixing") + "\">thickness and fixing</a> page are a good place to start."))),
        ])
    return P
