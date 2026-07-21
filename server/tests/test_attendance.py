"""
AttendX — Attendance API Tests
Run: pytest tests/test_attendance.py -v
"""
import pytest
import json
import sys, os
from datetime import date
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


# ==================== ATTENDANCE TESTS ====================
class TestAttendance:

    def test_get_all_attendance(self, client, auth_headers):
        """✅ Get all attendance records"""
        res = client.get('/api/attendance/', headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        assert isinstance(data, list)

    def test_get_attendance_history(self, client, auth_headers):
        """✅ /history alias works"""
        res = client.get('/api/attendance/history', headers=auth_headers)
        assert res.status_code == 200

    def test_get_today_attendance(self, client, auth_headers):
        """✅ Today attendance endpoint"""
        res = client.get('/api/attendance/today', headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        assert isinstance(data, list)

    def test_attendance_record_structure(self, client, auth_headers):
        """✅ Attendance record has required fields"""
        res = client.get('/api/attendance/', headers=auth_headers)
        data = json.loads(res.data)
        if data:
            record = data[0]
            assert 'id'          in record
            assert 'studentId'   in record
            assert 'studentName' in record
            assert 'date'        in record
            assert 'status'      in record
            assert 'timeIn'      in record

    def test_mark_attendance_success(self, client, auth_headers):
        """✅ Mark attendance — valid data"""
        # Get a student first
        students_res = client.get('/api/students/', headers=auth_headers)
        students     = json.loads(students_res.data)
        if not students:
            pytest.skip("No students in DB")

        student_id = students[0]['id']
        today      = date.today().isoformat()

        res = client.post('/api/attendance/mark',
            json={
                'studentId': student_id,
                'date':      today,
                'status':    'Present',
                'time':      '08:00:00'
            },
            headers=auth_headers,
            content_type='application/json')
        # 201 (new) or 409 (already marked today)
        assert res.status_code in [201, 409]

    def test_mark_attendance_invalid_status(self, client, auth_headers):
        """❌ Mark attendance — invalid status"""
        students_res = client.get('/api/students/', headers=auth_headers)
        students     = json.loads(students_res.data)
        if not students:
            pytest.skip("No students in DB")

        res = client.post('/api/attendance/mark',
            json={
                'studentId': students[0]['id'],
                'date':      date.today().isoformat(),
                'status':    'INVALID_STATUS',
            },
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code in [400, 500]

    def test_mark_attendance_missing_student_id(self, client, auth_headers):
        """❌ Mark attendance — missing studentId"""
        res = client.post('/api/attendance/mark',
            json={'date': date.today().isoformat(), 'status': 'Present'},
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 400

    def test_update_attendance_status(self, client, auth_headers):
        """✅ Update attendance status"""
        att_res = client.get('/api/attendance/', headers=auth_headers)
        records = json.loads(att_res.data)
        if not records:
            pytest.skip("No attendance records")

        att_id = records[0]['id']
        res = client.put(f'/api/attendance/{att_id}/status',
            json={'status': 'Late'},
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 200
        data = json.loads(res.data)
        assert data['status'] == 'Late'

    def test_update_invalid_status(self, client, auth_headers):
        """❌ Update attendance — invalid status"""
        att_res = client.get('/api/attendance/', headers=auth_headers)
        records = json.loads(att_res.data)
        if not records:
            pytest.skip("No attendance records")

        att_id = records[0]['id']
        res = client.put(f'/api/attendance/{att_id}/status',
            json={'status': 'WRONG'},
            headers=auth_headers,
            content_type='application/json')
        assert res.status_code == 400

    def test_get_student_attendance(self, client, auth_headers):
        """✅ Get attendance by student ID"""
        students_res = client.get('/api/students/', headers=auth_headers)
        students     = json.loads(students_res.data)
        if not students:
            pytest.skip("No students")

        student_id = students[0]['id']
        res = client.get(f'/api/attendance/student/{student_id}',
                        headers=auth_headers)
        assert res.status_code == 200
        data = json.loads(res.data)
        assert isinstance(data, list)

    def test_attendance_status_values(self, client, auth_headers):
        """✅ All statuses are valid values"""
        res     = client.get('/api/attendance/', headers=auth_headers)
        records = json.loads(res.data)
        valid   = {'Present', 'Absent', 'Late'}
        for r in records:
            assert r['status'] in valid, f"Invalid status: {r['status']}"