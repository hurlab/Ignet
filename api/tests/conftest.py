"""Pytest bootstrap: put the api/ package root on sys.path so tests can import
`routes.*` and `utils` exactly as the application does, without installing the
api as a package.
"""
import os
import sys

API_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if API_ROOT not in sys.path:
    sys.path.insert(0, API_ROOT)
