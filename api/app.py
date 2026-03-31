"""
Flask application factory for the Ignet REST API.
"""

import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address


def create_app() -> Flask:
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB

    # Rate limiting — in-memory storage (resets on restart, fine for single-server)
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["60 per minute"],
        storage_uri="memory://",
    )
    app.limiter = limiter

    # Enable CORS for all /api/* routes — restricted to known origins
    CORS(app, resources={r"/api/*": {
        "origins": ["https://ignet.org", "https://www.ignet.org", "http://localhost:*"],
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
    }})

    # Register blueprints
    from routes.genes import genes_bp
    from routes.pairs import pairs_bp
    from routes.stats import stats_bp
    from routes.dignet import dignet_bp
    from routes.llm import llm_bp
    from routes.auth import auth_bp
    from routes.admin import admin_bp
    from routes.enrichment import enrichment_bp
    from routes.ino import ino_bp
    from routes.assistant import assistant_bp
    from routes.vaccine import vaccine_bp
    from routes.mcp import mcp_bp

    app.register_blueprint(genes_bp, url_prefix="/api/v1")
    app.register_blueprint(pairs_bp, url_prefix="/api/v1")
    app.register_blueprint(stats_bp, url_prefix="/api/v1")
    app.register_blueprint(dignet_bp, url_prefix="/api/v1")
    app.register_blueprint(llm_bp, url_prefix="/api/v1")
    app.register_blueprint(auth_bp, url_prefix="/api/v1")
    app.register_blueprint(admin_bp, url_prefix="/api/v1")
    app.register_blueprint(enrichment_bp, url_prefix="/api/v1")
    app.register_blueprint(ino_bp, url_prefix="/api/v1")
    app.register_blueprint(assistant_bp, url_prefix="/api/v1")
    app.register_blueprint(vaccine_bp, url_prefix="/api/v1")
    app.register_blueprint(mcp_bp, url_prefix="/api/v1")

    # Stricter rate limits on auth endpoints
    limiter.limit("5 per minute")(app.view_functions["auth.register"])
    limiter.limit("10 per minute")(app.view_functions["auth.login"])

    # Health check (exempt from rate limiting)
    @app.route("/api/v1/health", methods=["GET"])
    @limiter.exempt
    def health():
        return jsonify({"status": "ok", "service": "ignet-api"})

    # Usage tracking: record every API request in usage_events
    @app.after_request
    def record_usage(response):
        """Non-blocking usage tracking after every request."""
        try:
            from flask import g, request as req
            from middleware import track_usage

            # Only track /api/ endpoints; skip health checks and static
            if req.path.startswith("/api/") and req.path != "/api/v1/health":
                endpoint = req.path
                user_id = g.user["id"] if getattr(g, "user", None) else None
                # Run tracking only for 2xx/3xx responses to avoid noise
                if response.status_code < 500:
                    track_usage(endpoint, user_id=user_id)
        except Exception:
            pass  # Never block the response
        return response

    # Error handlers
    @app.errorhandler(429)
    def ratelimit_handler(exc):
        return jsonify({"error": "TooManyRequests", "message": "Rate limit exceeded. Please try again later."}), 429

    @app.errorhandler(400)
    def bad_request(exc):
        return jsonify({"error": "BadRequest", "message": str(exc)}), 400

    @app.errorhandler(404)
    def not_found(exc):
        return jsonify({"error": "NotFound", "message": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(exc):
        return jsonify({"error": "MethodNotAllowed", "message": str(exc)}), 405

    @app.errorhandler(500)
    def internal_error(exc):
        logging.getLogger(__name__).exception("Unhandled exception: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "An unexpected error occurred."}), 500

    return app
