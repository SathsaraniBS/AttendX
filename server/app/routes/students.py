from flask import Blueprint, request, jsonify
from datetime import datetime
import psycopg2
import os

students_bp = Blueprint('students', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

@students_bp.route('/', methods=['GET'])
def get_students():
    try:
        conn = get_db()
        cur = conn.cursor()

        # ✅ Explicit column names — order matter නෑ
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
                photo_path
            FROM students
            ORDER BY id ASC
        """)

        rows = cur.fetchall()
        students = []
        for row in rows:
            students.append({
                'id': row[0],
                'name': row[1] or '',
                'studentId': row[2] or '',
                'email': row[3] or '',
                'phone': row[4] or '',
                'className': row[5] or '',
                'status': row[6] or 'Active',
                'attendance': int(row[7]) if row[7] else 0,
                'joinDate': row[8] or '',
                'photo': row[9] or None,
            })

        cur.close()
        conn.close()
        return jsonify(students), 200

    except Exception as e:
        print(f"❌ GET Error: {e}")
        return jsonify({'error': str(e)}), 500


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

        # Duplicate email check
        cur.execute(
            "SELECT id FROM students WHERE email = %s",
            (data['email'],)
        )
        if cur.fetchone():
            cur.close(); conn.close()
            return jsonify({'error': 'Email already exists'}), 400

        # Duplicate student_id check
        if data.get('studentId'):
            cur.execute(
                "SELECT id FROM students WHERE student_id = %s",
                (data['studentId'],)
            )
            if cur.fetchone():
                cur.close(); conn.close()
                return jsonify({'error': 'Student ID already exists'}), 400

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
            datetime.now().strftime('%Y-%m-%d')
        ))

        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return jsonify({
            'id': new_id,
            'name': data.get('name'),
            'studentId': data.get('studentId', ''),
            'email': data.get('email'),
            'phone': data.get('phone', ''),
            'className': data.get('className', ''),
            'status': data.get('status', 'Active'),
            'attendance': 0,
            'joinDate': datetime.now().strftime('%Y-%m-%d'),
            'photo': None
        }), 201

    except Exception as e:
        print(f"❌ ADD Error: {e}")
        return jsonify({'error': str(e)}), 500


@students_bp.route('/<int:student_id>', methods=['GET'])
def get_student(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, student_id, email,
                   COALESCE(phone, '') AS phone,
                   COALESCE(class_name, '') AS class_name,
                   COALESCE(status, 'Active') AS status,
                   COALESCE(attendance, 0) AS attendance,
                   COALESCE(join_date::text, '') AS join_date,
                   photo_path
            FROM students
            WHERE id = %s
        """, (student_id,))

        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({
            'id': row[0],
            'name': row[1] or '',
            'studentId': row[2] or '',
            'email': row[3] or '',
            'phone': row[4] or '',
            'className': row[5] or '',
            'status': row[6] or 'Active',
            'attendance': int(row[7]) if row[7] else 0,
            'joinDate': row[8] or '',
            'photo': row[9] or None,
        }), 200

    except Exception as e:
        print(f"❌ GET Single Error: {e}")
        return jsonify({'error': str(e)}), 500


@students_bp.route('/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        conn = get_db()
        cur = conn.cursor()
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
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Updated successfully'}), 200

    except Exception as e:
        print(f"❌ UPDATE Error: {e}")
        return jsonify({'error': str(e)}), 500


@students_bp.route('/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("DELETE FROM students WHERE id = %s", (student_id,))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'message': 'Deleted successfully'}), 200

    except Exception as e:
        print(f"❌ DELETE Error: {e}")
        return jsonify({'error': str(e)}), 500