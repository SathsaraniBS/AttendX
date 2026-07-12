import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from app import app as flask_app


@pytest.fixture
def client():
    """Flask test client — simulates HTTP requests without a real server."""
    flask_app.config['TESTING'] = True
    with flask_app.test_client() as client:
        yield client


class TestHealthEndpoint:

    def test_health_check_returns_200(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200

    def test_health_check_returns_json(self, client):
        response = client.get('/api/health')
        data = response.get_json()
        assert 'status' in data
        assert 'version' in data


class TestAuthEndpoint:

    def test_login_with_missing_fields_returns_400(self, client):
        """No email/password provided — should be rejected, not crash."""
        response = client.post('/api/auth/login', json={})
        assert response.status_code == 400

    def test_login_with_wrong_password_returns_401(self, client):
        """Known admin email + wrong password — should be rejected."""
        response = client.post('/api/auth/login', json={
            'email': 'admin@attendx.com',
            'password': 'definitely_wrong_password_123'
        })
        assert response.status_code == 401

    def test_login_endpoint_requires_json(self, client):
        """Sending no body at all should not crash the server (500)."""
        response = client.post('/api/auth/login')
        assert response.status_code in (400, 415)


class TestNotFoundHandling:

    def test_unknown_route_returns_404(self, client):
        response = client.get('/api/this-route-does-not-exist')
        assert response.status_code == 404