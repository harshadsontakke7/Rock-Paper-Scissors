# ⚡ Rock Paper Scissors — The Cyber Arena
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

An electrifying, responsive web adaptation of the classic **Rock Paper Scissors** showdown with dynamic cyber themes, retro synth sound effects, win streak tracking, and a first-to-10 championship format.

---

### 🎮 Live Demo
> **[👉 Click Here to Play the Live Game on Vercel](https://rock-paper-scissors-mu-hazel.vercel.app/)**  
> *(Replace `https://your-project-name.vercel.app` with your actual Vercel deployment link!)*

---

## 🌟 Key Features

- 🎨 **Multi-Theme Engine:** Toggle live between 4 aesthetic color themes:
  - ⚡ **Cyber Neon** (Electric cyan & vibrant violet neon)
  - 🌌 **Deep Space** (Cosmic navy & nebula indigo)
  - 🌅 **Sunset Retro** (Vaporwave coral & golden amber)
  - 🍃 **Matrix Code** (Cyber terminal green)
- 🔊 **Synthesizer Sound Effects:** Built-in retro arcade audio via the browser's Web Audio API (zero audio download lag, with instant mute toggle).
- 🏆 **First-to-10 Championship:** Visual progress bars track who is closest to taking the trophy.
- 🔥 **Win Streak Counter:** Rewards consecutive victories against the AI bot.
- 🎉 **Victory Celebration:** Confetti burst animation upon reaching 10 wins.
- 📱 **Mobile & Desktop Responsive:** Fully optimized touch controls and keyboard accessibility.
- 💾 **Local Persistence:** Remembers your selected theme and audio preferences between visits.

---

## ❓ Why is `stone_paper_scissor.py` Not Running on Vercel?

If you are wondering why your Python file (`stone_paper_scissor.py`) isn't running on your Vercel deployment, here is the technical reason:

1. **Desktop GUI vs. Web Browser:**  
   `stone_paper_scissor.py` uses Python's built-in **`tkinter`** library. Tkinter requires a desktop operating system window manager (Windows, macOS, or Linux) to create an actual desktop application window.
2. **Browser Execution:**  
   Web browsers (Chrome, Safari, Edge, Firefox) natively execute **HTML, CSS, and JavaScript**. They cannot run Python desktop GUI apps.
3. **How Vercel Works:**  
   When you deploy to Vercel, it serves `index.html`, `style.css`, and `script.js` as a fast, client-side web application. The game logic was rebuilt in JavaScript (`script.js`) so that anyone on any device (including smartphones and tablets) can play instantly without having Python installed!
4. **Both Versions Coexist:**  
   - `stone_paper_scissor.py` remains available as your **offline Desktop GUI edition**.
   - `index.html` + `script.js` + `style.css` powers your **online Web edition** on Vercel.

---

## 📁 Repository Structure

```text
Rock-Paper-Scissors/
├── index.html               # Main Web Arena markup & structure
├── style.css                # Multi-theme modern CSS & glassmorphic styling
├── script.js                # Game engine, Web Audio synth & theme switcher
├── stone.png                # Rock graphic
├── paper.png                # Paper graphic
├── scissors.png             # Scissors graphic
├── stone_paper_scissor.py   # Original Python (Tkinter) desktop game
└── README.md                # Documentation & setup guide
```

---

## 🚀 How to Run Locally

### 1. Web Version (Browser)
No dependencies or build steps required:
1. Clone the repository:
   ```bash
   git clone https://github.com/harshadsontakke7/Rock-Paper-Scissors.git
   ```
2. Navigate into the folder:
   ```bash
   cd Rock-Paper-Scissors
   ```
3. Double-click `index.html` to open it in your favorite web browser (or use the VS Code **Live Server** extension).

---

### 2. Desktop Version (Python & Tkinter)
1. Ensure Python 3 is installed on your machine (`python --version`).
2. Run the script:
   ```bash
   python stone_paper_scissor.py
   ```
3. A native desktop window will launch for offline gameplay.

---

## ☁️ How to Deploy to Vercel

1. Push your latest code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Upgrade to Cyber Arena theme and update documentation"
   git push origin main
   ```
2. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
3. Click **Add New...** → **Project**.
4. Import your `Rock-Paper-Scissors` repository.
5. In the project setup:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - Leave build and output settings at their defaults.
6. Click **Deploy**.
7. Copy your assigned `.vercel.app` URL and paste it into the **Live Demo** link at the top of this `README.md`!

---

## 📜 Game Rules

- ✊ **Rock** crushes **Scissors**.
- ✌️ **Scissors** cuts **Paper**.
- ✋ **Paper** covers **Rock**.
- Matching picks result in a **Tie** (no points awarded).
- First fighter to accumulate **10 round victories** wins the match!

---

## 👨‍💻 Author

**Harshad Sontakke**  
- GitHub: [@harshadsontakke7](https://github.com/harshadsontakke7)

---

⭐ *If you enjoy this project, feel free to give it a star on GitHub!*
