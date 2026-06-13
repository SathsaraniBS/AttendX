from flask import Blueprint, request, jsonify
from datetime import datetime
import psycopg2
import os

students_bp = Blueprint('students', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ✅ Get all students
@students_bp.route('/', methods=['GET'])
def get_students():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                id,
                name,
                student_id,
                email,
                COALESCE(phone, '') AS phone,
                COALESCE(class_name, '') AS class_name,
                COALESCE(status, 'Active') AS status,
                COALESCE(attendance, 0) AS attendance,
                COALESCE(join_date::text, '') AS join_date,
                photo_path,
                CASE WHEN face_encoding IS NOT NULL
                THEN true ELSE false END AS has_face
            FROM students
            ORDER BY id ASC
        """)
        rows = cur.fetchall()
        students = []
        for row in rows:
            students.append({
                'id':         row[0],
                'name':       row[1] or '',
                'studentId':  row[2] or '',
                'email':      row[3] or '',
                'phone':      row[4] or '',
                'className':  row[5] or '',
                'status':     row[6] or 'Active',
                'attendance': int(row[7]) if row[7] else 0,
                'joinDate':   row[8] or '',
                'photo':      row[9] or None,
                'hasFace':    row[10] or False,
            })
        cur.close()
        conn.close()
        return jsonify(students), 200

    except Exception as e:
        print(f"❌ GET Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Add student — auto users table insert
@students_bp.route('/add', methods=['POST'])
def add_student():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400

        conn = get_db()
        cur = conn.cursor()

        # ✅ Duplicate email check
        cur.execute(
            "SELECT id FROM students WHERE email = %s",
            (data['email'],)
        )
        if cur.fetchone():
            cur.close(); conn.close()
            return jsonify({'error': 'Email already exists'}), 400

        # ✅ Duplicate student_id check
        if data.get('studentId'):
            cur.execute(
                "SELECT id FROM students WHERE student_id = %s",
                (data['studentId'],)
            )
            if cur.fetchone():
                cur.close(); conn.close()
                return jsonify({'error': 'Student ID already exists'}), 400

        join_date = datetime.now().strftime('%Y-%m-%d')

        # ✅ Step 1 — Students table insert
        cur.execute("""
            INSERT INTO students
                (name, student_id, email, phone,
                 class_name, status, attendance, join_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('name'),
            data.get('studentId', ''),
            data.get('email'),
            data.get('phone', ''),
            data.get('className', ''),
            data.get('status', 'Active'),
            0,
            join_date
        ))
        new_id = cur.fetchone()[0]

        # ✅ Step 2 — Auto users table insert
        password = data.get('password', '')
        if not password:
            password = data.get('email', '').split('@')[0]

        cur.execute("""
            INSERT INTO users (email, password, role)
            VALUES (%s, %s, 'student')
            ON CONFLICT (email) DO UPDATE
            SET password = EXCLUDED.password,
                role     = 'student'
        """, (data.get('email'), password))

        print(f"✅ Student + User created: {data.get('email')}")

        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'id':         new_id,
            'name':       data.get('name'),
            'studentId':  data.get('studentId', ''),
            'email':      data.get('email'),
            'phone':      data.get('phone', ''),
            'className':  data.get('className', ''),
            'status':     data.get('status', 'Active'),
            'attendance': 0,
            'joinDate':   join_date,
            'photo':      None,
            'hasFace':    False,
        }), 201

    except Exception as e:
        print(f"❌ ADD Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Get single student
@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                id, name, student_id, email,
                COALESCE(phone, '') AS phone,
                COALESCE(class_name, '') AS class_name,
                COALESCE(status, 'Active') AS status,
                COALESCE(attendance, 0) AS attendance,
                COALESCE(join_date::text, '') AS join_date,
                photo_path,
                CASE WHEN face_encoding IS NOT NULL
                THEN true ELSE false END AS has_face
            FROM students
            WHERE id = %s
        """, (student_id,))

        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({
            'id':         row[0],
            'name':       row[1] or '',
            'studentId':  row[2] or '',
            'email':      row[3] or '',
            'phone':      row[4] or '',
            'className':  row[5] or '',
            'status':     row[6] or 'Active',
            'attendance': int(row[7]) if row[7] else 0,
            'joinDate':   row[8] or '',
            'photo':      row[9] or None,
            'hasFace':    row[10] or False,
        }), 200

    except Exception as e:
        print(f"❌ GET Single Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Update student — users table auto sync
@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        conn = get_db()
        cur = conn.cursor()

        # ✅ Old email get
        cur.execute(
            "SELECT email FROM students WHERE id = %s",
            (student_id,)
        )
        old_row  = cur.fetchone()
        old_email = old_row[0] if old_row else None

        # ✅ Students table update
        cur.execute("""
            UPDATE students SET
                name       = %s,
                email      = %s,
                phone      = %s,
                class_name = %s,
                status     = %s,
                student_id = %s
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('email'),
            data.get('phone', ''),
            data.get('className', ''),
            data.get('status', 'Active'),
            data.get('studentId', ''),
            student_id
        ))

        # ✅ Users table sync
        new_email = data.get('email')
        if old_email and new_email:

            if old_email != new_email:
                cur.execute("""
                    DELETE FROM users
                    WHERE email = %s AND role = 'student'
                """, (old_email,))

            # Password get
            password = data.get('password', '')
            if not password:
                # Existing password keep
                cur.execute(
                    "SELECT password FROM users WHERE email = %s",
                    (old_email,)
                )
                pw_row   = cur.fetchone()
                password = pw_row[0] if pw_row else new_email.split('@')[0]

            # ✅ Upsert user
            cur.execute("""
                INSERT INTO users (email, password, role)
                VALUES (%s, %s, 'student')
                ON CONFLICT (email) DO UPDATE
                SET password = EXCLUDED.password,
                    role     = 'student'
            """, (new_email, password))

            print(f"✅ User updated: {new_email}")

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Updated successfully'}), 200

    except Exception as e:
        print(f"❌ UPDATE Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Delete student — users + attendance auto delete
@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()

        # ✅ Email get before delete
        cur.execute(
            "SELECT email FROM students WHERE id = %s",
            (student_id,)
        )
        row   = cur.fetchone()
        email = row[0] if row else None

        # ✅ Attendance records delete first (FK constraint)
        cur.execute(
            "DELETE FROM attendance WHERE student_id = %s",
            (student_id,)
        )

        # ✅ Student delete
        cur.execute(
            "DELETE FROM students WHERE id = %s",
            (student_id,)
        )

        # ✅ Users table delete
        if email:
            cur.execute("""
                DELETE FROM users
                WHERE email = %s AND role = 'student'
            """, (email,))
            print(f"✅ User deleted: {email}")

        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Deleted successfully'}), 200

    except Exception as e:
        print(f"❌ DELETE Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Sync all existing students to users table
@students_bp.route('/sync-users', methods=['POST'])
def sync_users():
    try:
        conn = get_db()
        cur = conn.cursor()

        # All students get
        cur.execute("SELECT id, email, student_id FROM students")
        students = cur.fetchall()

        count   = 0
        skipped = 0

        for student in students:
            email      = student[1]
            student_id = student[2]

            if not email:
                skipped += 1
                continue

            # Password = email prefix
            password = email.split('@')[0]

            cur.execute("""
                INSERT INTO users (email, password, role)
                VALUES (%s, %s, 'student')
                ON CONFLICT (email) DO NOTHING
            """, (email, password))

            count += 1

        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ Synced {count} students to users table")
        return jsonify({
            'message': f'✅ {count} students synced!',
            'synced':  count,
            'skipped': skipped
        }), 200

    except Exception as e:
        print(f"❌ Sync Error: {e}")
        return jsonify({'error': str(e)}), 500