from flask import Blueprint, request, jsonify
import psycopg2
import os
import base64
import json

face_bp = Blueprint('face', __name__)

# ✅ face_recognition available check
try:
    from app.face_engine.recognizer import encode_face_from_base64, verify_face
    FACE_RECOGNITION_AVAILABLE = True
    print("✅ face_recognition loaded!")
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False
    print("⚠️ face_recognition not installed — demo mode")

KNOWN_FACES_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    'known_faces'
)

def get_db():
    return psycopg2.connect(os.getenv('DATABASE_URL'))


# ✅ Register student face
@face_bp.route('/register', methods=['POST'])
def register_face():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        student_id = data.get('studentId')
        image_base64 = data.get('image')

        if not student_id or not image_base64:
            return jsonify({'error': 'studentId and image required'}), 400

        # ✅ Save photo file
        os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
        img_data = image_base64.split(',')[1] if ',' in image_base64 else image_base64
        photo_path = os.path.join(KNOWN_FACES_DIR, f'student_{student_id}.jpg')
        with open(photo_path, 'wb') as f:
            f.write(base64.b64decode(img_data))

        relative_path = f'known_faces/student_{student_id}.jpg'

        # ✅ face_recognition available නම් — real encoding
        if FACE_RECOGNITION_AVAILABLE:
            encoding_json, error = encode_face_from_base64(image_base64)
            if error:
                return jsonify({'error': error}), 400

            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                UPDATE students
                SET face_encoding = %s,
                    photo_path = %s
                WHERE id = %s
                RETURNING id, name
            """, (encoding_json, relative_path, student_id))
        else:
            # ✅ Demo mode — photo only save
            conn = get_db()
            cur = conn.cursor()
            cur.execute("""
                UPDATE students
                SET photo_path = %s
                WHERE id = %s
                RETURNING id, name
            """, (relative_path, student_id))

        row = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        mode = 'with face recognition' if FACE_RECOGNITION_AVAILABLE else 'demo mode'
        return jsonify({
            'success': True,
            'message': f'Face registered for {row[1]}! ({mode})',
            'photoPath': relative_path
        }), 200

    except Exception as e:
        print(f"❌ Register Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Verify face (Mark Attendance ෙලදී)
@face_bp.route('/verify', methods=['POST'])
def verify_student_face():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data'}), 400

        student_id = data.get('studentId')
        image_base64 = data.get('image')

        if not student_id or not image_base64:
            return jsonify({'error': 'studentId and image required'}), 400

        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, face_encoding, photo_path
            FROM students WHERE id = %s
        """, (student_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        stored_encoding = row[2]
        photo_path = row[3]

        # ✅ face_recognition available + encoding stored
        if FACE_RECOGNITION_AVAILABLE and stored_encoding:
            verified, message = verify_face(image_base64, stored_encoding)
            return jsonify({
                'verified': verified,
                'message': message,
                'studentName': row[1]
            }), 200

        # ✅ Demo mode හෝ encoding නෑ නම් — photo stored check
        elif photo_path:
            # Photo store කරලා තියෙනවා — demo verify
            return jsonify({
                'verified': True,
                'message': 'Verified (demo mode — install face_recognition for real verification)',
                'studentName': row[1]
            }), 200

        else:
            return jsonify({
                'verified': False,
                'error': 'No face registered. Ask admin to register your face first.'
            }), 400

    except Exception as e:
        print(f"❌ Verify Error: {e}")
        return jsonify({'error': str(e)}), 500


# ✅ Face status check
@face_bp.route('/status/<int:student_id>', methods=['GET'])
def face_status(student_id):
    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name,
                   CASE WHEN face_encoding IS NOT NULL
                   THEN true ELSE false END AS has_encoding,
                   CASE WHEN photo_path IS NOT NULL
                   THEN true ELSE false END AS has_photo,
                   photo_path
            FROM students WHERE id = %s
        """, (student_id,))
        row = cur.fetchone()
        cur.close()
        conn.close()

        if not row:
            return jsonify({'error': 'Student not found'}), 404

        return jsonify({
            'studentId': row[0],
            'name': row[1],
            'hasEncoding': row[2],
            'hasPhoto': row[3],
            'hasFace': row[2] or row[3],
            'photoPath': row[4],
            'faceRecognitionMode': FACE_RECOGNITION_AVAILABLE
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500