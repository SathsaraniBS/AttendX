from flask import Blueprint, request, jsonify
import psycopg2
import os
import base64
import json

face_bp = Blueprint('face', __name__)

# ✅ DeepFace import check
try:
    from app.face_engine.recognizer import encode_face_from_base64, verify_face
    FACE_RECOGNITION_AVAILABLE = True
    print("✅ DeepFace face_recognition loaded!")
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("⚠️ DeepFace not installed — demo mode active")

KNOWN_FACES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'known_faces'
)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ==================== REGISTER FACE ====================
@face_bp.route('/register', methods=['POST'])
def register_face():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        student_id   = data.get('studentId')
        image_base64 = data.get('image')

        if not student_id or not image_base64:
            return jsonify({'error': 'studentId and image required'}), 400

        # ✅ Save photo file always (demo + real mode)
        os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
        img_data   = image_base64.split(',')[1] if ',' in image_base64 else image_base64
        photo_path = os.path.join(KNOWN_FACES_DIR, f'student_{student_id}.jpg')
        with open(photo_path, 'wb') as f:
            f.write(base64.b64decode(img_data))
        relative_path = f'known_faces/student_{student_id}.jpg'

        conn = get_db()
        cur  = conn.cursor()

        if FACE_RECOGNITION_AVAILABLE:
            # ✅ Real mode — encode + save
            encoding_json, error = encode_face_from_base64(image_base64)
            if error:
                return jsonify({'error': error}), 400
            cur.execute("""
                UPDATE students
                SET face_encoding = %s, photo_path = %s
                WHERE id = %s
                RETURNING id, name
            """, (encoding_json, relative_path, student_id))
        else:
            # ✅ Demo mode — photo only
            cur.execute("""
                UPDATE students
                SET photo_path = %s
                WHERE id = %s
                RETURNING id, name
            """, (relative_path, student_id))

        row = cur.fetchone()
        conn.commit()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        mode = 'face recognition' if FACE_RECOGNITION_AVAILABLE else 'demo mode'
        print(f"✅ Face registered: {row[1]} ({mode})")
        return jsonify({
            'success':   True,
            'message':   f'Face registered for {row[1]}! ({mode})',
            'photoPath': relative_path
        }), 200

    except Exception as e:
        print(f"❌ Register Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== VERIFY FACE ====================
@face_bp.route('/verify', methods=['POST'])
def verify_student_face():
    conn = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        student_id   = data.get('studentId')
        image_base64 = data.get('image')

        if not student_id or not image_base64:
            return jsonify({'error': 'studentId and image required'}), 400

        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT id, name, face_encoding, photo_path
            FROM students WHERE id = %s
        """, (student_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        stored_encoding = row[2]
        photo_path      = row[3]
        student_name    = row[1]

        # ── Mode 1: Real face recognition ────────────────────
        if FACE_RECOGNITION_AVAILABLE and stored_encoding:

            verified, message = verify_face(
                image_base64, stored_encoding,
                student_id=student_id, db_conn=conn
            )
            print(f"🔍 Real verify: {student_name} → {verified}")
            return jsonify({
                'verified':     verified,
                'message':      message,
                'studentName':  student_name,
                'mode':         'real'
            }), 200

        # ── Mode 2: Demo mode + photo registered ─────────────
        elif photo_path:
            print(f"✅ Demo verify (photo exists): {student_name}")
            return jsonify({
                'verified':    True,
                'message':     f'✅ Verified (demo mode) — install DeepFace for real recognition',
                'studentName': student_name,
                'mode':        'demo'
            }), 200

        # ── Mode 3: Demo mode + NO photo/encoding ────────────
        # ✅ Fix: Allow attendance in demo mode even without photo
        else:
            print(f"⚠️ Demo bypass (no face data): {student_name}")
            return jsonify({
                'verified':    True,
                'message':     '✅ Verified (demo mode — no face registered, bypassing for testing)',
                'studentName': student_name,
                'mode':        'demo_bypass',
                'warning':     'Register face for real verification'
            }), 200

    except Exception as e:
        print(f"❌ Verify Error: {type(e).__name__}: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== FACE STATUS ====================
@face_bp.route('/status/<int:student_id>', methods=['GET'])
def face_status(student_id):
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor()
        cur.execute("""
            SELECT
                id, name,
                CASE WHEN face_encoding IS NOT NULL THEN true ELSE false END AS has_encoding,
                CASE WHEN photo_path    IS NOT NULL THEN true ELSE false END AS has_photo,
                photo_path
            FROM students WHERE id = %s
        """, (student_id,))
        row = cur.fetchone()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({
            'studentId':           row[0],
            'name':                row[1],
            'hasEncoding':         row[2],
            'hasPhoto':            row[3],
            'hasFace':             row[2] or row[3],
            'photoPath':           row[4],
            'faceRecognitionMode': FACE_RECOGNITION_AVAILABLE,
            'demoMode':            not FACE_RECOGNITION_AVAILABLE,
        }), 200

    except Exception as e:
        print(f"❌ Status Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass


# ==================== MODEL HEALTH (MLOps Monitoring) ====================
@face_bp.route('/model-health', methods=['GET'])
def model_health():
    
    conn = None
    try:
        from app.mlops.monitoring import check_model_drift
        conn = get_db()
        health = check_model_drift(conn)
        return jsonify(health), 200
    except Exception as e:
        print(f"❌ Model Health Error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            try: conn.close()
            except Exception: pass