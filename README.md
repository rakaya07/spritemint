<div align="center">

# 🍃 SpriteMint

**Interactive Node.js CLI tool for Unity 2D developers**

[![npm version](https://img.shields.io/npm/v/spritemint.svg?style=flat-square)](https://npmjs.org/package/spritemint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg?style=flat-square)](https://nodejs.org/)
[![CLI Tool](https://img.shields.io/badge/CLI-Terminal-blue.svg?style=flat-square)](#)

*Normalize sprites and extract sprite sheets directly from the terminal — no GUI required.*

</div>

---

## 🚀 Demo

```bash
$ spritemint

  🍃 SpriteMint — Unity Sprite Processor

? What do you want to do?
❯ Normalize Sprites
  Extract Sprites from Sheet and Build Horizontal Output
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
- 🔍 **Flexible Detection**: Supports **Manual Grid** detection (row/col input) or **Auto Detect** (falls back to 2×2).
- ✂️ **Automatic Trimming**: Trims transparent edges from each extracted sprite automatically.
- 🔄 **Normalization**: Normalizes each extracted sprite into an equal-sized square canvas.
- 🎞️ **Horizontal Compositing**: Composites all sprites side-by-side into a single, seamless horizontal PNG strip, perfect for Unity animations.

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
git clone https://github.com/your-username/spritemint.git
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

? Sprite detection mode:
❯ Manual Grid

? Output cell size (px):
❯ 512

? Output filename: output-horizontal.png

  ✔ Done!

  Input    : /your/project/sheet_characters.png
  Mode     : Manual Grid
  Grid     : 2 rows × 2 cols
  Sprites  : 4
  Cell size: 512×512px
  Output   : /your/project/output-horizontal.png
  Canvas   : 2048×512px
```

---

## 🗺️ Visual Workflow

### Extracting & Building
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
[ NORMALIZED OUTPUT ]
  hero_idle.png   (512×512, centered on transparent canvas)
  hero_walk1.png
  hero_walk2.png
```

---

## 📂 Project Structure

```text
spritemint/
├── bin/
│   └── spritemint.js               # CLI entry point
├── src/
│   ├── index.js                    # Main menu & orchestration
│   ├── commands/
│   │   ├── normalize.js            # Flow: Normalize Sprites
│   │   └── extractHorizontal.js    # Flow: Extract & Composite
│   ├── core/
│   │   ├── normalizeSprites.js          # Logic: normalizing
│   │   └── extractAndBuildHorizontal.js # Logic: extraction & comp.
│   └── utils/
│       └── image.js                # Utilities (Sharp manipulation)
├── package.json
└── README.md
```

---

## 🛣️ Roadmap

We are constantly aiming to make `SpriteMint` better. Planned features include:

- [ ] **Advanced Auto Sprite Detection**: Automatically detect sprites in a sheet without a rigid grid (using alpha/pixel clustering).
- [ ] **GUI Version**: A standalone Desktop companion app (Electron/Tauri) for visual users.
- [ ] **WebP/GIF Support**: Output configurations for highly-compressed formats.
- [ ] **Custom Paddings & Offsets**: More granular controls over sprite placement on canvas.

---

## 🤝 Contributing

Contributions are completely welcome and encouraged! Here’s how you can help:

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
