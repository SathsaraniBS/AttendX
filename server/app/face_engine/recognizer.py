import base64
import json
import numpy as np
from PIL import Image
import io
import os

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("✅ DeepFace loaded!")
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("⚠️ DeepFace not available")


def encode_face_from_base64(image_base64: str):
    try:
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]

        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        temp_path = 'temp_register.jpg'
        image.save(temp_path)

        if not DEEPFACE_AVAILABLE:
            return None, "DeepFace not installed"

        result = DeepFace.represent(
            img_path=temp_path,
            model_name='Facenet',
            enforce_detection=True
        )

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not result:
            return None, "No face detected"

        embedding = result[0]['embedding']
        return json.dumps(embedding), None

    except Exception as e:
        if os.path.exists('temp_register.jpg'):
            os.remove('temp_register.jpg')
        return None, f"Face encoding error: {str(e)}"


def verify_face(captured_base64: str, stored_encoding_json: str):
    try:
        if ',' in captured_base64:
            captured_base64 = captured_base64.split(',')[1]

        image_bytes = base64.b64decode(captured_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')

        temp_path = 'temp_verify.jpg'
        image.save(temp_path)

        if not DEEPFACE_AVAILABLE:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return False, "DeepFace not installed"

        captured_result = DeepFace.represent(
            img_path=temp_path,
            model_name='Facenet',
            enforce_detection=True
        )

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not captured_result:
            return False, "No face detected"

        captured_embedding = np.array(captured_result[0]['embedding'])
        stored_embedding   = np.array(json.loads(stored_encoding_json))

        # ✅ Euclidean distance
        euclidean_distance = np.linalg.norm(
            captured_embedding - stored_embedding
        )

        # ✅ Cosine similarity
        dot_product    = np.dot(captured_embedding, stored_embedding)
        norm_captured  = np.linalg.norm(captured_embedding)
        norm_stored    = np.linalg.norm(stored_embedding)
        cosine_sim     = dot_product / (norm_captured * norm_stored)
        confidence     = round(cosine_sim * 100, 1)

        # ✅ Threshold — Facenet: < 10 = same person
        threshold = 10

        if euclidean_distance < threshold:
            return True, f"✅ Face verified! Confidence: {confidence}%"
        else:
            return False, f"❌ Face not matched! Distance: {round(euclidean_distance, 2)}"

    except Exception as e:
        if os.path.exists('temp_verify.jpg'):
            os.remove('temp_verify.jpg')
        return False, f"Verification error: {str(e)}"