"""Builds one PDF per example task into public/ejemplos, as a teacher would hand it out.

Usage (from defiendelo/): npm run examples:pdf
Reads the JSON printed by scripts/dump-examples.mjs on stdin. Requires reportlab.
"""

import json
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer

OUT = Path(__file__).resolve().parent.parent / "public" / "ejemplos"
INK = HexColor("#1f2430")
MUTED = HexColor("#5b6170")

course = ParagraphStyle("course", fontName="Helvetica", fontSize=10, textColor=MUTED, leading=14)
title = ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=18, textColor=INK, leading=23, spaceBefore=4, spaceAfter=8)
body = ParagraphStyle("body", fontName="Helvetica", fontSize=11, textColor=INK, leading=16, spaceAfter=10)
item = ParagraphStyle("item", parent=body, leftIndent=14, spaceAfter=3)
heading = ParagraphStyle("heading", parent=body, fontName="Helvetica-Bold", spaceAfter=4)


def block(text):
    """A handout block: its first line is the lead, the following lines are list items."""
    lines = text.split("\n")
    flow = [Paragraph(escape(lines[0]), heading if len(lines) > 1 else body)]
    flow += [Paragraph(escape(line), item) for line in lines[1:]]
    if len(lines) > 1:
        flow.append(Spacer(1, 8))
    return flow


def build(example):
    story = [
        Paragraph(escape(example["course"]), course),
        Paragraph(escape(example["title"]), title),
        HRFlowable(width="100%", color=MUTED, thickness=0.5, spaceAfter=12),
    ]
    for text in example["original"].split("\n\n"):
        story += block(text)
    doc = SimpleDocTemplate(
        str(OUT / example["file"]),
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2.5 * cm,
        topMargin=2.2 * cm,
        bottomMargin=2.2 * cm,
        title=example["title"],
        author="Defiéndelo (ejemplo)",
    )
    doc.build(story)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    examples = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    for example in examples:
        build(example)
        print(f"public/ejemplos/{example['file']}")


if __name__ == "__main__":
    main()
