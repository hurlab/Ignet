"""
Entry point for the Ignet REST API.
Starts Waitress WSGI server on 0.0.0.0:<API_PORT>.
"""

import logging
import sys
import os

# Add the api directory itself to sys.path so relative imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from waitress import serve
from config import API_PORT

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)

app = create_app()

if __name__ == "__main__":
    print(f"Starting Ignet API on http://0.0.0.0:{API_PORT}/")
    # Behind Apache (mod_proxy → 127.0.0.1:9637). Waitress discards
    # X-Forwarded-* headers by default (clear_untrusted_proxy_headers), so
    # without trusted_proxy REMOTE_ADDR is always 127.0.0.1 and rate limiting
    # collapses every client into one bucket. Trusting the local Apache hop
    # makes waitress set REMOTE_ADDR from X-Forwarded-For (the real client IP).
    serve(
        app,
        host="0.0.0.0",
        port=API_PORT,
        threads=8,
        trusted_proxy="127.0.0.1",
        trusted_proxy_headers={"x-forwarded-for", "x-forwarded-proto", "x-forwarded-host"},
    )
