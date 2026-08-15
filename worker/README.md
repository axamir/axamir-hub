# Ask the Network Worker

The Hub works in source mode without this optional AI layer. To enable free-text AI safely, deploy `worker.js` as a separate Cloudflare Worker and add `MODEL_API_URL`, `MODEL_API_TOKEN`, and `MODEL_NAME` as Worker secrets. Add a real rate limit before public launch (for example, 10 requests per IP per hour), then add the Worker URL to `app.js`.

Never add private emails, credentials, or unreviewed material to the prompt or the public repository.
