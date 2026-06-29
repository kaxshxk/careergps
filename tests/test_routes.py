# Run with: pytest -q
import os
import pytest

# Set defaults for tests before importing the Flask app
os.environ.setdefault('SECRET_KEY', 'test-secret-env')
os.environ.setdefault('GEMINI_API_KEY', 'test-gemini-key')

from app import app

@pytest.fixture(autouse=True)
def mock_requests_post(monkeypatch):
    class MockResponse:
        def __init__(self, json_data, status_code):
            self.json_data = json_data
            self.status_code = status_code
        def json(self):
            return self.json_data
        def raise_for_status(self):
            if self.status_code != 200:
                from requests.exceptions import HTTPError
                raise HTTPError("Mock HTTP Error")
                
    def mock_post(*args, **kwargs):
        return MockResponse({
            "candidates": [{
                "content": {
                    "parts": [{
                        "text": "Based on your experience, we recommend pursuing advanced Certifications."
                    }]
                }
            }]
        }, 200)
        
    monkeypatch.setattr("requests.post", mock_post)

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for testing forms/POST routes
    app.config['RATELIMIT_ENABLED'] = False  # Disable rate limiting for tests
    app.config['SECRET_KEY'] = 'test-secret'  # Override for tests
    with app.test_client() as client:
        yield client

def test_home_route(client):
    resp = client.get('/')
    assert resp.status_code == 200
    assert b'CareerGPS' in resp.data  # Check for expected text

def test_recommend_valid_input(client):
    resp = client.post('/recommend', data={
        'skills': 'Python, Flask',
        'experience': '3'
    })
    assert resp.status_code == 200
    assert b'recommendations' in resp.data  # Adjust to your output

def test_recommend_special_symbols_input(client):
    resp = client.post('/recommend', data={
        'skills': 'C++, C#, Node.js, ASP.NET, Python_Dev',
        'experience': '5'
    })
    assert resp.status_code == 200
    assert b'recommendations' in resp.data

def test_recommend_missing_skills(client):
    resp = client.post('/recommend', data={'experience': '3'})
    assert resp.status_code == 400  # Should fail validation

def test_recommend_experience_out_of_range(client):
    resp = client.post('/recommend', data={
        'skills': 'Python',
        'experience': '65'
    })
    assert resp.status_code == 400
    assert b'Experience must be between 0 and 60 years.' in resp.data

def test_recommend_invalid_origin(client):
    resp = client.post('/recommend', headers={
        'Origin': 'https://evilhackers.com'
    }, data={
        'skills': 'Python',
        'experience': '3'
    })
    assert resp.status_code == 403
    assert b'Forbidden: Invalid request origin' in resp.data

def test_recommend_valid_origin(client):
    resp = client.post('/recommend', headers={
        'Origin': 'http://localhost:5173'
    }, data={
        'skills': 'Python',
        'experience': '3'
    })
    assert resp.status_code == 200


def test_get_market_trends(client):
    resp = client.get('/get-market-trends')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "success"
    assert "trends" in data
    assert len(data["trends"]) > 0

def test_profile_get_route(client):
    resp = client.get('/profile')
    assert resp.status_code == 200
    assert b'Update Profile' in resp.data

def test_profile_post_valid(client):
    with client:
        resp = client.post('/profile', data={
            'name': 'Alice Smith',
            'email': 'alice@example.com',
            'skills': 'Python, Flask, JavaScript'
        }, follow_redirects=True)
        assert resp.status_code == 200
        from flask import session
        assert session.get('name') == 'Alice Smith'
        assert session.get('email') == 'alice@example.com'
        assert session.get('skills') == 'Python, Flask, JavaScript'
        assert b'Profile saved successfully.' in resp.data

def test_profile_post_invalid(client):
    with client:
        resp = client.post('/profile', data={
            'name': '',
            'email': 'alice@example.com',
            'skills': 'Python'
        }, follow_redirects=True)
        assert resp.status_code == 200
        assert b'All fields are required.' in resp.data
