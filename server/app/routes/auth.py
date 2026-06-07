from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import psycopg2
import jwt
import os

auth_bp = Blueprint('auth', __name__)

TEMP_ADMIN = {
    "email": "admin@attendx.com",
    "password": generate_password_hash("admin123"),
    "name": "Admin",
    "role": "admin"
}

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email = data.get('email', '').strip()
        password = data.get('password', '').strip()

        # ✅ Check Admin first
        if email == TEMP_ADMIN['email']:
            if check_password_hash(TEMP_ADMIN['password'], password):
                token = jwt.encode({
                    'email': email,
                    'name': TEMP_ADMIN['name'],
                    'role': 'admin',
                    'exp': datetime.utcnow() + timedelta(hours=24)
                }, os.getenv('SECRET_KEY', 'attendx_secret'), algorithm='HS256')

                return jsonify({
                    'token': token,
                    'name': TEMP_ADMIN['name'],
                    'role': 'admin',
                    'redirect': '/admin-dashboard',
                    'message': 'Admin login successful!'
                }), 200
            else:
                return jsonify({'message': 'Invalid password!'}), 401

        # ✅ Check Student
        try:
            conn = psycopg2.connect(os.getenv('DATABASE_URL'))
            cur = conn.cursor()
            cur.execute("""
                SELECT id, name, student_id, email, phone,
                       class_name, status, attendance,
                       join_date::text
                FROM students
                WHERE email = %s
            """, (email,))
            student = cur.fetchone()
            cur.close()
            conn.close()

            if not student:
                return jsonify({'message': 'Email not found!'}), 401

            # ✅ Password check
            # Default password = email prefix (before @)
            default_password = email.split('@')[0]

            if password != default_password and password != 'student123':
                return jsonify({'message': 'Invalid password!'}), 401

            token = jwt.encode({
                'id': student[0],
                'email': email,
                'role': 'student',
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, os.getenv('SECRET_KEY', 'attendx_secret'), algorithm='HS256')

            return jsonify({
                'token': token,
                'name': student[1],
                'role': 'student',
                'redirect': '/student-dashboard',
                'student': {
                    'id': student[0],
                    'name': student[1],
                    'studentId': student[2],
                    'email': student[3],
                    'phone': student[4] or '',
                    'className': student[5] or '',
                    'status': student[6] or 'Active',
                    'attendance': student[7] or 0,
                    'joinDate': student[8] or '',
                }
            }), 200

        except Exception as db_err:
            print(f"DB Error: {db_err}")
            return jsonify({'message': 'Database error!'}), 500

    except Exception as e:
        print(f"Login Error: {e}")
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return jsonify({'message': 'Registered successfully!'}), 201