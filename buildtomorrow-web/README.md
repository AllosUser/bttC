# BuildTomorrow Web

Landing page for [BuildTomorrow](https://buildtomorrow.today), a digital agency building web, mobile, AI and security products.

Built with React 18, Vite 5 and Tailwind CSS, with GSAP, Lenis and Framer Motion for animation and three.js for the hero scene. The contact form posts to [Web3Forms](https://web3forms.com).

## Setup

Requires Node.js 22 or newer (the `test` script uses `node --test` with a glob pattern, which needs Node 21+).

```bash
cd buildtomorrow-web
npm install
cp .env.example .env.local   # then add your Web3Forms access key
npm run dev
```

The dev server runs at http://localhost:5173.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_WEB3FORMS_ACCESS_KEY` | Yes, for the contact form | Web3Forms access key used when the contact form is submitted. |

Vite inlines `VITE_*` variables into the client bundle at build time, so the key must be present when `npm run build` runs. Without it the site still builds and renders, but submitting the contact form shows an error. Local values go in `.env.local`, which is git-ignored. Never commit a real key.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload. |
| `npm run build` | Build the production site into `dist/`. |
| `npm run preview` | Serve the built `dist/` locally to check a production build. |
| `npm test` | Run the unit tests (`src/**/*.test.js`) with Node's built-in test runner. |

## Project structure

```
buildtomorrow-web/
├── index.html            # HTML shell, meta tags, structured data
├── public/               # Static files served as-is (favicons, robots.txt, sitemap.xml, email/)
├── Assets/               # Source logo and favicon files
├── src/
│   ├── main.jsx          # Entry point
│   ├── App.jsx           # Page layout: composes the sections below
│   ├── index.css         # Global styles and Tailwind layers
│   ├── components/       # Page sections (Hero, Services, About, Process, CTA, Footer, ...)
│   ├── hooks/            # useLenis, useGSAP, useMediaQuery
│   ├── utils/            # Helpers such as contactForm.js, plus their *.test.js files
│   └── assets/           # Images imported by components
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

Anything in `public/` is served from the site root, so `public/email/bt-mark.png` is available at `/email/bt-mark.png`.

## Deployment

The site is hosted on Vercel and connected to this GitHub repository.

- **Vercel project:** `btt-c`
- **Root directory:** `buildtomorrow-web`
- **Framework preset:** Vite (build command `npm run build`, output directory `dist`)
- **Production:** every merge to `master` deploys to production.
- **Previews:** every pull request gets its own preview deployment.

### Contact form key in Vercel

Set `VITE_WEB3FORMS_ACCESS_KEY` in Vercel under **Project `btt-c` → Settings → Environment Variables**, for the Production and Preview environments. Because the key is read at build time, redeploy after adding or changing it.
