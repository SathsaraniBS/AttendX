from flask import Blueprint, request, jsonify
import psycopg2
import os

classes_bp = Blueprint('classes', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ✅ Fix: App startup-ෙලදී once call කරනවා — every request-ෙලදී නෙමෙයි
def init_classes_table():
    """Classes table create if not exists — called once on startup."""
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS classes (
                id         SERIAL PRIMARY KEY,
                name       VARCHAR(100) NOT NULL,
                code       VARCHAR(50),
                teacher    VARCHAR(100),
                schedule   VARCHAR(100),
                room       VARCHAR(50),
                capacity   INTEGER DEFAULT 40,
                status     VARCHAR(20) DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
        print("✅ Classes table ready")
    except Exception as e:
        print(f"❌ Classes table init error: {e}")
    finally:
        if conn:
            try: conn.close()
            except Exception: pass

# ✅ Call once at import time
init_classes_table()


# ==================== GET ALL CLASSES ====================
@classes_bp.route('/', methods=['GET'])
def get_classes():
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                c.id,
                c.name,
                COALESCE(c.code, '')          AS code,
                COALESCE(c.teacher, '')       AS teacher,
                COALESCE(c.schedule, '')      AS schedule,
                COALESCE(c.room, '')          AS room,
                COALESCE(c.capacity, 40)      AS capacity,
                COALESCE(c.status, 'Active')  AS status,
                COALESCE(c.created_at::text, '') AS created_at,

                -- ✅ DISTINCT — attendance join duplicate prevent
                COUNT(DISTINCT s.id)          AS enrolled,

                -- ✅ Real avg attendance — Present + Late both counted
                ROUND(
                    CASE
                        WHEN COUNT(a.id) = 0 THEN 0
                        ELSE
                            COUNT(CASE WHEN a.status IN ('Present', 'Late') THEN 1 END)::numeric
                            / COUNT(a.id) * 100
                    END
                ) AS avg_attendance

            FROM classes c
            LEFT JOIN students   s ON s.class_name = c.name
            LEFT JOIN attendance a ON a.student_id = s.id
            GROUP BY c.id
            ORDER BY c.id ASC
        """)
        rows    = cur.fetchall()
        classes = []
        for row in rows:
            classes.append({
                'id':         row[0],
                'name':       row[1]  or '',
                'code':       row[2]  or '',
                'teacher':    row[3]  or '',
                'schedule':   row[4]  or '',
                'room':       row[5]  or '',
                'capacity':   row[6]  or 40,
                'status':     row[7]  or 'Active',
                'createdAt':  row[8]  or '',
                'enrolled':   int(row[9])  if row[9]  else 0,
                'attendance': int(row[10]) if row[10] else 0,
            })
        print(f"✅ Classes fetched: {len(classes)}")
        return jsonify(classes), 200

    except Exception as e:
        print(f"❌ GET Classes Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== ADD CLASS ====================
@classes_bp.route('/', methods=['POST'])
def add_class():
    conn = None
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({'error': 'Class name required'}), 400

        conn = get_db()
        cur  = conn.cursor()

        # ✅ Duplicate name check
        cur.execute("SELECT id FROM classes WHERE LOWER(name) = %s", (data['name'].lower(),))
        if cur.fetchone():
            return jsonify({'error': 'Class name already exists!'}), 400

        cur.execute("""
            INSERT INTO classes
                (name, code, teacher, schedule, room, capacity, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('name'),
            data.get('code',     ''),
            data.get('teacher',  ''),
            data.get('schedule', ''),
            data.get('room',     ''),
            data.get('capacity', 40),
            data.get('status',   'Active'),
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        print(f"✅ Class added: {data.get('name')}")

        return jsonify({
            'id':         new_id,
            'name':       data.get('name'),
            'code':       data.get('code',     ''),
            'teacher':    data.get('teacher',  ''),
            'schedule':   data.get('schedule', ''),
            'room':       data.get('room',     ''),
            'capacity':   data.get('capacity', 40),
            'status':     data.get('status',   'Active'),
            'enrolled':   0,
            'attendance': 0,
        }), 201

    except Exception as e:
        print(f"❌ ADD Class Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== UPDATE CLASS ====================
@classes_bp.route('/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        conn = get_db()
        cur  = conn.cursor()

        # ✅ Exist check
        cur.execute("SELECT id FROM classes WHERE id = %s", (class_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Class not found'}), 404

        cur.execute("""
            UPDATE classes SET
                name     = %s,
                code     = %s,
                teacher  = %s,
                schedule = %s,
                room     = %s,
                capacity = %s,
                status   = %s
            WHERE id = %s
        """, (
            data.get('name'),
            data.get('code',     ''),
            data.get('teacher',  ''),
            data.get('schedule', ''),
            data.get('room',     ''),
            data.get('capacity', 40),
            data.get('status',   'Active'),
            class_id
        ))
        conn.commit()
        print(f"✅ Class updated: {class_id}")
        return jsonify({'message': 'Updated successfully'}), 200

    except Exception as e:
        print(f"❌ UPDATE Class Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== DELETE CLASS ====================
@classes_bp.route('/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()

        # ✅ Exist check
        cur.execute("SELECT name FROM classes WHERE id = %s", (class_id,))
        row = cur.fetchone()
        if not row:
            return jsonify({'error': 'Class not found'}), 404
        class_name = row[0]

        cur.execute("DELETE FROM classes WHERE id = %s", (class_id,))
        conn.commit()
        print(f"✅ Class deleted: {class_name} ({class_id})")
        return jsonify({'message': 'Deleted successfully'}), 200

    except Exception as e:
        print(f"❌ DELETE Class Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass