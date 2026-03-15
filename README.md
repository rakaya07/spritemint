# SpriteMint — Unity Sprite CLI Processor

A lightweight, interactive Node.js CLI tool for Unity 2D developers.
Normalize sprites and extract sprite sheets directly from the terminal — no GUI required.

---

## Demo

```
$ spritemint

  SpriteMint — Unity Sprite Processor

? What do you want to do?
❯ Normalize Sprites
  Extract Sprites from Sheet and Build Horizontal Output
```

---

## Features

### 1. Normalize Sprites
- Scans a selected folder and presents PNG files in an interactive checkbox list
- Resizes each sprite so its largest side fits within the chosen canvas size (256 / 512 / 1024 / custom)
- Preserves aspect ratio — never stretches or distorts
- Centers each sprite on a transparent square canvas with equal padding on all four sides
- Saves results into a `normalized/` folder in the current working directory

### 2. Extract Sprites from Sheet and Build Horizontal Output
- Accepts a sprite sheet PNG selected from the current directory
- Supports **Manual Grid** detection (specify rows and columns) or **Auto Detect** (falls back to 2×2)
- Extracts each grid cell using exact pixel coordinates
- Trims transparent edges from each extracted sprite
- Normalizes each sprite into an equal-sized square canvas
- Composites all sprites side by side into a single horizontal PNG strip

**Example:**
A `1024×1024` sprite sheet containing 4 sprites in a 2×2 grid, processed with a cell size of `512`, produces a `2048×512` horizontal output.

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher

---

## Installation

### Global install (recommended)

```bash
npm install -g spritemint
```

Then run from any directory:

```bash
spritemint
```

### Local / development

```bash
git clone https://github.com/your-username/spritemint.git
cd spritemint
npm install
npm start
```

---

## Usage

### Normalize Sprites

Run SpriteMint from the folder containing your sprites, or a parent folder:

```
$ spritemint

? What do you want to do?
❯ Normalize Sprites

? Select folder containing PNG files:
❯ Use current folder
  sprites/
  assets/
  ──────────────
  Enter path manually

? Select PNG sprites to normalize (use space to select):
❯ ◯ hero_idle.png
  ◯ hero_walk1.png
  ◯ hero_walk2.png
  ◯ enemy.png

? Output sprite size:
❯ 256
  512
  1024
  Custom size

  ✔ Done! 4 sprites normalized.

  Output : /your/project/normalized
  Size   : 512×512px
  Files  : 4 processed
```

Processed files are saved to `./normalized/` in the directory where you ran the command.

---

### Extract Sprites from Sheet

```
$ spritemint

? What do you want to do?
❯ Extract Sprites from Sheet and Build Horizontal Output

? Select PNG file:
❯ sheet_characters.png
  sheet_tiles.png

? Sprite detection mode:
❯ Auto Detect
  Manual Grid

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

## Example Workflow

```
sheet_characters.png  (1024×1024, 2×2 grid)
          │
          ▼
      SpriteMint
  Extract → Normalize
          │
          ▼
output-horizontal.png  (2048×512)
```

Or for individual sprites:

```
sprites/
  hero_idle.png
  hero_walk1.png
  hero_walk2.png
          │
          ▼
      SpriteMint
      Normalize
          │
          ▼
normalized/
  hero_idle.png   (512×512, centered, transparent padding)
  hero_walk1.png
  hero_walk2.png
```

---

## Project Structure

```
spritemint/
├── bin/
│   └── spritemint.js               # CLI entry point (#!/usr/bin/env node)
├── src/
│   ├── index.js                    # Main menu
│   ├── commands/
│   │   ├── normalize.js            # Normalize Sprites — prompts & flow
│   │   └── extractHorizontal.js   # Extract & Build — prompts & flow
│   ├── core/
│   │   ├── normalizeSprites.js              # Image processing: normalize
│   │   └── extractAndBuildHorizontal.js     # Image processing: extract & composite
│   └── utils/
│       └── image.js                # Shared image utilities
├── package.json
└── README.md
```

---

## Dependencies

| Package    | Purpose                       |
|------------|-------------------------------|
| `sharp`    | Image processing              |
| `inquirer` | Interactive terminal prompts  |
| `chalk`    | Colored terminal output       |
| `ora`      | Spinner / progress indicator  |

---

## License

MIT
