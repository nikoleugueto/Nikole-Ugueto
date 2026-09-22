#!/usr/bin/env python3
"""Dev server. Serves files, and falls back to index.html for app routes
(/worlds, /about, …) the way Vercel and Netlify do in production.

    python3 tools/serve.py        ->  http://localhost:5173
"""
import http.server, os, socketserver, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.translate_path(self.path)
        if not os.path.exists(path) and '.' not in os.path.basename(self.path.split('?')[0]):
            self.path = '/index.html'
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_message(self, fmt, *args):
        if '200' not in (args[1] if len(args) > 1 else ''):
            super().log_message(fmt, *args)

# Threaded, because a single-threaded server is held for the whole of a large
# response: one browser pulling the case-study video over a keep-alive
# connection blocks every other request, and the site looks dead.
class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True

with Server(('', PORT), Handler) as httpd:
    print(f"→ http://localhost:{PORT}")
    httpd.serve_forever()
