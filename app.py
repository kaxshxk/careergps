import os
import re
import requests
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, flash
from flask_wtf.csrf import CSRFProtect
from routes import market_blueprint
from extensions import limiter

app = Flask(__name__)
# WARNING: Never commit real SECRET_KEY! Set via environment variable.
secret_key = os.environ.get('SECRET_KEY')
if not secret_key:
    raise RuntimeError("SECRET_KEY environment variable is not set. Refusing to start.")
app.secret_key = secret_key

# Initialize CSRF Protection
csrf = CSRFProtect(app)
limiter.init_app(app)
app.register_blueprint(market_blueprint)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
@limiter.limit("10 per minute")
def recommend():
    skills = request.form.get('skills', '').strip()
    experience = request.form.get('experience', '').strip()
    
    # Validate skills
    if not skills:
        return jsonify(error="Skills required"), 400
    if len(skills) > 500:
        return jsonify(error="Skills too long (max 500 chars)"), 400
    if not re.match(r'^[a-zA-Z0-9 ,.\-\+\#\/\_]+$', skills):
        return jsonify(error="Skills contain invalid characters. Use letters, numbers, and common symbols like + # / _"), 400
        
    # Validate experience
    if not experience:
        return jsonify(error="Experience required"), 400
    if len(experience) > 50:
        return jsonify(error="Experience too long"), 400
    if not re.match(r'^[0-9]+$', experience):
        return jsonify(error="Experience must be a number"), 400
        
    exp_val = int(experience)
    if not (0 <= exp_val <= 60):
        return jsonify(error="Experience must be between 0 and 60 years."), 400
        
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return jsonify(error="Gemini API key not configured"), 503
        
    model = os.environ.get('GEMINI_MODEL', 'gemini-1.5-flash')
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    
    prompt = f"Given the following profile: Skills: {skills}, Experience: {experience} years. Provide a list of recommended career roadmaps, certifications, and next steps."
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=10)
        response.raise_for_status()
        res_data = response.json()
        
        candidates = res_data.get('candidates', [])
        if not candidates:
            raise ValueError("No candidates returned from Gemini API")
            
        parts = candidates[0].get('content', {}).get('parts', [])
        if not parts:
            raise ValueError("No content parts returned from Gemini API")
            
        ai_text = parts[0].get('text', '')
        if not ai_text:
            raise ValueError("Empty text returned from Gemini API")
            
        return jsonify(recommendations=[ai_text])
    except Exception as e:
        app.logger.error(f"Gemini API call failed: {str(e)}")
        return jsonify(error="Service temporarily unavailable"), 503

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'POST':
        name = request.form.get('name', '').strip()
        email = request.form.get('email', '').strip()
        skills = request.form.get('skills', '').strip()
        
        if not name or not email or not skills:
            flash("All fields are required.")
            return redirect(url_for('profile'))
            
        session['name'] = name
        session['email'] = email
        session['skills'] = skills
        
        flash("Profile saved successfully.")
        return redirect(url_for('profile'))
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
