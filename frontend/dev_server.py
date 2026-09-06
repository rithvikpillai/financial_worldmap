#!/usr/bin/env python3
"""
Development server for frontend with optional live reload.

Usage: python frontend/dev_server.py

- If `livereload` package is installed (`pip install livereload`), this will start a livereload server
  that injects a reload script into served pages and reloads when files change.
- Otherwise it falls back to `http.server` (no auto-reload).
"""
import os
import sys
import socket
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8000
ROOT = os.path.abspath(os.path.dirname(__file__))

os.chdir(ROOT)

try:
    from livereload import Server
    server = Server()
    # watch common static file types
    server.watch('*.html')
    server.watch('*.css')
    server.watch('*.js')
    server.watch('**/*.*')
    print(f"livereload available — serving with auto-reload on http://localhost:{PORT}")
    server.serve(root='.', port=PORT)
except Exception as e:
    print("livereload not available or failed to start — falling back to http.server")
    print("Install with: pip install livereload")
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            pass
    httpd = ThreadingHTTPServer(('0.0.0.0', PORT), QuietHandler)
    sa = httpd.socket.getsockname()
    print(f"Serving HTTP on {sa[0]} port {sa[1]} (http://localhost:{PORT}/) ...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('\nStopping server')
        httpd.server_close()
        sys.exit(0)
