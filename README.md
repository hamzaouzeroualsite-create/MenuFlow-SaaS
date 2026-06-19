# Hamza Ouzeroual — Portfolio

A professional personal portfolio website built with HTML, CSS, and JavaScript. Ready for deployment on Vercel or Netlify.

## Features

- Hero section with profile placeholder
- About section (education & experience)
- Skills showcase (Flutter, Firebase, HTML, CSS, JavaScript, Canva, Excel)
- Dynamic project cards with demo & GitHub links
- CV download section
- Contact links (Email, GitHub, LinkedIn, Instagram)
- Dark / light mode toggle
- Fully responsive (mobile & desktop)
- Smooth scroll animations

## Local Preview

Open `index.html` in your browser, or run a local server:

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Customize

1. **Profile photo** — Replace `assets/profile.svg` with your photo (e.g. `profile.jpg`) and update the `src` in `index.html`.
2. **Contact links** — Update email and social URLs in the Contact section of `index.html`.
3. **Projects** — Edit `js/projects.js` to add your real projects, images, and links.
4. **About content** — Update education and experience in `index.html`.
5. **CV** — Replace `assets/Hamza_Ouzeroual_CV.pdf` with your actual resume PDF.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and import the repo.
3. No build settings needed — Vercel serves static files automatically.
4. Deploy.

Or use the CLI:

```bash
npm i -g vercel
vercel
```

## Deploy to Netlify

1. Push to GitHub, or drag-and-drop the folder at [app.netlify.com/drop](https://app.netlify.com/drop).
2. Netlify reads `netlify.toml` automatically — no build step required.

Or use the CLI:

```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Project Structure

```
hamza-portfolio/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── projects.js
├── assets/
│   ├── profile.svg
│   ├── favicon.svg
│   ├── Hamza_Ouzeroual_CV.pdf
│   └── projects/
├── vercel.json
├── netlify.toml
└── README.md
```

## License

Personal portfolio — all rights reserved.
