#!/usr/bin/env python3
"""Build the ICIBM 2026 Ontology-Applications deck from Sayed's VDOS deck.

Approach: start FROM the VDOS file rather than a blank presentation, so the
theme, masters, figures and screenshots survive untouched. Then curate the slide
list, retitle for this talk, and insert the ontology-depth material that the
VDOS deck predates.

Why not build from blank: the existing decks carry screenshots and diagrams that
would be lost, and rebuilding the brand theme by hand is exactly the trap in
concept/python-pptx-template-ships-sample-slides. Copy-and-curate keeps every
existing asset and touches only what changes.

The new content is this session's ontology-depth work, which is the part
specific to an ontology-applications audience:
  - ontology TERMS vs ontology STRUCTURE (the audit)
  - INO: matched phrases -> ontology classes (before/after)
  - annotation is already multi-ontology (INO + MI + GO)
  - DOID: classifier filtering by structure, not by a name list
  - VO: class-level subsumption already running in Vignet
  - data quality: obsolete classes, versioned annotation

Usage:
    python3 scripts/build_icibm_deck.py \
        --source presentations/ICIBM2026/VDOS_2026_Workshop_Ignet2_Vignet_FullPaper_Slide_SA_HR_v2.1.pptx \
        --out    presentations/ICIBM2026/ICIBM2026_Ignet2_Vignet_Ontology_JHur_v1.pptx
"""
from __future__ import annotations

import argparse

from pptx import Presentation
from pptx.util import Pt

# Content layout on master 2. idx 0 = title, idx 15 = bulleted body.
BULLET_LAYOUT = (2, 3)

# VDOS slides to carry over, in source order, with why each earns its place.
# (1-based source index, short note)
KEEP = [
    (1,  "title - rewritten below"),
    (2,  "talk roadmap"),
    (3,  "literature mining challenges + gap"),
    (4,  "objectives"),
    (5,  "dual platform: Ignet 2.0 + Vignet"),
    (8,  "integrated ontologies - amended below"),
    (9,  "semantic database architecture"),
    (10, "Ignet 2.0 platform overview"),
    (11, "Ignet 2.0 gene interaction discovery"),
    (12, "Vignet platform overview"),
    (13, "Vignet vaccine-focused exploration"),
    (14, "programmatic access: REST + MCP"),
    (16, "use case: LLM knowledge discovery via MCP"),
    (17, "use case: AI-assisted vaccine discovery"),
    (18, "platform benchmarking"),
    (19, "conclusion"),
    (20, "future directions"),
    (21, "acknowledgement"),
    (22, "availability"),
    (23, "questions"),
]

# New slides, each inserted AFTER the given source slide number once the deck
# has been curated. Body lines: (text, indent_level).
NEW_SLIDES = [
    {
        "after": 8,
        "title": "Ontology Depth: Terms vs. Structure",
        "body": [
            ("The question is not WHICH ontologies are integrated, but whether "
             "their STRUCTURE is used.", 0),
            ("VO — structural: is_a hierarchy drives class-level queries", 0),
            ("INO — was vocabulary only: identifiers stored but unused", 0),
            ("DOID — was vocabulary only: diseases as free text", 0),
            ("This talk: what changed when we used the structure "
             "we already had.", 0),
        ],
    },
    {
        "after": 8,
        "title": "Annotation Is Already Multi-Ontology",
        "body": [
            ("The 166 interaction classes in use span three ontologies:", 0),
            ("86 INO  ·  57 MI (PSI Molecular Interactions)  ·  23 GO", 1),
            ("Plus 15 INO_T* template artifacts — not ontology classes, "
             "excluded by namespace rather than by a stopword list.", 0),
            ("Interaction typing is already an ontology ENSEMBLE; naming only "
             "INO understates the semantic layer in place.", 0),
        ],
    },
    {
        "after": 9,
        "title": "INO: Phrases to Ontology Classes",
        "body": [
            ("Every annotation already carried an INO identifier (54.7M rows), "
             "but views grouped on the matched PHRASE.", 0),
            ("INO_0000157 alone spans 69 phrases: 'effects', 'effect', 'changes'", 1),
            ("BEFORE — top 'interaction types':", 0),
            ("associated · effects · induced · expression · including", 1),
            ("AFTER — by ontology class:", 0),
            ("regulation 11.8M · increase 4.1M · association 3.4M · "
             "induction 3.1M", 1),
            ("Same data. The semantics were already in the identifiers.", 0),
        ],
    },
    {
        "after": 9,
        "title": "DOID: Classifiers by Structure",
        "body": [
            ("Over-broad disease terms were removed by a hand-written list: "
             "{ disease, syndrome, disorder }", 0),
            ("'disease' is DOID:4 — the ROOT — filtered by its label. The list "
             "missed 'cancer' (1.3M) and 'carcinoma' (244k).", 0),
            ("Depth fails too: 'fibromyalgia' is level 2, same as 'cancer'.", 0),
            ("Transitive descendant count separates them:", 0),
            ("disease 12,220 · cancer 2,160 · carcinoma 622  ||  "
             "breast cancer 86 · fibromyalgia 0", 1),
            ("Structure removes 4.70M classifier annotations vs 3.07M by name, "
             "dropping no real diagnosis.", 0),
        ],
    },
    {
        "after": 13,
        "title": "VO: Class-Level Reasoning in Vignet",
        "body": [
            ("Selecting a vaccine class retrieves evidence for its is_a "
             "descendants — subsumption, on by default.", 0),
            ("'viral vaccine' aggregates 239 data-bearing descendants; "
             "'cancer vaccine' 66", 1),
            ("6,796 VO classes, subtree-closed, so parent classes stay "
             "meaningful selections rather than dead ends.", 0),
            ("A question asked at the level the researcher thinks in, answered "
             "from evidence indexed far below it.", 0),
        ],
    },
    {
        "after": 18,
        "title": "Ontology Hygiene",
        "body": [
            ("Using structure surfaces quality signals that flat term matching "
             "hides:", 0),
            ("6 of 23 referenced GO classes are OBSOLETE", 1),
            ("2,514 of 14,735 DOID terms are obsolete", 1),
            ("An identifier is not self-validating — it must resolve against a "
             "VERSIONED ontology release to be trusted.", 0),
            ("Annotation pipelines should record the ontology version used, "
             "and re-resolve on refresh.", 0),
        ],
    },
]

