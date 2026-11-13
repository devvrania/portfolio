# Rania's portfolio

One-page portfolio with [Kairo](https://github.com/devvrania/kairo), my 3D coding companion, live at the top.

Built with Next.js 16, TypeScript and Tailwind CSS 4. Every page is prerendered as static content.

## Run it

```sh
nvm use          # Node 22, from .nvmrc
npm install
npm run dev      # http://localhost:3000
```

## Edit the content

Everything the site says is in [`src/content/site.ts`](src/content/site.ts): intro, links, about, skills, projects and experience.

Entries marked `draft: true` are placeholders. They show with a "draft" badge in `npm run dev` and are left out of production builds, so nothing half-written ships. Fill one in, then delete its `draft` flag. A section with nothing but drafts (like Experience, for now) is hidden in production.

## Kairo

Kairo lives in his own repo. The hero embeds a copy of his scene from `public/kairo`:

```sh
npm run sync:kairo                          # copies from ../kairo
KAIRO_DIR=/path/to/kairo npm run sync:kairo # or from another checkout
```

Run it again after changing Kairo. On screens narrower than 768px, or with data saver on, the hero shows the banner art instead of loading the 20 MB model.

## Deploy

Push to GitHub and import the repo on [Vercel](https://vercel.com/new); the defaults work. Then set `site.url` in `src/content/site.ts` to the real domain so share previews use it.
