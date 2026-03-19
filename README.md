<div align="center">

# 🍃 SpriteMint

**Interactive Node.js CLI tool for Unity 2D developers**

[![npm version](https://img.shields.io/npm/v/spritemint.svg?style=flat-square)](https://npmjs.org/package/spritemint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square)](https://nodejs.org/)
[![CLI Tool](https://img.shields.io/badge/CLI-Terminal-blue.svg?style=flat-square)](#)

*Normalize sprites, extract sprite sheets, and build new sprite sheets — directly from the terminal, no GUI required.*

</div>

---

## 🚀 Demo

```bash
$ spritemint

  🍃 SpriteMint — Unity Sprite Processor

? What do you want to do?
❯ Normalize Sprites
  Extract Sprites from Sheet and Build Horizontal Output
  Build Sprite Sheet from Selected PNGs
```

---

## 📖 Help

Not sure what to do? Just run:

```bash
spritemint --help
```

> You can also use the shorthand: `spritemint -h`

This will print a full usage guide directly in your terminal:

```
SpriteMint — Unity Sprite Processor

USAGE
  spritemint             Launch interactive menu
  spritemint --help      Show this help message
  spritemint -h          Show this help message

COMMANDS
  ┌─────────────────────────────────────────────────────────────────┐
  │  1. Normalize Sprites                                           │
  │     Resize PNGs to a square canvas with transparent padding.   │
  │     Aspect ratio is always preserved.                          │
  │     Output → <folder>/normalized/                              │
  ├─────────────────────────────────────────────────────────────────┤
  │  2. Extract Sprites from Sheet & Build Horizontal Output        │
  │     Extract frames from a grid-based sprite sheet,             │
  │     normalize each one, and stitch into a horizontal strip.    │
  │     Output → <folder>/output_horizontal.png                    │
  ├─────────────────────────────────────────────────────────────────┤
  │  3. Build Sprite Sheet from Selected PNGs                       │
  │     Pick individual PNGs and combine them into a sprite sheet. │
  │     Supports horizontal strip or grid layout.                  │
  │     Output → <folder>/spritesheet_output.png                   │
  └─────────────────────────────────────────────────────────────────┘

REQUIREMENTS
  Node.js v18+   |   PNG image files
```

---

## ✨ Features

### 1️⃣ Normalize Sprites
- 📂 **Interactive Selection**: Scans a folder and presents PNG files in an interactive checkbox list.
- 📐 **Smart Resizing**: Resizes each sprite so its largest side fits within the chosen canvas size (256, 512, 1024, or custom).
- 🖼️ **Aspect Ratio Preservation**: Never stretches or distorts your art.
- 🎯 **Perfect Centering**: Centers each sprite on a transparent square canvas with equal padding on all four sides.
- 💾 **Clean Output**: Saves results directly into a `normalized/` folder in your working directory.

### 2️⃣ Extract Sprites from Sheet & Build Horizontal Output
- 🧩 **Grid Extraction**: Accepts a sprite sheet PNG and extracts each grid cell using exact pixel coordinates.
- 🔍 **Smart Auto Detect**: Analyses image dimensions to find the most likely grid — prefers square, power-of-two cells. If detection fails, falls back to asking you for rows and columns.
- ✂️ **Automatic Trimming**: Trims transparent edges from each extracted sprite automatically.
- 🔄 **Normalization**: Normalizes each extracted sprite into an equal-sized square canvas.
- 🎞️ **Horizontal Compositing**: Composites all sprites side-by-side into a single, seamless horizontal PNG strip, perfect for Unity animations.
- 📂 **Subfolder Scanning**: Searches the current folder and its immediate subdirectories for PNG files.

### 3️⃣ Build Sprite Sheet from Selected PNGs
- ☑️ **Interactive File Picker**: Select any combination of PNG files from a folder using an interactive checkbox list.
- 🗂️ **Flexible Layouts**: Choose between a **Horizontal Strip** (all sprites in one row) or a **Grid** (specify columns, rows calculated automatically).
- 📏 **Configurable Cell Size**: Pick from 256, 512, or 1024 px — or enter a custom value.
- 🎯 **Auto-Centering**: Every sprite is trimmed, scaled to fit the cell, and centered with equal padding on all sides.
- 🖼️ **Transparent Canvas**: The output sheet is a fully transparent PNG — compositing-ready for Unity or any tool.
- 💾 **Saves to Working Directory**: Output filename is configurable (defaults to `sheet.png`) and is written to wherever you invoked the CLI.

---

## ⚙️ Installation

### Global Install (Recommended)

To run SpriteMint from anywhere on your machine, install it globally:

```bash
npm install -g spritemint
```

Then simply use the command:

```bash
spritemint
```

### Local / Development Setup

```bash
git clone https://github.com/rakaya07/spritemint.git
cd spritemint
npm install
npm start
```

---

## 🕹️ Usage Examples

### 1. Normalize Sprites

Run SpriteMint in your project folder, and it will guide you interactively:

```bash
$ spritemint

? What do you want to do?
❯ Normalize Sprites

? Select folder containing PNG files:
❯ Use current folder

? Select PNG sprites to normalize (use space to select):
❯ ◉ hero_idle.png
  ◉ hero_walk1.png
  ◉ hero_walk2.png

? Output sprite size:
❯ 512

  ✔ Done! 3 sprites normalized.

  Output : /your/project/normalized
  Size   : 512×512px
  Files  : 3 processed
```

### 2. Extract Sprites from Sheet

Perfect for converting existing grid sheets into Unity-friendly horizontal strips:

```bash
$ spritemint

? What do you want to do?
❯ Extract Sprites from Sheet and Build Horizontal Output

? Select PNG file:
❯ sheet_characters.png
  sprites/hero_sheet.png

? Sprite detection mode:
❯ Auto Detect

  ℹ Auto-detected grid: 2 rows × 2 cols

? Output cell size (px):
❯ 512

? Output filename: output-horizontal.png

  ✔ Done!

  Input    : /your/project/sheet_characters.png
  Mode     : Auto Detect
  Grid     : 2 rows × 2 cols
  Sprites  : 4 / 4
  Cell size: 512×512px
  Output   : /your/project/output-horizontal.png
  Canvas   : 2048×512px
```

> If Auto Detect cannot determine the grid (non-power-of-two dimensions), SpriteMint will automatically ask you to enter the row and column count manually.

### 3. Build Sprite Sheet from Selected PNGs

Combine individual PNG files into a new sprite sheet with full control over layout and cell size:

```bash
$ spritemint

? What do you want to do?
❯ Build Sprite Sheet from Selected PNGs

? Select folder containing PNG files:
❯ Use current folder

? Select PNG files to include (use space to select):
❯ ◉ hero_idle.png
  ◉ hero_run1.png
  ◉ hero_run2.png
  ◉ hero_run3.png

? Output layout:
❯ Grid

? Output cell size (px):
❯ 512

? Number of columns (4 images selected): 2

? Output filename: hero_sheet.png

  ✔ Done! Sprite sheet built from 4 images.

  Images   : 4 selected
  Layout   : Grid
  Grid     : 2 cols × 2 rows
  Cell     : 512×512px
  Output   : /your/project/hero_sheet.png
```

---

## 🗺️ Visual Workflow

### Normalizing Individual Sprites
```text
[ RAW SPRITES ]
  hero_idle.png
  hero_walk1.png
  hero_walk2.png
            │
            ▼
      🍃 SpriteMint
    Center & Normalize
            │
            ▼
[ NORMALIZED OUTPUT ]  normalized/
  hero_idle.png   (512×512, centered on transparent canvas)
  hero_walk1.png
  hero_walk2.png
```

### Extracting & Building a Horizontal Strip
```text
[ sheet_characters.png ]  (1024×1024, 2×2 grid)
            │
            ▼
      🍃 SpriteMint
    Extract → Normalize
            │
            ▼
[ output-horizontal.png ]  (2048×512 seamless strip)
```

### Building a Sheet from Selected PNGs
```text
[ INDIVIDUAL PNGs ]
  hero_idle.png
  hero_run1.png   ─────────┐
  hero_run2.png             │  🍃 SpriteMint
  hero_run3.png   ─────────┘  Select → Layout → Composite
                              │
                              ▼
              [ hero_sheet.png ]  (1024×1024, 2×2 grid)
```

---

## 📂 Project Structure

```text
spritemint/
├── bin/
│   └── spritemint.js                    # CLI entry point
├── src/
│   ├── index.js                         # Main menu & orchestration
│   ├── commands/
│   │   ├── normalize.js                 # Flow: Normalize Sprites
│   │   ├── extractHorizontal.js         # Flow: Extract & Composite
│   │   └── buildSheet.js                # Flow: Build Sprite Sheet
│   ├── core/
│   │   ├── normalizeSprites.js          # Logic: normalizing
│   │   ├── extractAndBuildHorizontal.js # Logic: extraction & compositing
│   │   └── buildSpriteSheet.js          # Logic: sheet building
│   └── utils/
│       ├── folder.js                    # Shared folder/file selection prompts
│       └── image.js                     # Shared image processing & SIZE_CHOICES
├── package.json
└── README.md
```

---

## 🛣️ Roadmap

We are constantly aiming to make `SpriteMint` better. Planned features include:

- [x] **Grid Auto Detection**: Detects grid layout from image dimensions (power-of-two cell analysis). Falls back to manual input if detection fails.
- [ ] **Advanced Auto Sprite Detection**: Detect sprites without a rigid grid (using alpha/pixel clustering).
- [ ] **GUI Version**: A standalone Desktop companion app (Electron/Tauri) for visual users.
- [ ] **WebP/GIF Support**: Output configurations for highly-compressed formats.
- [ ] **Custom Paddings & Offsets**: More granular controls over sprite placement on canvas.

---

## 🤝 Contributing

Contributions are completely welcome and encouraged! Here's how you can help:

1. **Fork** the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a **Pull Request**.

All issues and PRs are appreciated to make this tool better for the open source and game developer community.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

<div align="center">
  <i>Built with ❤️ for Game Developers & the Unity Community.</i>
</div>
