from flask import Blueprint, request, jsonify
import psycopg2
import os

classes_bp = Blueprint('classes', __name__)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


def ensure_classes_table(cur):
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


# ✅ Get all classes
@classes_bp.route('/', methods=['GET'])
def get_classes():
    try:
        conn = get_db()
        cur  = conn.cursor()

        # ✅ Auto create table if not exists
        ensure_classes_table(cur)
        conn.commit()

        cur.execute("""
            SELECT
                c.id,
                c.name,
                COALESCE(c.code, '')     AS code,
                COALESCE(c.teacher, '')  AS teacher,
                COALESCE(c.schedule, '') AS schedule,
                COALESCE(c.room, '')     AS room,
                COALESCE(c.capacity, 40) AS capacity,
                COALESCE(c.status, 'Active') AS status,
                COALESCE(c.created_at::text, '') AS created_at,
                COUNT(s.id) AS enrolled
            FROM classes c
            LEFT JOIN students s ON s.class_name = c.name
            GROUP BY c.id
            ORDER BY c.id ASC
        """)
        rows    = cur.fetchall()
        classes = []
        for row in rows:
            classes.append({
                'id':         row[0],
                'name':       row[1] or '',
                'code':       row[2] or '',
                'teacher':    row[3] or '',
                'schedule':   row[4] or '',
                'room':       row[5] or '',
                'capacity':   row[6] or 40,
                'status':     row[7] or 'Active',
                'createdAt':  row[8] or '',
                'enrolled':   int(row[9]) if row[9] else 0,
                'attendance': 0,
            })
        cur.close()
        conn.close()
        print(f"✅ Classes fetched: {len(classes)}")
        return jsonify(classes), 200

    except Exception as e:
        print(f"❌ GET Classes Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Add class
@classes_bp.route('/', methods=['POST'])
def add_class():
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({'error': 'Class name required'}), 400

        conn = get_db()
        cur  = conn.cursor()
        ensure_classes_table(cur)

        cur.execute("""
            INSERT INTO classes
                (name, code, teacher, schedule, room, capacity, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            data.get('name'),
            data.get('code', ''),
            data.get('teacher', ''),
            data.get('schedule', ''),
            data.get('room', ''),
            data.get('capacity', 40),
            data.get('status', 'Active'),
        ))
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        print(f"✅ Class added: {data.get('name')}")
        return jsonify({
            'id':         new_id,
            'name':       data.get('name'),
            'code':       data.get('code', ''),
            'teacher':    data.get('teacher', ''),
            'schedule':   data.get('schedule', ''),
            'room':       data.get('room', ''),
            'capacity':   data.get('capacity', 40),
            'status':     data.get('status', 'Active'),
            'enrolled':   0,
            'attendance': 0,
        }), 201

    except Exception as e:
        print(f"❌ ADD Class Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Update class
@classes_bp.route('/<int:class_id>', methods=['PUT'])
def update_class(class_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        conn = get_db()
        cur  = conn.cursor()
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
            data.get('code', ''),
            data.get('teacher', ''),
            data.get('schedule', ''),
            data.get('room', ''),
            data.get('capacity', 40),
            data.get('status', 'Active'),
            class_id
        ))
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Class updated: {class_id}")
        return jsonify({'message': 'Updated successfully'}), 200

    except Exception as e:
        print(f"❌ UPDATE Class Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Delete class
@classes_bp.route('/<int:class_id>', methods=['DELETE'])
def delete_class(class_id):
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute(
            "DELETE FROM classes WHERE id = %s",
            (class_id,)
        )
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Class deleted: {class_id}")
        return jsonify({'message': 'Deleted successfully'}), 200

    except Exception as e:
        print(f"❌ DELETE Class Error: {e}")
        return jsonify({'error': str(e)}), 500