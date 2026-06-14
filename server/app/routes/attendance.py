from flask import Blueprint, request, jsonify
import psycopg2
import os

attendance_bp = Blueprint('attendance', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ✅ Get all attendance (Admin) — AttendanceHistory.jsx uses this
@attendance_bp.route('/', methods=['GET'])
def get_all_attendance():
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                s.student_id        AS student_id,
                s.name              AS student_name,
                COALESCE(s.class_name, '') AS class_name,
                a.date::text,
                COALESCE(a.status, 'Present') AS status,
                COALESCE(a.time_in::text, '--') AS time_in,
                TRIM(TO_CHAR(a.date, 'Day')) AS day
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            ORDER BY a.date DESC
        """)
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id':          row[0],
                'studentId':   row[1],   # students.student_id  (e.g. "S2024001")
                'studentName': row[2],
                'class':       row[3],   # AttendanceHistory uses r.class
                'date':        row[4] or '',
                'status':      row[5] or '',
                'timeIn':      row[6] or '--',  # AttendanceHistory uses r.timeIn
                'day':         row[7] or '',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Get all attendance — /history alias (frontend fetch uses this route)
@attendance_bp.route('/history', methods=['GET'])
def get_attendance_history():
    return get_all_attendance()


# ✅ Update attendance status (Admin Edit button in AttendanceHistory.jsx)
@attendance_bp.route('/<int:attendance_id>/status', methods=['PUT'])
def update_attendance_status(attendance_id):
    try:
        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ('Present', 'Late', 'Absent'):
            return jsonify({'error': 'Invalid status'}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            UPDATE attendance
            SET status = %s
            WHERE id = %s
            RETURNING id
        """, (new_status, attendance_id))

        updated = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not updated:
            return jsonify({'error': 'Record not found'}), 404

        return jsonify({'id': updated[0], 'status': new_status, 'message': 'Status updated!'}), 200
    except Exception as e:
        print(f"❌ Update Error: {e}")
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
                COALESCE(status, 'Present') AS status,
                COALESCE(time_in::text, '—') AS time_in,
                TRIM(TO_CHAR(date, 'Day')) AS day
            FROM attendance
            WHERE student_id = %s
            ORDER BY date DESC
        """, (student_id,))
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id':     row[0],
                'date':   row[1] or '',
                'status': row[2] or '',
                'time':   row[3] or '—',
                'day':    row[4] or '',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Mark attendance — NOT CHANGED
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
                (student_id, date, status, time_in)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, date)
            DO UPDATE SET
                status  = EXCLUDED.status,
                time_in = EXCLUDED.time_in
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
@attendance_bp.route('/class/<path:class_name>', methods=['GET'])
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
                COALESCE(a.status, 'Present') AS status,
                COALESCE(a.time_in::text, '—') AS time_in
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            WHERE s.class_name = %s
            ORDER BY a.date DESC, s.name ASC
        """, (class_name,))
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id':          row[0],
                'studentName': row[1],
                'studentId':   row[2],
                'date':        row[3] or '',
                'status':      row[4] or '',
                'time':        row[5] or '—',
            })
        cur.close()
        conn.close()
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Class Error: {e}")
        return jsonify({'error': str(e)}), 500