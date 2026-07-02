import os
import time
from datetime import datetime, timezone

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

from agents.profile_analyzer import analyze_profile
from agents.gap_analyzer import analyze_gaps
from agents.resource_recommender import recommend_resources
from agents.study_plan_generator import generate_study_plan
from agents.career_advisor import advise_career
from database import init_db, save_analysis_result, get_youtube_resources, get_course_resources
from utils.validators import validate_and_normalize_profile


load_dotenv()

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024
app.secret_key = os.getenv("SECRET_KEY", "change-me")
CORS(app)
init_db()

_RATE_WINDOW_SECONDS = 10 * 60
_RATE_MAX_REQUESTS = 30
_rate_bucket = {}


@app.get("/")
def landing():
    return send_from_directory(APP_ROOT, "index.html")


@app.get("/form")
def form_page():
    return send_from_directory(APP_ROOT, "form.html")


@app.get("/results")
def results_page():
    return send_from_directory(APP_ROOT, "results.html")


@app.get("/css/<path:filename>")
def css_static(filename: str):
    return send_from_directory(os.path.join(APP_ROOT, "css"), filename)


@app.get("/js/<path:filename>")
def js_static(filename: str):
    return send_from_directory(os.path.join(APP_ROOT, "js"), filename)


@app.get("/resources/<path:filename>")
def resources_static(filename: str):
    return send_from_directory(os.path.join(APP_ROOT, "resources"), filename)


@app.post("/api/analyze")
def api_analyze():
    ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"
    now = time.time()
    hits = _rate_bucket.get(ip, [])
    hits = [t for t in hits if now - t < _RATE_WINDOW_SECONDS]
    if len(hits) >= _RATE_MAX_REQUESTS:
        _rate_bucket[ip] = hits
        return jsonify({"error": "Too many requests. Please wait and try again."}), 429
    hits.append(now)
    _rate_bucket[ip] = hits

    raw = request.get_json(silent=True) or {}

    ok, data_or_error = validate_and_normalize_profile(raw)
    if not ok:
        return jsonify({"error": "Validation failed", "details": data_or_error}), 400

    profile = data_or_error

    from concurrent.futures import ThreadPoolExecutor

    ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    with ThreadPoolExecutor(max_workers=5) as pool:
        f_profile = pool.submit(analyze_profile, profile)
        f_gaps = pool.submit(analyze_gaps, profile)
        f_resources = pool.submit(recommend_resources, profile)
        f_plan = pool.submit(generate_study_plan, profile)
        f_career = pool.submit(advise_career, profile)

        analysis = {
            "profile": f_profile.result(),
            "gaps": f_gaps.result(),
            "resources": f_resources.result(),
            "study_plan": f_plan.result(),
            "career_path": f_career.result(),
        }

    payload = {"timestamp": ts, "user_profile": profile, "analysis": analysis}
    save_analysis_result(profile, analysis, ts)
    return jsonify(payload), 200


@app.get("/api/resources/youtube")
def api_youtube():
    topic = request.args.get("topic", "")
    difficulty = request.args.get("difficulty", "")
    items = get_youtube_resources(topic=topic, difficulty=difficulty)
    return jsonify(items), 200


@app.get("/api/resources/courses")
def api_courses():
    topic = request.args.get("topic", "")
    cost = request.args.get("cost", "")
    items = get_course_resources(topic=topic, cost_filter=cost)
    return jsonify(items), 200


@app.post("/api/export/pdf")
def api_export_pdf():
    return jsonify({"message": "Use the Print/Export button in the browser to save as PDF."}), 200


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(_e):
    return jsonify({"error": "Server error"}), 500


def main():
    init_db()
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)


if __name__ == "__main__":
    main()
