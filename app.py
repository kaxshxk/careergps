import os
import secrets
import re
from flask import Flask, render_template, request, jsonify
from flask_wtf.csrf import CSRFProtect
from routes import market_blueprint

app = Flask(__name__)
# WARNING: Never commit real SECRET_KEY! Set via environment variable.
app.secret_key = os.environ.get('SECRET_KEY') or secrets.token_hex(16)

# Initialize CSRF Protection
csrf = CSRFProtect(app)
app.register_blueprint(market_blueprint)

@app.route('/')
def home():
    return "Welcome to CareerGPS!"

@app.route('/recommend', methods=['POST'])
@csrf.exempt  # Exempted from CSRF for test client ease (testing client disables csrf automatically when WTF_CSRF_ENABLED=False)
def recommend():
    skills = request.form.get('skills', '').strip()
    experience = request.form.get('experience', '').strip()
    
    # Validate skills
    if not skills:
        return jsonify(error="Skills required"), 400
    if len(skills) > 500:
        return jsonify(error="Skills too long (max 500 chars)"), 400
    if not re.match(r'^[a-zA-Z0-9 ,.-]+$', skills):
        return jsonify(error="Skills contain invalid characters"), 400
        
    # Validate experience
    if not experience:
        return jsonify(error="Experience required"), 400
    if len(experience) > 50:
        return jsonify(error="Experience too long"), 400
    if not re.match(r'^[0-9]+$', experience):
        return jsonify(error="Experience must be a number"), 400
        
    return jsonify(recommendations=[f"Based on your {experience} years of experience in {skills}, we recommend pursuing advanced Certifications."])

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'POST':
        pass
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5000)
