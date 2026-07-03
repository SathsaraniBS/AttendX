from flask import Blueprint, request, jsonify
from datetime import date
import psycopg2
import os

attendance_bp = Blueprint('attendance', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ==================== GET ALL ATTENDANCE (Admin) ====================
@attendance_bp.route('/', methods=['GET'])
def get_all_attendance():
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                s.student_id                   AS student_id,
                s.name                         AS student_name,
                COALESCE(s.class_name, '')     AS class_name,
                a.date::text,
                COALESCE(a.status, 'Present')  AS status,
                COALESCE(a.time_in::text, '--') AS time_in,
                TRIM(TO_CHAR(a.date, 'Day'))   AS day
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            ORDER BY a.date DESC
        """)
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id':          row[0],
                'studentId':   row[1] or '',
                'studentName': row[2] or '',
                'class':       row[3] or '',
                'date':        row[4] or '',
                'status':      row[5] or '',
                'timeIn':      row[6] or '--',
                'day':         row[7] or '',
            })
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ GET All Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== HISTORY ALIAS ====================
@attendance_bp.route('/history', methods=['GET'])
def get_attendance_history():
    return get_all_attendance()


# ==================== TODAY'S ATTENDANCE ====================
# ✅ NEW: LiveAttendance.jsx uses this route
@attendance_bp.route('/today', methods=['GET'])
def get_today_attendance():
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                s.student_id                    AS student_id,
                s.name                          AS student_name,
                COALESCE(s.class_name, '')      AS class_name,
                a.date::text,
                COALESCE(a.status,   'Present') AS status,
                COALESCE(a.time_in::text, '--') AS time_in
            FROM attendance a
            JOIN students s ON s.id = a.student_id
            WHERE a.date = %s
            ORDER BY a.time_in DESC NULLS LAST
        """, (date.today(),))
        rows = cur.fetchall()
        records = []
        for row in rows:
            records.append({
                'id':          row[0],
                'studentId':   row[1] or '',
                'studentName': row[2] or '',
                'class':       row[3] or '',
                'date':        row[4] or '',
                'status':      row[5] or '',
                'timeIn':      row[6] or '--',
                # ✅ LiveAttendance.jsx field names
                'name':       row[2] or '',
                'student_id': row[1] or '',
                'time_in':    row[6] or '--',
            })
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Today Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== UPDATE ATTENDANCE STATUS ====================
@attendance_bp.route('/<int:attendance_id>/status', methods=['PUT'])
def update_attendance_status(attendance_id):
    conn = None
    try:
        data       = request.get_json()
        new_status = data.get('status') if data else None

        if new_status not in ('Present', 'Late', 'Absent'):
            return jsonify({'error': 'Invalid status'}), 400

        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            UPDATE attendance
            SET status = %s
            WHERE id = %s
            RETURNING id
        """, (new_status, attendance_id))
        updated = cur.fetchone()
        conn.commit()

        if not updated:
            return jsonify({'error': 'Record not found'}), 404

        return jsonify({'id': updated[0], 'status': new_status, 'message': 'Status updated!'}), 200
    except Exception as e:
        print(f"❌ Update Status Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== GET ATTENDANCE BY STUDENT ID ====================
@attendance_bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_attendance(student_id):
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                id,
                date::text,
                COALESCE(status,         'Present') AS status,
                COALESCE(time_in::text,  '—')       AS time_in,
                TRIM(TO_CHAR(date, 'Day'))           AS day
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
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Student Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== MARK ATTENDANCE ====================
@attendance_bp.route('/mark', methods=['POST'])
def mark_attendance():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        student_id = data.get('studentId')
        mark_date  = data.get('date')
        status     = data.get('status', 'Present')
        time_in    = data.get('time')

        if not student_id or not mark_date:
            return jsonify({'error': 'studentId and date required'}), 400

        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            INSERT INTO attendance (student_id, date, status, time_in)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, date)
            DO UPDATE SET
                status  = EXCLUDED.status,
                time_in = EXCLUDED.time_in
            RETURNING id
        """, (student_id, mark_date, status, time_in))
        new_id = cur.fetchone()[0]
        conn.commit()
        print(f"✅ Attendance marked: student={student_id} date={mark_date} status={status}")
        return jsonify({'id': new_id, 'message': 'Attendance marked!'}), 201

    except Exception as e:
        err = str(e)
        print(f"❌ Mark Error: {e}")
        # ✅ Already marked — friendly message
        if 'already' in err.lower() or 'unique' in err.lower():
            return jsonify({'error': 'Attendance already marked for today!'}), 409
        return jsonify({'error': err}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== GET ATTENDANCE BY CLASS ====================
@attendance_bp.route('/class/<path:class_name>', methods=['GET'])
def get_class_attendance(class_name):
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                a.id,
                s.name          AS student_name,
                s.student_id,
                a.date::text,
                COALESCE(a.status,        'Present') AS status,
                COALESCE(a.time_in::text, '—')       AS time_in
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
                'studentName': row[1] or '',
                'studentId':   row[2] or '',
                'date':        row[3] or '',
                'status':      row[4] or '',
                'time':        row[5] or '—',
            })
        return jsonify(records), 200
    except Exception as e:
        print(f"❌ Class Attendance Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== ATTENDANCE SUMMARY (Dashboard) ====================
@attendance_bp.route('/summary', methods=['GET'])
def get_attendance_summary():
    """Admin Dashboard attendance summary — today/week/month stats."""
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        today = date.today()

        cur.execute("""
            SELECT
                COUNT(*)                                                            AS total,
                COUNT(CASE WHEN status IN ('Present', 'Late') THEN 1 END)          AS present,
                COUNT(CASE WHEN status = 'Absent'             THEN 1 END)          AS absent,
                COUNT(CASE WHEN status = 'Late'               THEN 1 END)          AS late,
                COUNT(CASE WHEN date = %s                     THEN 1 END)          AS today_total,
                COUNT(CASE WHEN date = %s AND status IN ('Present','Late') THEN 1 END) AS today_present
            FROM attendance
        """, (today, today))
        row = cur.fetchone()

        return jsonify({
            'total':         int(row[0] or 0),
            'present':       int(row[1] or 0),
            'absent':        int(row[2] or 0),
            'late':          int(row[3] or 0),
            'todayTotal':    int(row[4] or 0),
            'todayPresent':  int(row[5] or 0),
        }), 200
    except Exception as e:
        print(f"❌ Summary Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass