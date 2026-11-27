#!/usr/bin/env python3
"""Writes the editable project templates of the consultants section into /downloads/:
  inspection and test plan (xlsx), anchor pull-out test record (xlsx),
  material submittal form, work inspection request, mock-up approval record (docx).
Every project value is a blank. The stage list of the ITP is read from the Quality page text (content_en.py),
so the template and the page cannot drift apart.
Run from the repository root:  python3 tools/consultants/make_templates.py   (needs python-docx and openpyxl)"""
import os, re, sys
from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, Cm, RGBColor
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(ROOT, "downloads"); sys.path.insert(0, HERE)
GOLD = "C9A74A"; DARK = "1A1A1A"; GREY = "F2F0EA"
NOTE = "Template. Edit for the project: the contract documents and the project engineer's requirements govern."
FOOT = "AL-Swati Contracting · al-swaticontracting.com · Template, November 2026"
thin = Side(style="thin", color="999999"); BOX = Border(left=thin, right=thin, top=thin, bottom=thin)


# ---------- xlsx ----------
def sheet(title, sub, head_fields, cols, rows, widths, notes, name, blank_rows=0):
    wb = Workbook(); ws = wb.active; ws.title = title[:31]
    n = len(cols)
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=n); c = ws.cell(1, 1, title); c.font = Font(bold=True, size=15, color="FFFFFF"); c.fill = PatternFill("solid", fgColor=DARK); c.alignment = Alignment(vertical="center", indent=1); ws.row_dimensions[1].height = 30
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=n); c = ws.cell(2, 1, sub); c.font = Font(size=10, color="555555"); c.alignment = Alignment(vertical="center", indent=1, wrap_text=True); ws.row_dimensions[2].height = 22
    r = 4; half = max(2, n // 2)
    for i in range(0, len(head_fields), 2):
        for j, f in enumerate(head_fields[i:i + 2]):
            c0 = 1 + j * half
            ws.cell(r, c0, f).font = Font(bold=True, size=10); ws.cell(r, c0).fill = PatternFill("solid", fgColor=GREY); ws.cell(r, c0).border = BOX
            ws.merge_cells(start_row=r, start_column=c0, end_row=r, end_column=c0 + 1); ws.cell(r, c0 + 1).border = BOX
            ws.merge_cells(start_row=r, start_column=c0 + 2, end_row=r, end_column=c0 + half - 1 if j == 0 else n)
            for k in range(c0 + 2, (c0 + half) if j == 0 else n + 1): ws.cell(r, k).border = BOX
        ws.row_dimensions[r].height = 20; r += 1
    r += 1; top = r
    for i, h in enumerate(cols, 1):
        c = ws.cell(r, i, h); c.font = Font(bold=True, size=10, color="FFFFFF"); c.fill = PatternFill("solid", fgColor=DARK); c.border = BOX; c.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
    ws.row_dimensions[r].height = 34; r += 1
    for row in rows + [[""] * n] * blank_rows:
        for i, v in enumerate(row, 1):
            c = ws.cell(r, i, v); c.border = BOX; c.alignment = Alignment(wrap_text=True, vertical="top"); c.font = Font(size=10)
        ws.row_dimensions[r].height = 46 if any(len(str(v)) > 40 for v in row) else 24; r += 1
    r += 1
    for t in notes + [NOTE, FOOT]:
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=n); c = ws.cell(r, 1, t); c.font = Font(size=9, italic=True, color="555555"); c.alignment = Alignment(wrap_text=True, vertical="top"); ws.row_dimensions[r].height = 28; r += 1
    for i, w in enumerate(widths, 1): ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = ws.cell(top + 1, 1); ws.page_setup.orientation = "landscape"; ws.page_setup.paperSize = 9; ws.page_setup.fitToWidth = 1; ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True; ws.print_title_rows = f"{top}:{top}"
    wb.save(os.path.join(OUT, name)); print("wrote", name)


def itp_rows():
    import build, content_en
    body = content_en.pages(build.H("en"))["quality"]["sections"][1][2]; rows = []
    for r in re.findall(r"<tr>([\s\S]*?)</tr>", body):
        c = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r"<t[hd][^>]*>([\s\S]*?)</t[hd]>", r)]
        if len(c) >= 4 and re.search(r"\b[HWR]\b", c[-1]): rows.append(c[:4])
    assert len(rows) >= 10, "quality stages not found"
    return rows


