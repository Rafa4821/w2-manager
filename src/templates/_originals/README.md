# Original Templates — Analysis Folder

Place each original template PDF in its own subfolder here for analysis:

```
_originals/
├── template-01/
│   ├── original.pdf
│   └── notes.md          ← analysis notes, dimensions, field coordinates
├── template-02/
│   ├── original.pdf
│   └── notes.md
└── ...
```

## Workflow

1. Drop the PDF into a numbered subfolder
2. Analyze: page dimensions, grid structure, fonts, fixed vs variable elements
3. Create the implementation in `src/templates/<template-name>/`
4. Compare render against original
5. Validate and integrate before moving to the next template

## Rules

- Complete template N before starting template N+1
- Do not commit original PDFs if they contain copyrighted form designs
- Use only fictitious data in all previews and tests
- Fixed elements: lines, borders, headers, labels, logos
- Variable elements: names, SSN, EIN, amounts, years, addresses
