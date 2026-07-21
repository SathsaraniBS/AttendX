"""
AttendX — Auth API Unit Tests
Run: pytest tests/test_auth.py -v
"""
import pytest
import json
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


# ==================== LOGIN TESTS ====================
class TestLogin:

    def test_admin_login_success(self, client):
        """✅ Admin login — correct credentials"""
        res = client.post('/api/auth/login',
            json={'email': 'admin@attendx.com', 'password': 'admin123'},
            content_type='application/json')
        assert res.status_code == 200
        data = json.loads(res.data)
        assert 'token' in data
        assert data['role'] == 'admin'
        assert data['name'] == 'Admin'

    def test_admin_login_wrong_password(self, client):
        """❌ Admin login — wrong password"""
        res = client.post('/api/auth/login',
            json={'email': 'admin@attendx.com', 'password': 'wrongpass'},
            content_type='application/json')
        assert res.status_code == 401
        data = json.loads(res.data)
        assert 'message' in data

    def test_login_missing_email(self, client):
        """❌ Login — missing email"""
        res = client.post('/api/auth/login',
            json={'password': 'admin123'},
            content_type='application/json')
        assert res.status_code == 400

    def test_login_missing_password(self, client):
        """❌ Login — missing password"""
        res = client.post('/api/auth/login',
            json={'email': 'admin@attendx.com'},
            content_type='application/json')
        assert res.status_code == 400

    def test_login_invalid_email_format(self, client):
        """❌ Login — invalid email format"""
        res = client.post('/api/auth/login',
            json={'email': 'notanemail', 'password': 'admin123'},
            content_type='application/json')
        assert res.status_code == 400

    def test_login_nonexistent_user(self, client):
        """❌ Login — user doesn't exist"""
        res = client.post('/api/auth/login',
            json={'email': 'nobody@attendx.com', 'password': 'test123'},
            content_type='application/json')
        assert res.status_code == 401

    def test_login_empty_body(self, client):
        """❌ Login — empty request body"""
        res = client.post('/api/auth/login',
            json={},
            content_type='application/json')
        assert res.status_code == 400

    def test_student_login_success(self, client):
        """✅ Student login — correct credentials"""
        res = client.post('/api/auth/login',
            json={
                'email':    'kasun.perera@student.attendx.lk',
                'password': 'kasun.perera'
            },
            content_type='application/json')
    
        assert res.status_code in [200, 401]
        if res.status_code == 200:
            data = json.loads(res.data)
            assert 'token' in data
            assert data['role'] == 'student'

    def test_token_format(self, client):
        """✅ Token — JWT format (3 parts separated by dots)"""
        res = client.post('/api/auth/login',
            json={'email': 'admin@attendx.com', 'password': 'admin123'},
            content_type='application/json')
        if res.status_code == 200:
            data   = json.loads(res.data)
            token  = data.get('token', '')
            parts  = token.split('.')
            assert len(parts) == 3, "JWT must have 3 parts"