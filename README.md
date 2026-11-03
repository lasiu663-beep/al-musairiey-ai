# Al Musairiey AI
Standalone browser-based multilingual product assistant.

## Run
1. Install Node.js 20+.
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` on the server only.
3. Run `npm install`, then `npm start`.
4. Open http://localhost:3000

## Render
Build command: `npm install`
Start command: `npm start`
Add environment variable `OPENAI_API_KEY` in Render dashboard. Never commit `.env` or an API key.

## Catalog
`data/products.json` is the product source. Review/import public product details before relying on it. Public catalog data does not confirm live stock or unpublished prices.
