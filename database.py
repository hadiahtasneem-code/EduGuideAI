import json
import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Dict, List


APP_ROOT = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB_PATH = os.getenv("DATABASE_URL") or os.path.join(APP_ROOT, "eduguide.db")


@contextmanager
def get_conn():
    conn = sqlite3.connect(DEFAULT_DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def init_db() -> None:
    os.makedirs(os.path.join(APP_ROOT, "resources"), exist_ok=True)

    with get_conn() as conn:
        cur = conn.cursor()
        cur.executescript(
            """
            CREATE TABLE IF NOT EXISTS youtube_resources (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                channel TEXT,
                url TEXT UNIQUE NOT NULL,
                topic TEXT,
                difficulty TEXT,
                duration_minutes INTEGER,
                created_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS certificate_courses (
                id INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                provider TEXT,
                url TEXT UNIQUE NOT NULL,
                topic TEXT,
                duration_weeks INTEGER,
                cost REAL,
                difficulty TEXT,
                rating REAL,
                certificate INTEGER,
                created_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS study_plans (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                topic TEXT,
                level TEXT,
                weeks INTEGER,
                schedule TEXT,
                created_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY,
                email TEXT UNIQUE,
                education_level TEXT,
                field_of_interest TEXT,
                target_role TEXT,
                available_hours REAL,
                learning_style TEXT,
                created_at TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS analysis_results (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                analysis_data TEXT,
                created_at TIMESTAMP
            );
            """
        )
        conn.commit()

    _seed_resources()


def _read_json(path: str, fallback: Any) -> Any:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return fallback


def _seed_resources() -> None:
    youtube_path = os.path.join(APP_ROOT, "resources", "youtube_data.json")
    courses_path = os.path.join(APP_ROOT, "resources", "courses_data.json")
    plans_path = os.path.join(APP_ROOT, "resources", "study_plans.json")

    youtube = _read_json(youtube_path, [])
    courses = _read_json(courses_path, [])
    plans = _read_json(plans_path, [])

    now = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    with get_conn() as conn:
        cur = conn.cursor()
        for item in youtube:
            cur.execute(
                """
                INSERT OR IGNORE INTO youtube_resources
                (id, title, channel, url, topic, difficulty, duration_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item.get("id"),
                    item.get("title"),
                    item.get("channel"),
                    item.get("url"),
                    item.get("topic"),
                    item.get("difficulty"),
                    item.get("duration_minutes"),
                    now,
                ),
            )

        for item in courses:
            cur.execute(
                """
                INSERT OR IGNORE INTO certificate_courses
                (id, title, provider, url, topic, duration_weeks, cost, difficulty, rating, certificate, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item.get("id"),
                    item.get("title"),
                    item.get("provider"),
                    item.get("url"),
                    item.get("topic"),
                    item.get("duration_weeks"),
                    item.get("cost"),
                    item.get("difficulty"),
                    item.get("rating"),
                    1 if item.get("certificate") else 0,
                    now,
                ),
            )

        for item in plans:
            cur.execute(
                """
                INSERT OR IGNORE INTO study_plans
                (id, name, topic, level, weeks, schedule, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item.get("id"),
                    item.get("name"),
                    item.get("topic"),
                    item.get("level"),
                    item.get("weeks"),
                    json.dumps(item.get("schedule", {})),
                    now,
                ),
            )

        conn.commit()


def get_youtube_resources(topic: str = "", difficulty: str = "", limit: int = 25) -> List[Dict[str, Any]]:
    topic = (topic or "").strip()
    difficulty = (difficulty or "").strip()

    query = "SELECT title, channel, url, topic, difficulty, duration_minutes FROM youtube_resources WHERE 1=1"
    params: List[Any] = []

    if topic:
        query += " AND topic = ?"
        params.append(topic)
    if difficulty:
        query += " AND difficulty = ?"
        params.append(difficulty)

    query += " ORDER BY duration_minutes ASC LIMIT ?"
    params.append(int(limit))

    with get_conn() as conn:
        cur = conn.execute(query, params)
        return [dict(row) for row in cur.fetchall()]


def get_course_resources(topic: str = "", cost_filter: str = "", limit: int = 25) -> List[Dict[str, Any]]:
    topic = (topic or "").strip()
    cost_filter = (cost_filter or "").strip().lower()

    query = "SELECT title, provider, url, topic, duration_weeks, cost, difficulty, rating, certificate FROM certificate_courses WHERE 1=1"
    params: List[Any] = []

    if topic:
        query += " AND topic = ?"
        params.append(topic)

    if cost_filter == "free":
        query += " AND (cost = 0 OR cost IS NULL)"

    query += " ORDER BY COALESCE(cost, 0) ASC LIMIT ?"
    params.append(int(limit))

    with get_conn() as conn:
        cur = conn.execute(query, params)
        items = []
        for row in cur.fetchall():
            d = dict(row)
            d["certificate"] = bool(d.get("certificate"))
            items.append(d)
        return items


def save_analysis_result(user_profile: Dict[str, Any], analysis: Dict[str, Any], ts: str) -> None:
    record = {"timestamp": ts, "user_profile": user_profile, "analysis": analysis}
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO analysis_results (user_id, analysis_data, created_at) VALUES (?, ?, ?)",
            (None, json.dumps(record), ts),
        )
        conn.commit()


if __name__ == "__main__":
    init_db()
