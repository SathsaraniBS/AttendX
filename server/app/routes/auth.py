from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import psycopg2
import jwt
import os

auth_bp = Blueprint('auth', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

def _verify_password(stored_password, input_password):
    # Plain text check (legacy)
    if stored_password == input_password:
        return True
    # Hash check
    try:
        return check_password_hash(stored_password, input_password)
    except Exception:
        return False

def _make_token(payload_data):
    payload = {
        **payload_data,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(
        payload,
        os.getenv('SECRET_KEY', 'attendx_secret'),
        algorithm='HS256'
    )


# ==================== LOGIN ====================
@auth_bp.route('/login', methods=['POST'])
def login():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email    = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()

        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400

        conn = get_db()
        cur  = conn.cursor()

        # ── Step 1: users table check ────────────────────────
        cur.execute("""
            SELECT id, email, password, role
            FROM users
            WHERE LOWER(email) = %s
        """, (email,))
        user = cur.fetchone()

        # ── Step 2: Admin login ──────────────────────────────
        if user and user[3] == 'admin':
            if not _verify_password(user[2], password):
                return jsonify({'message': 'Invalid email or password!'}), 401

            token = _make_token({'id': user[0], 'email': email, 'role': 'admin'})

            
            return jsonify({
                'token':    token,
                'name':     'Admin',
                'role':     'admin',
                'redirect': '/admin-dashboard',
                'message':  'Admin login successful!'
            }), 200

        # ── Step 3: Student login ────────────────────────────
        if user and user[3] == 'student':
            if not _verify_password(user[2], password):
                return jsonify({'message': 'Invalid email or password!'}), 401

        elif not user:
          
            default_password = email.split('@')[0]
            if password != default_password:
                return jsonify({'message': 'Invalid email or password!'}), 401

        else:
            # Unknown role
            return jsonify({'message': 'Invalid email or password!'}), 401

        # ── Step 4: Student details fetch ───────────────────
        cur.execute("""
            SELECT
                s.id,
                s.name,
                s.student_id,
                s.email,
                COALESCE(s.phone, '')        AS phone,
                COALESCE(s.class_name, '')   AS class_name,
                COALESCE(s.status, 'Active') AS status,
                COALESCE(s.join_date::text, '') AS join_date,

                -- ✅ Real attendance % from attendance table
                ROUND(
                    CASE
                        WHEN COUNT(a.id) = 0 THEN 0
                        ELSE
                            COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END)::numeric
                            / COUNT(a.id) * 100
                    END
                ) AS attendance_pct

            FROM students s
            LEFT JOIN attendance a ON a.student_id = s.id
            WHERE LOWER(s.email) = %s
            GROUP BY s.id
        """, (email,))
        student = cur.fetchone()

        if not student:
            return jsonify({'message': 'Student record not found!'}), 401

        token = _make_token({'id': student[0], 'email': email, 'role': 'student'})

        return jsonify({
            'token':    token,
            'name':     student[1],
            'role':     'student',
            'redirect': '/student-dashboard',
            'student': {
                'id':         student[0],
                'name':       student[1]  or '',
                'studentId':  student[2]  or '',
                'email':      student[3]  or '',
                'phone':      student[4]  or '',
                'className':  student[5]  or '',
                'status':     student[6]  or 'Active',
                'joinDate':   student[7]  or '',
                'attendance': int(student[8]) if student[8] else 0,
            }
        }), 200

    except jwt.PyJWTError as e:
        print(f"❌ JWT Error: {e}")
        return jsonify({'message': 'Token generation failed'}), 500
    except Exception as e:
        print(f"❌ Login Error: {e}")
        return jsonify({'message': 'Server error. Please try again.'}), 500
    finally:
        # ✅ Connection leak fix — always close
        if conn:
            try:
                conn.close()
            except Exception:
                pass


# ==================== CHANGE PASSWORD ====================
@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    """Admin/Student password change endpoint."""
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400

        email        = data.get('email', '').strip().lower()
        current_pass = data.get('currentPassword', '').strip()
        new_pass     = data.get('newPassword', '').strip()

        if not email or not current_pass or not new_pass:
            return jsonify({'message': 'All fields required'}), 400

        if len(new_pass) < 6:
            return jsonify({'message': 'Password must be at least 6 characters'}), 400

        conn = get_db()
        cur  = conn.cursor()

        cur.execute("SELECT id, password FROM users WHERE LOWER(email) = %s", (email,))
        user = cur.fetchone()

        if not user:
            return jsonify({'message': 'User not found'}), 404

        if not _verify_password(user[1], current_pass):
            return jsonify({'message': 'Current password is incorrect'}), 401

        # ✅ Hash new password before storing
        hashed = generate_password_hash(new_pass)
        cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, user[0]))
        conn.commit()

        return jsonify({'message': 'Password changed successfully!'}), 200

    except Exception as e:
        print(f"❌ Change Password Error: {e}")
        return jsonify({'message': 'Server error'}), 500
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


# ==================== REGISTER (Admin use only) ====================
@auth_bp.route('/register', methods=['POST'])
def register():
    
    return jsonify({'message': 'Registration is managed by the system administrator.'}), 403


# ==================== HASH EXISTING PASSWORDS (one-time util) ====================
@auth_bp.route('/hash-passwords', methods=['POST'])
def hash_existing_passwords():
    
    conn = None
    try:
        data = request.get_json()
        # ✅ Simple admin key protection
        if not data or data.get('adminKey') != os.getenv('SETUP_KEY', 'setup_2024'):
            return jsonify({'message': 'Unauthorized'}), 403

        conn = get_db()
        cur  = conn.cursor()

        cur.execute("SELECT id, password FROM users")
        users = cur.fetchall()

        updated = 0
        skipped = 0
        for u in users:
            uid, pwd = u[0], u[1]
            if not pwd:
                skipped += 1
                continue
            # Already hashed passwords start with 'pbkdf2:' or 'scrypt:'
            if pwd.startswith('pbkdf2:') or pwd.startswith('scrypt:'):
                skipped += 1
                continue
            hashed = generate_password_hash(pwd)
            cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, uid))
            updated += 1

        conn.commit()
        return jsonify({
            'message': f'✅ {updated} passwords hashed, {skipped} skipped.',
            'updated': updated,
            'skipped': skipped
        }), 200

    except Exception as e:
        print(f"❌ Hash Error: {e}")
        return jsonify({'message': str(e)}), 500
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass