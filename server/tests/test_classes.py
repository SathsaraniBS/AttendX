"""
AttendX — Classes API Tests
Run: pytest tests/test_classes.py -v
"""
import pytest
import json
import time
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def admin_token(client):
    res = client.post('/api/auth/login',
        json={'email': 'admin@attendx.com', 'password': 'admin123'},
        content_type='application/json')
    if res.status_code == 200:
        return json.loads(res.data)['token']
    return None

@pytest.fixture
def auth_headers(admin_token):
    return {'Authorization': f'Bearer {admin_token}'}


# ==================== CLASSES TESTS ====================
class TestClasses:

    def test_get_classes(self, client, auth_headers):
        """✅ Get all classes"""
        res = client.get('/api/classes/', headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        assert isinstance(data, list)

    def test_class_structure(self, client, auth_headers):
        """✅ Class data has required fields"""
        res  = client.get('/api/classes/', headers=auth_headers)
        data = json.loads(res.data)
        if data:
            cls = data[0]
            assert 'id'         in cls
            assert 'name'       in cls
            assert 'enrolled'   in cls
            assert 'attendance' in cls
            assert 'status'     in cls

    def test_add_class_success(self, client, auth_headers):
        """✅ Add class — valid data"""
        unique = int(time.time())
        res = client.post('/api/classes/',
            json={
                'name':     f'TEST-{unique}',
                'code':     f'TST{unique}',
                'teacher':  'Mr. Test',
                'schedule': 'Mon 9:00 AM',
                'room':     'A101',
                'capacity': 30,
                'status':   'Active'
            },
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 201
        data = json.loads(res.data)
        assert 'id'   in data
        assert 'name' in data
        return data.get('id')

    def test_add_class_missing_name(self, client, auth_headers):
        """❌ Add class — missing name"""
        res = client.post('/api/classes/',
            json={'code': 'TST001', 'teacher': 'Mr. Test'},
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 400

    def test_add_duplicate_class(self, client, auth_headers):
        """❌ Add class — duplicate name"""
        # First get existing class
        res  = client.get('/api/classes/', headers=auth_headers)
        data = json.loads(res.data)
        if not data:
            pytest.skip("No classes to test duplicate")

        existing_name = data[0]['name']
        res2 = client.post('/api/classes/',
            json={'name': existing_name},
            headers=auth_headers,
            content_type='application/json')
        assert res2.status_code == 400

    def test_update_class(self, client, auth_headers):
        """✅ Update class"""
        res  = client.get('/api/classes/', headers=auth_headers)
        data = json.loads(res.data)
        if not data:
            pytest.skip("No classes to update")

        cls_id = data[0]['id']
        res2   = client.put(f'/api/classes/{cls_id}',
            json={**data[0], 'teacher': 'Updated Teacher'},
            headers=auth_headers,
            content_type='application/json')
        assert res2.status_code == 200

    def test_update_nonexistent_class(self, client, auth_headers):
        """❌ Update class — doesn't exist"""
        res = client.put('/api/classes/999999',
            json={'name': 'Test', 'status': 'Active'},
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 404

    def test_attendance_percentage_valid(self, client, auth_headers):
        """✅ Class attendance % is 0-100"""
        res  = client.get('/api/classes/', headers=auth_headers)
        data = json.loads(res.data)
        for cls in data:
            assert 0 <= cls['attendance'] <= 100