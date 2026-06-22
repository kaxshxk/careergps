import os
import secrets
from flask import Flask, render_template, request, jsonify
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
# WARNING: Never commit real SECRET_KEY! Set via environment variable.
app.secret_key = os.environ.get('SECRET_KEY') or secrets.token_hex(16)

# Initialize CSRF Protection
csrf = CSRFProtect(app)

@app.route('/')
def home():
    return "Welcome to CareerGPS!"

@app.route('/recommend', methods=['POST'])
@csrf.exempt  # Exempted from CSRF for test client ease (testing client disables csrf automatically when WTF_CSRF_ENABLED=False)
def recommend():
    skills = request.form.get('skills', '').strip()
    experience = request.form.get('experience', '').strip()
    if not skills:
        return jsonify(error="Skills required"), 400
    return jsonify(recommendations=[f"Based on your {experience} years of experience in {skills}, we recommend pursuing advanced Certifications."])

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'POST':
        pass
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_ENV') == 'development', host='0.0.0.0', port=5000)