# ---------- docx ----------
def shade(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr(); shd = OxmlElement("w:shd"); shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto"); shd.set(qn("w:fill"), hexcolor); tcPr.append(shd)


def doc(title, ar_title, sub):
    d = Document(); s = d.sections[0]; s.left_margin = s.right_margin = Cm(1.8); s.top_margin = Cm(1.6); s.bottom_margin = Cm(1.6)
    st = d.styles["Normal"]; st.font.name = "Arial"; st.font.size = Pt(10)
    p = d.add_paragraph(); r = p.add_run(title.upper()); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = RGBColor(0x1A, 0x1A, 0x1A)
    p = d.add_paragraph(); r = p.add_run(ar_title); r.font.size = Pt(12); r.font.color.rgb = RGBColor(0x8A, 0x70, 0x2A)
    p = d.add_paragraph(); r = p.add_run(sub); r.font.size = Pt(9); r.italic = True; r.font.color.rgb = RGBColor(0x55, 0x55, 0x55)
    f = s.footer.paragraphs[0]; f.text = FOOT; f.alignment = WD_ALIGN_PARAGRAPH.CENTER; f.runs[0].font.size = Pt(8); f.runs[0].font.color.rgb = RGBColor(0x77, 0x77, 0x77)
    return d


def fields(d, pairs, cols=2):
    rows = (len(pairs) + cols - 1) // cols; t = d.add_table(rows=rows, cols=cols * 2); t.style = "Table Grid"; t.alignment = WD_TABLE_ALIGNMENT.CENTER; t.autofit = False
    for i, lab in enumerate(pairs):
        c = t.cell(i // cols, (i % cols) * 2); c.text = lab; c.paragraphs[0].runs[0].bold = True; c.paragraphs[0].runs[0].font.size = Pt(9); shade(c, GREY)
    for row in t.rows:
        row.height = Cm(0.8)
        for k, c in enumerate(row.cells): c.width = Cm(3.6 if k % 2 == 0 else 5.1)
    d.add_paragraph()


def heading(d, text):
    p = d.add_paragraph(); r = p.add_run(text); r.bold = True; r.font.size = Pt(11); p.paragraph_format.space_before = Pt(6); p.paragraph_format.space_after = Pt(3)


def checks(d, head, items, extra=("Yes", "No", "N/A", "Remarks")):
    t = d.add_table(rows=1 + len(items), cols=1 + len(extra)); t.style = "Table Grid"; t.autofit = False
    wide = 17.4 - 9.0; each = [1.5] * (len(extra) - 1) + [0]; each[-1] = wide - sum(each[:-1])
    if all(len(x) > 4 for x in extra): each = [wide / len(extra)] * len(extra)
    for k, h in enumerate((head,) + tuple(extra)):
        c = t.cell(0, k); c.text = h; c.paragraphs[0].runs[0].bold = True; c.paragraphs[0].runs[0].font.size = Pt(9); c.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255); shade(c, DARK)
    for i, it in enumerate(items, 1):
        t.cell(i, 0).text = it; t.cell(i, 0).paragraphs[0].runs[0].font.size = Pt(9.5)
    for row in t.rows:
        row.cells[0].width = Cm(9.0)
        for c, w in zip(row.cells[1:], each): c.width = Cm(w)
    d.add_paragraph()


def box(d, label, lines=3):
    heading(d, label); t = d.add_table(rows=1, cols=1); t.style = "Table Grid"; t.autofit = False; t.cell(0, 0).width = Cm(17.4); t.cell(0, 0).text = "\n" * lines; d.add_paragraph()


def signs(d, who):
    t = d.add_table(rows=4, cols=len(who)); t.style = "Table Grid"; t.autofit = False
    for row in t.rows:
        for c in row.cells: c.width = Cm(17.4 / len(who))
    for k, w in enumerate(who):
        c = t.cell(0, k); c.text = w; c.paragraphs[0].runs[0].bold = True; c.paragraphs[0].runs[0].font.size = Pt(9); shade(c, GREY)
        for i, lab in enumerate(("Name:", "Signature:", "Date:"), 1): t.cell(i, k).text = lab; t.cell(i, k).paragraphs[0].runs[0].font.size = Pt(9)
    for row in t.rows[1:]: row.height = Cm(0.9)
    p = d.add_paragraph(); r = p.add_run(NOTE); r.italic = True; r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0x55, 0x55, 0x55)


def save(d, name): d.save(os.path.join(OUT, name)); print("wrote", name)


