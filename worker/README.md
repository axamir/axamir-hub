# Ask the Network Worker

The Hub works in source mode without this optional AI layer. To enable free-text AI safely, deploy `worker.js` to the `ask-the-network` Cloudflare Worker and add a **Workers AI** binding named `AI`. No third-party API key is required. Add a Cloudflare Rate Limiter binding before public launch (for example, 10 requests per IP per hour), then set the Worker URL in `app.js`.

Never add private emails, credentials, or unreviewed material to the prompt or the public repository.
