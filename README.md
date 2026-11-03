# Al Musairiey AI — browser-based product assistant

A standalone web page (not a mobile app) with multilingual chat, product-catalog lookup, and WhatsApp handoff.

## Important setup
This is a deployable starter project, not a live hosted service. To make AI replies work, deploy the Node server and add an OpenAI API key on the server. Never put the API key in browser code.

## Requirements
- Node.js 20+
- OpenAI API key
- Hosting that supports a Node.js server (or adapt the API route to your hosting provider)

## Run locally
1. Copy `.env.example` to `.env` and add your API key.
2. Run `npm install`
3. Run `npm start`
4. Open http://localhost:3000

## Product catalog
The included importer reads the public WooCommerce shop sitemap/product pages from `https://shop.almusairiey.com/`. Review the imported JSON before production. The site currently exposes a public catalog, but public pages may not include live inventory or unpublished prices.
Run `npm run import-catalog` to refresh `data/products.json`.

## WhatsApp
Customer handoff opens WhatsApp at `https://wa.me/966502618568` (the supplied Saudi number 0502618568).

## Production checklist
- Add your API key to hosting environment variables.
- Run the catalog importer and review product names, codes, specs and product URLs.
- Add rate limiting, logging and abuse protection before public launch.
- Confirm the company's authorization to use its product catalog and brand.
- Connect a verified stock/ERP API only if live availability is required.
- Configure DNS for a subdomain such as `ai.almusairiey.com` and enable HTTPS.
