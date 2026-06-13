from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import psycopg2
import jwt
import os

auth_bp = Blueprint('auth', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email    = data.get('email', '').strip()
        password = data.get('password', '').strip()

        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400

        conn = get_db()
        cur  = conn.cursor()

        # ✅ Step 1 — Check users table
        cur.execute("""
            SELECT id, email, password, role
            FROM users
            WHERE email = %s
        """, (email,))
        user = cur.fetchone()

        # ✅ Step 2 — Admin login
        if user and user[3] == 'admin':

            stored_password = user[2]

            password_match = (password == stored_password)

            if not password_match:
                try:
                    password_match = check_password_hash(stored_password, password)
                except Exception:
                    password_match = False

            if not password_match:
                cur.close(); conn.close()
                return jsonify({'message': 'Invalid email or password!'}), 401

            token = jwt.encode({
                'id':    user[0],
                'email': email,
                'role':  'admin',
                'exp':   datetime.utcnow() + timedelta(hours=24)
            }, os.getenv('SECRET_KEY', 'attendx_secret'), algorithm='HS256')

            cur.close()
            conn.close()

            return jsonify({
                'token':    token,
                'name':     'Admin',
                'role':     'admin',
                'redirect': '/admin-dashboard',
                'message':  'Admin login successful!'
            }), 200

        # ✅ Step 3 — Student login
        # First check users table
        if user and user[3] == 'student':
            stored_password = user[2]

            # Plain text compare
            password_match = (password == stored_password)

            # Hash compare
            if not password_match:
                try:
                    password_match = check_password_hash(stored_password, password)
                except Exception:
                    password_match = False

            if not password_match:
                cur.close(); conn.close()
                return jsonify({'message': 'Invalid email or password!'}), 401

        elif not user:
            default_password = email.split('@')[0]
            if password != default_password:
                cur.close(); conn.close()
                return jsonify({'message': 'Invalid email or password!'}), 401

        else:
            cur.close(); conn.close()
            return jsonify({'message': 'Invalid email or password!'}), 401

        # ✅ Step 4 — Get student details
        cur.execute("""
            SELECT
                id, name, student_id, email,
                COALESCE(phone, '') AS phone,
                COALESCE(class_name, '') AS class_name,
                COALESCE(status, 'Active') AS status,
                COALESCE(attendance, 0) AS attendance,
                COALESCE(join_date::text, '') AS join_date
            FROM students
            WHERE email = %s
        """, (email,))
        student = cur.fetchone()

        cur.close()
        conn.close()

        if not student:
            return jsonify({'message': 'Student not found!'}), 401

        token = jwt.encode({
            'id':    student[0],
            'email': email,
            'role':  'student',
            'exp':   datetime.utcnow() + timedelta(hours=24)
        }, os.getenv('SECRET_KEY', 'attendx_secret'), algorithm='HS256')

        return jsonify({
            'token':    token,
            'name':     student[1],
            'role':     'student',
            'redirect': '/student-dashboard',
            'student': {
                'id':         student[0],
                'name':       student[1],
                'studentId':  student[2],
                'email':      student[3],
                'phone':      student[4] or '',
                'className':  student[5] or '',
                'status':     student[6] or 'Active',
                'attendance': student[7] or 0,
                'joinDate':   student[8] or '',
            }
        }), 200

    except Exception as e:
        print(f"❌ Login Error: {e}")
        return jsonify({'message': str(e)}), 500


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    return jsonify({'message': 'Registered successfully!'}), 201