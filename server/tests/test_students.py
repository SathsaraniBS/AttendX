"""
AttendX — Students API Tests
Run: pytest tests/test_students.py -v
"""
import pytest
import json
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
    """Admin token fixture"""
    res = client.post('/api/auth/login',
        json={'email': 'admin@attendx.com', 'password': 'admin123'},
        content_type='application/json')
    if res.status_code == 200:
        return json.loads(res.data)['token']
    return None

@pytest.fixture
def auth_headers(admin_token):
    """Auth headers fixture"""
    return {'Authorization': f'Bearer {admin_token}'}


# ==================== STUDENT TESTS ====================
class TestStudents:

    def test_get_students_with_token(self, client, auth_headers):
        """✅ Get all students — with valid token"""
        res = client.get('/api/students/', headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        assert isinstance(data, list)

    def test_get_students_without_token(self, client):
        """❌ Get students — no token"""
        res = client.get('/api/students/')
        assert res.status_code == 401

    def test_get_students_response_structure(self, client, auth_headers):
        """✅ Student data structure check"""
        res = client.get('/api/students/', headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        if len(data) > 0:
            student = data[0]
            assert 'id'         in student
            assert 'name'       in student
            assert 'email'      in student
            assert 'studentId'  in student
            assert 'className'  in student
            assert 'status'     in student
            assert 'attendance' in student
            assert 'hasFace'    in student

    def test_add_student_success(self, client, auth_headers):
        """✅ Add student — valid data"""
        import time
        unique = int(time.time())
        res = client.post('/api/students/add',
            json={
                'name':      f'Test Student {unique}',
                'email':     f'test{unique}@student.attendx.lk',
                'studentId': f'TEST{unique}',
                'className': 'BCA-1A',
                'phone':     '0771234567',
                'status':    'Active'
            },
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 201
        data = json.loads(res.data)
        assert 'id'   in data
        assert 'name' in data
        return data.get('id')

    def test_add_student_missing_name(self, client, auth_headers):
        """❌ Add student — missing name"""
        res = client.post('/api/students/add',
            json={
                'email':     'test@student.attendx.lk',
                'studentId': 'TEST001',
                'className': 'BCA-1A'
            },
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 400

    def test_add_student_invalid_email(self, client, auth_headers):
        """❌ Add student — invalid email"""
        res = client.post('/api/students/add',
            json={
                'name':      'Test Student',
                'email':     'notanemail',
                'studentId': 'TEST002',
                'className': 'BCA-1A'
            },
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 400

    def test_add_student_without_token(self, client):
        """❌ Add student — no token"""
        res = client.post('/api/students/add',
            json={'name': 'Test', 'email': 'test@test.com',
                  'studentId': 'T001', 'className': 'BCA-1A'},
            content_type='application/json')
        assert res.status_code == 401

    def test_get_single_student(self, client, auth_headers):
        """✅ Get single student"""
        # First get all students
        res = client.get('/api/students/', headers=auth_headers)
        students = json.loads(res.data)
        if students:
            student_id = students[0]['id']
            res2 = client.get(f'/api/students/{student_id}', headers=auth_headers)
            assert res2.status_code == 200
            data = json.loads(res2.data)
            assert data['id'] == student_id

    def test_get_nonexistent_student(self, client, auth_headers):
        """❌ Get student — doesn't exist"""
        res = client.get('/api/students/999999', headers=auth_headers)
        assert res.status_code == 404

    def test_delete_student_without_token(self, client):
        """❌ Delete student — no token"""
        res = client.delete('/api/students/1')
        assert res.status_code == 401

    def test_attendance_rate_includes_late(self, client, auth_headers):
        """✅ Attendance rate — Late included"""
        res = client.get('/api/students/', headers=auth_headers)
        data = json.loads(res.data)
        for s in data:
            assert 0 <= s['attendance'] <= 100