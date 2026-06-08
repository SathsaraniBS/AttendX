from flask import Blueprint, request, jsonify
import psycopg2
import os

attendance_bp = Blueprint('attendance', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))

# ✅ Get all attendance (Admin)
@attendance_bp.route('/', methods=['GET'])
def get_all_attendance():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                a.student_id,
                s.name AS student_name,
                s.class_name,
                a.date::text,
                a.status,
                COALESCE(a.check_in_time::text, '—') AS time,
                TRIM(TO_CHAR(a.date, 'Day')) AS day
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            ORDER BY a.date DESC
        """)
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id': row[0],
                'studentId': row[1],
                'studentName': row[2],
                'className': row[3],
                'date': row[4] or '',
                'status': row[5] or '',
                'time': row[6] or '—',
                'day': row[7] or '',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ Get attendance by student ID
@attendance_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                id,
                date::text,
                status,
                COALESCE(check_in_time::text, '—') AS time,
                TRIM(TO_CHAR(date, 'Day')) AS day
            FROM attendance
            WHERE student_id = %s
            ORDER BY date DESC
        """, (student_id,))
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id': row[0],
                'date': row[1] or '',
                'status': row[2] or '',
                'time': row[3] or '—',
                'day': row[4] or '',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Student Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ Mark attendance (Admin / System)
@attendance_bp.route('/mark', methods=['POST'])
def mark_attendance():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO attendance
                (student_id, date, status, check_in_time)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, date)
            DO UPDATE SET
                status = EXCLUDED.status,
                check_in_time = EXCLUDED.check_in_time
            RETURNING id
        """, (
            data.get('studentId'),
            data.get('date'),
            data.get('status', 'Present'),
            data.get('time')
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'id': new_id, 'message': 'Attendance marked!'}), 201
    except Exception as e:
        print(f"❌ Mark Error: {e}")
        return jsonify({'error': str(e)}), 500

# ✅ Get attendance by class
@attendance_bp.route('/class/<class_name>', methods=['GET'])
def get_class_attendance(class_name):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                s.name AS student_name,
                s.student_id,
                a.date::text,
                a.status,
                COALESCE(a.check_in_time::text, '—') AS time
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            WHERE s.class_name = %s
            ORDER BY a.date DESC, s.name ASC
        """, (class_name,))
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id': row[0],
                'studentName': row[1],
                'studentId': row[2],
                'date': row[3] or '',
                'status': row[4] or '',
                'time': row[5] or '—',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Class Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500