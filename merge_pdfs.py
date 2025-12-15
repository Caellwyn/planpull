#!/usr/bin/env python3
"""Quick script to merge PDFs in input/ folder using PyMuPDF"""

import fitz  # PyMuPDF

input_dir = "input"
output_file = "input/merged_test.pdf"

# PDFs to merge
pdf_files = [
    f"{input_dir}/sample_materials_list.pdf",
    f"{input_dir}/Landscaping-Process-Layout.pdf",
]

# Create new PDF
merged = fitz.open()

for pdf_path in pdf_files:
    print(f"Adding: {pdf_path}")
    doc = fitz.open(pdf_path)
    merged.insert_pdf(doc)
    doc.close()

merged.save(output_file)
merged.close()

print(f"\nMerged {len(pdf_files)} PDFs into: {output_file}")
print(f"Total pages: {fitz.open(output_file).page_count}")