TITLE_MAIN = ("From Biomedical Ontologies to Knowledge Discovery:\n"
              "Ontology-Driven Applications in Ignet 2.0 and Vignet")
TITLE_SUB = (
    "Junguk Hur, PhD\n"
    "Associate Professor, Department of Biomedical Sciences\n"
    "University of North Dakota\n"
    "\n"
    "ICIBM 2026 — Ontology Applications\n"
    "\n"
    "Sayed Asaduzzaman, Benu Bansal, Parker Combs, Jie Zhang, Hasin Rehana,\n"
    "Brett McGregor, Yongqun He   ·   Supported by NIAID U24AI171008"
)


def add_bullet_slide(prs, title: str, body: list[tuple[str, int]]):
    master = list(prs.slide_masters)[BULLET_LAYOUT[0]]
    layout = master.slide_layouts[BULLET_LAYOUT[1]]
    slide = prs.slides.add_slide(layout)

    slide.shapes.title.text = title
    # The brand band fits ONE line; LibreOffice render showed 2-line titles
    # clipped at the band edge. Cap the size and disable autofit growth.
    title_tf = slide.shapes.title.text_frame
    title_tf.word_wrap = True
    for para in title_tf.paragraphs:
        for run in para.runs:
            run.font.size = Pt(26)

    body_ph = None
    for ph in slide.placeholders:
        if ph.placeholder_format.idx == 15:
            body_ph = ph
            break
    if body_ph is None:  # layout drift: fall back to any BODY placeholder
        body_ph = next(
            ph for ph in slide.placeholders if ph.placeholder_format.idx != 0
        )

    tf = body_ph.text_frame
    tf.word_wrap = True  # python-pptx re-centres without this
    tf.clear()
    for i, (text, level) in enumerate(body):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.text = text
        para.level = level
        size = 16 if level == 0 else 14 if level == 1 else 12
        for run in para.runs:
            run.font.size = Pt(size)
    return slide


def set_title_slide(prs) -> None:
    """Rewrite the title slide for this talk.

    The source title slide carries THREE text frames: headline, author block and
    a superscript affiliations list. Setting only the first two leaves the third
    in place, and the render showed the new subtitle drawn straight over it. Any
    frame beyond the two we own is emptied.
    """
    slide = prs.slides[0]
    frames = [sh for sh in slide.shapes
              if sh.has_text_frame and sh.text_frame.text.strip()]
    if not frames:
        return
    frames.sort(key=lambda sh: sh.top or 0)

    frames[0].text_frame.word_wrap = True
    frames[0].text_frame.text = TITLE_MAIN
    for para in frames[0].text_frame.paragraphs:
        for run in para.runs:
            run.font.size = Pt(30)

    if len(frames) > 1:
        tf = frames[1].text_frame
        tf.word_wrap = True
        tf.text = TITLE_SUB
        for para in tf.paragraphs:
            for run in para.runs:
                run.font.size = Pt(13)

    # Clear every remaining frame so nothing from the source deck shows through.
    for extra in frames[2:]:
        extra.text_frame.clear()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--source", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    prs = Presentation(args.source)
    original_count = len(prs.slides)

    # ORDER MATTERS: add new slides BEFORE dropping any.
    # add_slide derives its partname from the current slide count, so dropping
    # first frees numbers that retained slides still occupy -- the new parts then
    # collide (observed: duplicate ppt/slides/slide21..23.xml in the saved zip,
    # which PowerPoint reports as a file needing repair). Appending while the
    # deck is still full-length forces fresh partnames.
    keep_indices = [idx for idx, _ in KEEP]
    added: list[tuple[int, int]] = []  # (source anchor, position appended at)
    for spec in NEW_SLIDES:
        add_bullet_slide(prs, spec["title"], spec["body"])
        added.append((spec["after"], len(prs.slides) - 1))

    # Desired final order, expressed as positions in the CURRENT deck.
    order: list[int] = []
    for src in keep_indices:
        order.append(src - 1)
        for anchor, pos in added:
            if anchor == src:
                order.append(pos)

    # Rebuild sldIdLst in that order; anything absent is dropped along with its
    # relationship, so no orphan parts are left behind.
    id_list = prs.slides._sldIdLst
    entries = list(id_list)
    keep_set = set(order)
    for entry in entries:
        id_list.remove(entry)
    for pos in order:
        id_list.append(entries[pos])
    for pos, entry in enumerate(entries):
        if pos not in keep_set:
            prs.part.drop_rel(entry.rId)

    set_title_slide(prs)
    prs.save(args.out)

    print(f"source slides : {original_count}")
    print(f"kept          : {len(keep_indices)}")
    print(f"new slides    : {len(NEW_SLIDES)}")
    print(f"final         : {len(prs.slides)}")
    print(f"written       : {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
