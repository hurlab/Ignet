# Ignet 2.0 Access Policy

## Feature Access by User Type

| Feature | Anonymous | Registered | Notes |
|---------|-----------|------------|-------|
| Gene search, autocomplete, neighbors | Free | Free | |
| GenePair evidence + BioBERT scores | Free | Free | |
| Dignet network search | Free | Free | |
| Explore top genes | Free | Free | |
| API Docs | Free | Free | |
| CSV export | Free | Free | |
| PNG/SVG/GraphML export | Free | Free | |
| BioBERT re-predict | Free | Free | |
| Gene Set Enrichment | Free | Free | |
| Comparative Networks | Free | Free | |
| Gene Report Card | Free | Free | |
| INO Explorer | Free | Free | |
| BioSummarAI (GPT-4o) | Limited (3/day per IP) | Unlimited (or BYOK) | Expensive: OpenAI API calls |
| Smart Literature Assistant | Limited (3/day per IP) | Unlimited (or BYOK) | Expensive: OpenAI API calls |
| BYOK API key storage | Not available | Registered only | |
| Admin stats | Not available | Admin role only | |

## Rationale

- All data-driven features (gene search, networks, pairs, INO, enrichment) use local MariaDB/Redis and are cheap to serve
- Rate limiting by IP (60 req/min) handles abuse for anonymous users
- GPT-4o features cost money per call; daily limit for anonymous, unlimited for registered/BYOK
- Registration is free and optional — never blocks core research functionality

## Implementation

- Anonymous rate limiting: flask-limiter (already in place, 60/min global)
- GPT-4o daily limit: Track by IP in usage_events table, check count before proxying to BioSummarAI
- BYOK: Already implemented (encrypted storage in api_keys table)

Approved: 2026-03-19
