# ✊ Rock Paper Scissors — The Arena

A modern, responsive browser version of the classic Rock Paper Scissors game. Play against the computer and be the first to reach **10 wins**!

## Features

- Play Rock Paper Scissors against the computer
- Random computer moves
- Live player and computer scores
- First-to-10 match format
- Round counter and round-by-round results
- Restart button
- Responsive layout for desktop and mobile
- Uses the project's original choice images, with emoji fallbacks

## Project structure

```text
Fun-game/
├── index.html
├── style.css
├── script.js
├── stone.png
├── paper.png
├── scissors.png
├── stone_paper_scissor.py
└── README.md
```

The original Python/Tkinter desktop version is kept in `stone_paper_scissor.py`. The browser version runs separately in the three web files.

## Run locally

No Python installation or build step is required for the web version.

1. Download or clone this repository.
2. Keep `index.html`, `style.css`, `script.js`, and the three PNG images in the same folder.
3. Open `index.html` in a browser.

For local development, you can also use the VS Code **Live Server** extension.

## Deploy on Vercel

1. Push the project to GitHub.
2. Sign in to [Vercel](https://vercel.com/) with GitHub.
3. Select **Add New → Project** and import this repository.
4. Set **Framework Preset** to `Other`.
5. Leave **Build Command** and **Install Command** empty.
6. Set **Output Directory** to `.` (the project root).
7. Click **Deploy**.

Vercel will serve `index.html` as the website homepage. Future pushes to the connected production branch will trigger new deployments.

## Game rules

- Rock beats Scissors.
- Scissors beats Paper.
- Paper beats Rock.
- Matching choices result in a tie and neither player gets a point.
- The first to reach 10 points wins the match.

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript

## Author

**Harshad Sontakke**

[GitHub profile](https://github.com/harshadsontakke7)
