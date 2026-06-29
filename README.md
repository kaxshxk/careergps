# CareerGPS: Smart Career Guidance Engine

![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Tests](https://github.com/kaxshxk/careergps/actions/workflows/test.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 💡 The Problem
Job seekers waste hours manually comparing their skills to job descriptions, missing hidden gaps. Recruiters struggle to identify candidates with nuanced skill matches beyond keyword stuffing.

## 🚀 Our Solution
CareerGPS is a Flask web app that:
- Analyzes user profiles against real-time job market data
- Recommends skill-gap filling courses
- Visualizes match strength with clean visual charts
- **Key tech**: Flask, Pandas, WTForms, Pytest, REST APIs

## ✨ Features Shown
- Secure session handling (env-based secrets, CSRF protection)
- Input validation & sanitization (OWASP Top 10 compliant)
- Error-resilient API integration (graceful degradation)
- Test-driven development (pytest coverage >80%)
- Container-ready (Dockerfile included)

## ⚡️ Quick Start

### 🐧 macOS / Linux
```bash
git clone https://github.com/kaxshxk/careergps.git
cd careergps
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(16))")  # Dev only
python app.py
```

### 🪟 Windows
```powershell
git clone https://github.com/kaxshxk/careergps.git
cd careergps
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
set SECRET_KEY=your-secure-secret-key
python app.py
```

> [!TIP]
> **Windows Users:** You can also run the pre-configured [start-career-gps.bat](file:///C:/Users/valle/Documents/WORK/careergpsxpathforge/start-career-gps.bat) file at the root of the project to bootstrap and spin up the frontend and backend servers automatically.

Visit http://localhost:5000


## 🧪 Run Tests
```bash
pytest -q  # Should show all tests passing
```

## 💻 Try It Live
▶️ Launch in GitHub Codespaces

## 📜 License
MIT © kaxshxk
