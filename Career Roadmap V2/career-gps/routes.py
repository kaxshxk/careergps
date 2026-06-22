import sqlite3
import re
from flask import Flask, request, jsonify

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/users', methods=['GET'])
def get_users_by_skill():
    # Retrieve user input from query parameters
    user_input = request.args.get('skills', '')
    location = request.args.get('location', '')
    job_title = request.args.get('job_title', '')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Secure parameterized query replacing raw SQL string concatenation
    # WARNING: Never use string concatenation (like ' + user_input + ') or .format() in SQL strings!
    cursor.execute(
        "SELECT * FROM users WHERE skills = ? AND location = ? AND job_title = ?",
        (user_input, location, job_title)
    )
    
    users = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(user) for user in users])

@app.route('/recommend', methods=['POST'])
def recommend_careers():
    # 1. Retrieve and sanitize input fields from request.form using .get() and .strip()
    skills = request.form.get('skills', '').strip()
    location = request.form.get('location', '').strip()
    job_title = request.form.get('job_title', '').strip()
    
    # 2. Validate skills input
    if not skills:
        return jsonify(error="Skills required"), 400
    if len(skills) > 500:
        return jsonify(error="Too long"), 400
    if not re.match(r'^[a-zA-Z0-9 ,.-]+$', skills):
        return jsonify(error="Invalid characters in skills"), 400

    # 3. Validate location input
    if not location:
        return jsonify(error="Location required"), 400
    if len(location) > 100:
        return jsonify(error="Location too long"), 400
    if not re.match(r'^[a-zA-Z0-9 ,.-]+$', location):
        return jsonify(error="Invalid characters in location"), 400

    # 4. Validate job title input
    if not job_title:
        return jsonify(error="Job title required"), 400
    if len(job_title) > 200:
        return jsonify(error="Job title too long"), 400
    if not re.match(r'^[a-zA-Z0-9 ,.-]+$', job_title):
        return jsonify(error="Invalid characters in job title"), 400

    # 5. Execute secure parameterized query
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE skills = ? AND location = ? AND job_title = ?",
        (skills, location, job_title)
    )
    users = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(user) for user in users])