def main():
    os.makedirs(OUT, exist_ok=True)
    # 1. inspection and test plan
    sheet("Inspection and Test Plan – Mechanically Fixed Stone Cladding", "H = hold (work stops until released) · W = witness · R = review. A typical outline: hold and witness points are agreed with the consultant for each project.",
          ["Project", "Contract no.", "Consultant", "Main contractor", "Specification section", "ITP no. / Rev. / Date"],
          ["No.", "Stage", "What is checked", "Record", "Consultant (H / W / R)", "Reference document / drawing", "Acceptance criteria (project)", "Contractor (sign / date)", "Consultant (sign / date)"],
          [[i + 1] + r + ["", "", "", ""] for i, r in enumerate(itp_rows())], [6, 22, 46, 24, 14, 24, 26, 18, 18],
          ["The stage list follows the outline on al-swaticontracting.com/for-consultants/quality/."], "al-swati-inspection-test-plan-stone-cladding.xlsx")
    # 2. pull-out test record
    sheet("Anchor Pull-Out Test Record", "Proof tests on installed wall anchors. The number of tests, the proof load and the acceptance criteria are set by the project engineer and the anchor maker's instructions.",
          ["Project", "Report no. / Date", "Location (elevation / level)", "Base material", "Anchor (maker, type, size)", "Test equipment / calibration ref."],
          ["Test no.", "Grid / position", "Anchor type and size", "Embedment (mm)", "Proof load specified (kN)", "Load applied (kN)", "Held for (min)", "Movement observed", "Result (pass / fail)", "Remarks"],
          [], [9, 18, 22, 13, 14, 13, 11, 16, 13, 28], ["Attach the calibration certificate of the test equipment and photographs of each test."], "al-swati-anchor-pull-out-test-record.xlsx", blank_rows=15)
    # 3. material submittal
    d = doc("Material Submittal", "طلب اعتماد مواد", "Mechanically fixed stone cladding · Specification section 04 42 00")
    fields(d, ["Project", "Submittal no.", "Contract no.", "Revision", "Main contractor", "Date", "Consultant", "Specification clause", "Subcontractor", "Drawing reference"])
    heading(d, "Item submitted (tick one)")
    checks(d, "Item", ["Stone / panel (type, source, finish, thickness)", "Stone fixings (brackets, pins, rails, clips)", "Wall anchors", "Steel substructure (channels, frame, wall brackets)", "Isolators, shims and fasteners", "Sealant and backing (where specified)", "Other:"], extra=("Tick", "Maker / source", "Model / grade"))
    heading(d, "Attached")
    checks(d, "Document", ["Product data sheets", "Test reports for the stone (source and date stated)", "Material certificates (steel grade, coating)", "Assessment or approval documents for anchors", "Samples (number and size)", "Shop drawings or details affected", "Compliance statement against the specification"], extra=("Yes", "No", "Reference"))
    box(d, "Deviations from the specification (state none if none)", 2)
    heading(d, "Consultant's action")
    checks(d, "Action", ["A – Approved", "B – Approved as noted", "C – Revise and resubmit", "D – Rejected"], extra=("Tick", "Comments"))
    signs(d, ["Submitted by (contractor)", "Reviewed by (consultant)"]); save(d, "al-swati-material-submittal-form.docx")
    # 4. work inspection request
    d = doc("Work Inspection Request", "طلب فحص أعمال", "Mechanically fixed stone cladding · Raised against the project inspection and test plan")
    fields(d, ["Project", "WIR no.", "Main contractor", "Revision", "Consultant", "Date raised", "Location (elevation / grid / level)", "Inspection date and time", "ITP stage", "Hold / witness point"])
    heading(d, "Work offered for inspection")
    checks(d, "Activity (tick the one offered)", ["Setting out: grid and level lines, wall checked against the drawings", "Anchors: position, drilling and installation to the maker's instructions", "Substructure: line, level and plumb; fixed and sliding points; separation of dissimilar metals; coating repair", "Stone installation: fixings per panel, engagement, clearances, shims", "Joints: widths, alignment, movement joints clean and continuous", "Completed elevation: plumb, level, joint width and lippage against the project tolerances"], extra=("Tick", "Drawing / detail ref."))
    heading(d, "Contractor's own check before the request")
    checks(d, "Check", ["Approved shop drawings, current revision, on site", "Materials as the approved submittals", "Previous inspection comments closed", "Access and lighting ready for inspection"])
    heading(d, "Consultant's result")
    checks(d, "Result", ["Accepted", "Accepted with comments", "Not accepted: re-inspection required"], extra=("Tick", "Comments"))
    signs(d, ["Requested by (contractor)", "Inspected by (consultant)"]); save(d, "al-swati-work-inspection-request.docx")
    # 5. mock-up approval
    d = doc("Mock-Up Approval Record", "محضر اعتماد النموذج التجريبي", "Mechanically fixed stone cladding · The approved mock-up is the benchmark for the work")
    fields(d, ["Project", "Record no.", "Main contractor", "Date of review", "Consultant", "Mock-up location", "Mock-up size (m × m)", "Drawing reference", "Stone / panel", "Finish", "Thickness (mm)", "Fixing system"])
    heading(d, "Items reviewed")
    checks(d, "Item", ["Stone type, colour range and finish against the approved samples", "Panel sizes and pattern", "Fixings: type, material and number per panel", "Substructure and wall anchors as the approved drawings", "Joint widths and alignment", "Corners, reveals and openings", "Flatness and lippage", "Cleaning and protection method"], extra=("Accepted", "Not accepted", "Remarks"))
    box(d, "Comments and agreed changes", 3)
    heading(d, "Decision")
    checks(d, "Decision", ["Approved as the benchmark", "Approved with the changes above", "Not approved: rebuild and review again"], extra=("Tick", "Remarks"))
    signs(d, ["Contractor", "Consultant", "Owner's representative"]); save(d, "al-swati-mock-up-approval-record.docx")


if __name__ == "__main__":
    main()
