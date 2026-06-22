# Run with: pytest -q
import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for testing forms/POST routes
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

def test_recommend_missing_skills(client):
    resp = client.post('/recommend', data={'experience': '3'})
    assert resp.status_code == 400  # Should fail validation
