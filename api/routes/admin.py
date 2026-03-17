"""
Admin endpoints for Ignet REST API.

Blueprint registered at /api/v1/admin — all routes require admin role.

  GET /api/v1/admin/stats  — aggregate usage and user statistics
"""

import logging

from flask import jsonify

from db import db_connection
from middleware import require_admin, track_usage

logger = logging.getLogger(__name__)

admin_bp = __import__("flask").Blueprint("admin", __name__)


@admin_bp.route("/admin/stats", methods=["GET"])
@require_admin
def admin_stats():
    """Return aggregate platform statistics."""
    try:
        with db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            # Total registered users
            cursor.execute("SELECT COUNT(*) AS cnt FROM users")
            total_users: int = cursor.fetchone()["cnt"]

            # API requests today
            cursor.execute(
                "SELECT COUNT(*) AS cnt FROM usage_events WHERE DATE(created_at) = CURDATE()"
            )
            requests_today: int = cursor.fetchone()["cnt"]

            # API requests this week (last 7 days)
            cursor.execute(
                "SELECT COUNT(*) AS cnt FROM usage_events "
                "WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
            )
            requests_this_week: int = cursor.fetchone()["cnt"]

            # Top 10 endpoints by request count
            cursor.execute(
                """SELECT endpoint, COUNT(*) AS cnt
                   FROM usage_events
                   WHERE endpoint IS NOT NULL
                   GROUP BY endpoint
                   ORDER BY cnt DESC
                   LIMIT 10"""
            )
            top_endpoints = [
                {"endpoint": r["endpoint"], "count": r["cnt"]}
                for r in cursor.fetchall()
            ]

            # Active users today (unique user_ids that made requests)
            cursor.execute(
                """SELECT COUNT(DISTINCT user_id) AS cnt
                   FROM usage_events
                   WHERE user_id IS NOT NULL
                     AND DATE(created_at) = CURDATE()"""
            )
            active_users_today: int = cursor.fetchone()["cnt"]

            cursor.close()

    except Exception as exc:
        logger.exception("Database error fetching admin stats: %s", exc)
        return jsonify({"error": "InternalServerError", "message": "Could not load stats."}), 500

    track_usage("admin_stats")

    return jsonify({
        "total_users": total_users,
        "requests_today": requests_today,
        "requests_this_week": requests_this_week,
        "top_endpoints": top_endpoints,
        "active_users_today": active_users_today,
    }), 200
