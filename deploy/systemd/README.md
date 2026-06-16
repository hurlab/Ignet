# Ignet systemd services

Canonical copies of the systemd unit files that run the Ignet backend daemons in
production. These are the source-of-truth, version-controlled copies; the live
units are installed at `/etc/systemd/system/`.

| Unit | Purpose |
|------|---------|
| `ignet-api.service` | Flask REST API (`api/run.py`) — serves `https://ignet.org/api/v1/` |
| `ignet-biosummarai.service` | BioSummarAI GPT-powered summarization service (`biosummarAI/api_biosummary.py`) |
| `ignet-biobert.service` | BioBERT protein-interaction prediction service (`genepair/bert_files/biobert_prediction.py`) |

## Notes
- Secrets are **not** stored here. Units load them via
  `EnvironmentFile=/data/var/www/html/ignet/biosummarAI/.env`, which is gitignored.
- Paths, `User`/`Group`, and virtualenv locations are server-specific
  (`/data/var/www/html/ignet`, user `juhur`, group `webapps`). Adjust for other hosts.

## Install / update on the server
```bash
sudo cp deploy/systemd/ignet-*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ignet-api ignet-biosummarai ignet-biobert
# after editing a unit:
sudo systemctl restart ignet-api
```
