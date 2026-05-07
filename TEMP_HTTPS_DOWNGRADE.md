# TEMPORARY: hurlab.med.und.edu HTTPS → HTTP Downgrade

**Status:** ACTIVE
**Reason:** `https://hurlab.med.und.edu` is currently failing on the server. This is a
temporary mitigation to keep outbound links from the ignet/vignet web apps usable
until TLS is restored.

**Applied on:** 2026-05-06
**Applied by:** MoAI session for `juhur`
**Revert when:** TLS on `hurlab.med.und.edu` is back online.

---

## Scope

The change replaces every occurrence of the literal string
`https://hurlab.med.und.edu` with `http://hurlab.med.und.edu` across the ignet and
vignet frontends. No other URLs (e.g. `https://he-group.github.io`,
`https://github.com/hurlab/...`, NIH reporter, etc.) are touched.

## Source File Changes (4 total)

| # | Repo | File | Line | Before | After |
|---|------|------|------|--------|-------|
| 1 | ignet | `frontend/src/pages/About.jsx` | 85 | `url: 'https://hurlab.med.und.edu',` | `url: 'http://hurlab.med.und.edu',` |
| 2 | ignet | `frontend/src/pages/Contact.jsx` | 7 | `url: 'https://hurlab.med.und.edu',` | `url: 'http://hurlab.med.und.edu',` |
| 3 | vignet | `frontend/src/pages/About.jsx` | 73 | `href="https://hurlab.med.und.edu"` | `href="http://hurlab.med.und.edu"` |
| 4 | vignet | `frontend/src/pages/Contact.jsx` | 7 | `url: 'https://hurlab.med.und.edu',` | `url: 'http://hurlab.med.und.edu',` |

## Built Artifacts Regenerated (2026-05-06 build)

Both frontends were rebuilt with `npm run build` (using
`/home/juhur/miniconda3/envs/openai/bin/node` v24.9.0). The new `index.html` for
each project points to the new bundles below, which contain the http URL.

| Project | New entry bundle | New About chunk | New Contact chunk |
|---------|------------------|-----------------|-------------------|
| ignet | `assets/index-Dg8dRJ2-.js` | `assets/About-CYZWTitW.js` | `assets/Contact-BKWERzYn.js` |
| vignet | `assets/index-Dy9Flhyt.js` | `assets/About-CHQkCLFA.js` | `assets/Contact-BXe5L9Z-.js` |

### Build commands used

```bash
export PATH="/home/juhur/miniconda3/envs/openai/bin:$PATH"
# Clean rebuild to remove stale bundles (ignet only — vignet's dist-react is gitignored)
rm -rf /data/var/www/html/ignet/dist-react/assets
( cd /data/var/www/html/ignet/frontend  && npm run build )
( cd /data/var/www/html/vignet/frontend && npm run build )
```

The clean rebuild removes any previously committed bundles that still contained
the `https://` URL (notably `About-DjSE1zT5.js` and `Contact-zPKZR2-k.js`), so
the committed `dist-react/` exactly matches the freshly-built output.

---

## Verification

```bash
# Should return ZERO matches in source after the downgrade:
grep -rn "https://hurlab.med.und.edu" \
  /data/var/www/html/ignet/frontend \
  /data/var/www/html/vignet/frontend

# Should return ZERO matches in freshly built bundles:
grep -rn "https://hurlab.med.und.edu" \
  /data/var/www/html/ignet/dist-react \
  /data/var/www/html/vignet/dist-react
```

---

## Revert Procedure

When TLS is restored, revert in this order:

```bash
# 1. Restore source files from git (both repos are clean at the time of this change)
git -C /data/var/www/html/ignet  checkout -- frontend/src/pages/About.jsx frontend/src/pages/Contact.jsx
git -C /data/var/www/html/vignet checkout -- frontend/src/pages/About.jsx frontend/src/pages/Contact.jsx

# 2. Rebuild both frontends
( cd /data/var/www/html/ignet/frontend  && npm run build )
( cd /data/var/www/html/vignet/frontend && npm run build )

# 3. Verify https is back
grep -rn "http://hurlab.med.und.edu" \
  /data/var/www/html/ignet/frontend  /data/var/www/html/vignet/frontend \
  /data/var/www/html/ignet/dist-react /data/var/www/html/vignet/dist-react
# Expected: zero matches.

grep -rn "https://hurlab.med.und.edu" \
  /data/var/www/html/ignet/frontend /data/var/www/html/vignet/frontend
# Expected: 4 matches (the original committed source lines).

# 4. Delete this tracking file
rm /data/var/www/html/ignet/TEMP_HTTPS_DOWNGRADE.md
```

If you would rather avoid relying on `git checkout` (e.g. if other commits have
landed), the equivalent literal-string revert is:

```bash
sed -i 's|http://hurlab\.med\.und\.edu|https://hurlab.med.und.edu|g' \
  /data/var/www/html/ignet/frontend/src/pages/About.jsx \
  /data/var/www/html/ignet/frontend/src/pages/Contact.jsx \
  /data/var/www/html/vignet/frontend/src/pages/About.jsx \
  /data/var/www/html/vignet/frontend/src/pages/Contact.jsx
```
