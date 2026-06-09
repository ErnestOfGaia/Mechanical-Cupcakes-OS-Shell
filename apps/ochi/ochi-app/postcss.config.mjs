// App-local PostCSS config so the OCHI app builds Tailwind v4 standalone — the
// Docker image is built with this app dir as the context (see .github/workflows/
// docker-publish.yml), so it can't rely on the monorepo-root postcss.config.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
