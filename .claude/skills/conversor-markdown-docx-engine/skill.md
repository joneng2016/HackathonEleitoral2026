---
name: conversor-markdown-docx-engine
description: Skill de automação que lê arquivos Markdown em UTF-8 e os compila programaticamente em documentos Word (.docx) formatados segundo as normas da ABNT via Scripts PowerShell, Node.js e Python.
tools:
  - Read
  - Write
  - Edit
  - Bash
---

# SKILL: CONVERSOR MARKDOWN PARA DOCX (UTF-8 / ABNT)

## OBJETIVO DA SKILL
Executar a conversão direta de um arquivo Markdown (`.md`) codificado em **UTF-8** para um documento Microsoft Word (`.docx`), aplicando programaticamente as normas da ABNT (NBR 14724, NBR 6024, NBR 10520, NBR 6023).

---

## ESPECIFICAÇÕES TÉCNICAS ABNT (UNIDADES DE MEDIDA)
Ao manipular a estrutura OpenXML ou bibliotecas de manipulação de `.docx`, a skill deve aplicar exatamente as seguintes medidas:

- **Margem Esquerda / Superior:** 3,0 cm (`1701 TWIPS` / `1.181 in`)
- **Margem Direita / Inferior:** 2,0 cm (`1134 TWIPS` / `0.787 in`)
- **Recuo de Primeira Linha (Parágrafo):** 1,25 cm (`708 TWIPS` / `36 pt`)
- **Recuo de Citação Longa:** 4,0 cm da margem esquerda (`2268 TWIPS` / `113.4 pt`)
- **Espaçamento de Linhas:** 1,5 (`360 TWIPS` no XML)
- **Fonte Padrão:** Times New Roman ou Arial, tamanho 12 pt (`24 half-points`)
- **Fonte Secundária (Citações Longas / Notas / Legendas):** Tamanho 10 pt (`20 half-points`), espaçamento simples

---

## EXECUÇÃO E AUTOMAÇÃO MULTI-STACK

A skill detecta o ambiente e executa o script mais adequado utilizando a ferramenta `Bash`.

### Opção A: Python (`python-docx` + `utf-8`)

```python
import sys
import re
from docx import Document
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

def convert_md_to_docx(input_md: str, output_docx: str):
    # Leitura estrita em UTF-8 sem BOM
    with open(input_md, 'r', encoding='utf-8-sig') as f:
        md_text = f.read()

    doc = Document()

    # Configuração de Páginas e Margens
    for section in doc.sections:
        section.top_margin = Cm(3.0)
        section.left_margin = Cm(3.0)
        section.bottom_margin = Cm(2.0)
        section.right_margin = Cm(2.0)
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)

    # Estilo Padrão (Normal)
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = RGBColor(0, 0, 0)
    p_format = style_normal.paragraph_format
    p_format.line_spacing = 1.5
    p_format.first_line_indent = Cm(1.25)
    p_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Processamento simples de linhas
    lines = md_text.splitlines()
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        
        # Citação Longa (Markdown Blockquote '>')
        if stripped.startswith('>'):
            p = doc.add_paragraph(stripped.lstrip('> ').strip())
            p.paragraph_format.left_indent = Cm(4.0)
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.line_spacing = 1.0
            p.runs[0].font.size = Pt(10)
        # Títulos
        elif stripped.startswith('#'):
            level = len(stripped.split()[0])
            text = stripped.lstrip('#').strip()
            p = doc.add_paragraph()
            run = p.add_run(text)
            run.bold = True
            p.paragraph_format.first_line_indent = Cm(0)
            p.paragraph_format.space_before = Pt(12)
            p.paragraph_format.space_after = Pt(6)
        # Parágrafo Comum
        else:
            doc.add_paragraph(stripped)

    doc.save(output_docx)

if __name__ == "__main__":
    convert_md_to_docx(sys.argv[1], sys.argv[2])