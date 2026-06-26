from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import psycopg2
import os

students_bp = Blueprint('students', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ==================== GET ALL STUDENTS ====================
@students_bp.route('/', methods=['GET'])
def get_students():
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                s.id,
                s.name,
                s.student_id,
                s.email,
                COALESCE(s.phone, '')        AS phone,
                COALESCE(s.class_name, '')   AS class_name,
                COALESCE(s.status, 'Active') AS status,

                -- ✅ Real attendance % from attendance table
                ROUND(
                    CASE
                        WHEN COUNT(a.id) = 0 THEN 0
                        ELSE
                            COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END)::numeric
                            / COUNT(a.id) * 100
                    END
                ) AS attendance_pct,

                COALESCE(s.join_date::text, '') AS join_date,
                s.photo_path,
                CASE WHEN s.face_encoding IS NOT NULL
                     THEN true ELSE false END AS has_face

            FROM students s
            LEFT JOIN attendance a ON a.student_id = s.id
            GROUP BY s.id
            ORDER BY s.id ASC
        """)
        rows = cur.fetchall()
        students = []
        for row in rows:
            students.append({
                'id':         row[0],
                'name':       row[1]  or '',
                'studentId':  row[2]  or '',
                'email':      row[3]  or '',
                'phone':      row[4]  or '',
                'className':  row[5]  or '',
                'status':     row[6]  or 'Active',
                'attendance': int(row[7]) if row[7] else 0,
                'joinDate':   row[8]  or '',
                'photo':      row[9]  or None,
                'hasFace':    row[10] or False,
            })
        return jsonify(students), 200

    except Exception as e:
        print(f"❌ GET Students Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== ADD STUDENT ====================
@students_bp.route('/add', methods=['POST'])
def add_student():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if not data.get('name'):
            return jsonify({'error': 'Name is required'}), 400
        if not data.get('email'):
            return jsonify({'error': 'Email is required'}), 400

        email = data.get('email', '').strip().lower()

        conn = get_db()
        cur = conn.cursor()

        # ✅ Duplicate email check
        cur.execute("SELECT id FROM students WHERE LOWER(email) = %s", (email,))
        if cur.fetchone():
            return jsonify({'error': 'Email already exists'}), 400

        # ✅ Duplicate student ID check
        if data.get('studentId'):
            cur.execute("SELECT id FROM students WHERE student_id = %s", (data['studentId'],))
            if cur.fetchone():
                return jsonify({'error': 'Student ID already exists'}), 400

        join_date = datetime.now().strftime('%Y-%m-%d')

        cur.execute("""
            INSERT INTO students
                (name, student_id, email, phone,
                 class_name, status, attendance, join_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('name'),
            data.get('studentId', ''),
            email,
            data.get('phone', ''),
            data.get('className', ''),
            data.get('status', 'Active'),
            0,
            join_date
        ))
        new_id = cur.fetchone()[0]

        # ✅ Auto users table insert — password HASH කරලා store
        raw_password = data.get('password', '').strip() or email.split('@')[0]
        hashed_password = generate_password_hash(raw_password)

        cur.execute("""
            INSERT INTO users (email, password, role)
            VALUES (%s, %s, 'student')
            ON CONFLICT (email) DO UPDATE
            SET password = EXCLUDED.password, role = 'student'
        """, (email, hashed_password))

        conn.commit()
        print(f"✅ Student added + User created: {email}")

        return jsonify({
            'id':         new_id,
            'name':       data.get('name'),
            'studentId':  data.get('studentId', ''),
            'email':      email,
            'phone':      data.get('phone', ''),
            'className':  data.get('className', ''),
            'status':     data.get('status', 'Active'),
            'attendance': 0,
            'joinDate':   join_date,
            'photo':      None,
            'hasFace':    False,
        }), 201

    except Exception as e:
        print(f"❌ ADD Student Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== GET SINGLE STUDENT ====================
@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                s.id, s.name, s.student_id, s.email,
                COALESCE(s.phone, '')        AS phone,
                COALESCE(s.class_name, '')   AS class_name,
                COALESCE(s.status, 'Active') AS status,

                ROUND(
                    CASE
                        WHEN COUNT(a.id) = 0 THEN 0
                        ELSE
                            COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END)::numeric
                            / COUNT(a.id) * 100
                    END
                ) AS attendance_pct,

                COALESCE(s.join_date::text, '') AS join_date,
                s.photo_path,
                CASE WHEN s.face_encoding IS NOT NULL
                     THEN true ELSE false END AS has_face

            FROM students s
            LEFT JOIN attendance a ON a.student_id = s.id
            WHERE s.id = %s
            GROUP BY s.id
        """, (student_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({
            'id':         row[0],
            'name':       row[1]  or '',
            'studentId':  row[2]  or '',
            'email':      row[3]  or '',
            'phone':      row[4]  or '',
            'className':  row[5]  or '',
            'status':     row[6]  or 'Active',
            'attendance': int(row[7]) if row[7] else 0,
            'joinDate':   row[8]  or '',
            'photo':      row[9]  or None,
            'hasFace':    row[10] or False,
        }), 200

    except Exception as e:
        print(f"❌ GET Single Student Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== UPDATE STUDENT ====================
@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        new_email = data.get('email', '').strip().lower()

        conn = get_db()
        cur = conn.cursor()

        # ✅ Get old email BEFORE update
        cur.execute("SELECT email FROM students WHERE id = %s", (student_id,))
        old_row = cur.fetchone()
        if not old_row:
            return jsonify({'error': 'Student not found'}), 404
        old_email = old_row[0]

        # ✅ Update students table
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
            new_email,
            data.get('phone', ''),
            data.get('className', ''),
            data.get('status', 'Active'),
            data.get('studentId', ''),
            student_id
        ))

        # ✅ Sync users table
        if old_email and new_email:
            email_changed = old_email.lower() != new_email.lower()

            if email_changed:
                # ✅ Old email delete — new email insert
                cur.execute("""
                    DELETE FROM users
                    WHERE LOWER(email) = %s AND role = 'student'
                """, (old_email.lower(),))

                # Password: new provide කළොත් hash, නැත්නම් email prefix
                raw_password = data.get('password', '').strip() or new_email.split('@')[0]
                hashed = generate_password_hash(raw_password)
            else:
                # ✅ Email same — password update check
                if data.get('password', '').strip():
                    # New password provided — hash it
                    hashed = generate_password_hash(data['password'].strip())
                else:
                    # ✅ Bug Fix: old email DELETE කළේ නෑ,
                    # ඉතින් existing password preserve කරනවා
                    cur.execute(
                        "SELECT password FROM users WHERE LOWER(email) = %s",
                        (old_email.lower(),)
                    )
                    pw_row = cur.fetchone()
                    hashed = pw_row[0] if pw_row else generate_password_hash(new_email.split('@')[0])

            cur.execute("""
                INSERT INTO users (email, password, role)
                VALUES (%s, %s, 'student')
                ON CONFLICT (email) DO UPDATE
                SET password = EXCLUDED.password, role = 'student'
            """, (new_email, hashed))

        conn.commit()
        print(f"✅ Student updated: {student_id} → {new_email}")
        return jsonify({'message': 'Updated successfully'}), 200

    except Exception as e:
        print(f"❌ UPDATE Student Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== DELETE STUDENT ====================
@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()

        # ✅ Get email before delete
        cur.execute("SELECT email FROM students WHERE id = %s", (student_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Student not found'}), 404
        email = row[0]

        # ✅ Cascade delete — attendance → students → users
        cur.execute("DELETE FROM attendance WHERE student_id = %s", (student_id,))
        cur.execute("DELETE FROM students WHERE id = %s", (student_id,))

        if email:
            cur.execute("""
                DELETE FROM users
                WHERE LOWER(email) = %s AND role = 'student'
            """, (email.lower(),))

        conn.commit()
        print(f"✅ Student deleted: {email}")
        return jsonify({'message': 'Deleted successfully'}), 200

    except Exception as e:
        print(f"❌ DELETE Student Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== SYNC USERS ====================
@students_bp.route('/sync-users', methods=['POST'])
def sync_users():
    """
    සියලු students → users table sync කරනවා.
    First time setup හෝ manual sync වලට use කරන්න.
    Password: hash කරලා store කරනවා.
    """
    conn = None
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("SELECT id, email FROM students WHERE email IS NOT NULL")
        all_students = cur.fetchall()

        count   = 0
        skipped = 0

        for s in all_students:
            email = s[1]
            if not email:
                skipped += 1
                continue

            # ✅ Password hash කරලා store — plain text නෙමෙයි
            raw_password = email.split('@')[0]
            hashed = generate_password_hash(raw_password)

            cur.execute("""
                INSERT INTO users (email, password, role)
                VALUES (%s, %s, 'student')
                ON CONFLICT (email) DO NOTHING
            """, (email.lower(), hashed))
            count += 1

        conn.commit()
        print(f"✅ Synced {count} students to users table")
        return jsonify({
            'message': f'✅ {count} students synced!',
            'synced':  count,
            'skipped': skipped
        }), 200

    except Exception as e:
        print(f"❌ Sync Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass