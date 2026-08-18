# Ask the Network Worker

The Hub works in source mode without this optional AI layer. The production Worker uses a Workers AI binding named `AI` and the `GUIDE_RATE_LIMIT` Cloudflare Rate Limiting binding (10 requests per IP per minute). A second, stricter 10-request-per-hour guard remains in the Worker as a best-effort layer.

Deploy with `npx wrangler deploy` from the Hub root. No third-party API key is required. Never add private emails, credentials, or unreviewed material to the prompt or the public repository.
