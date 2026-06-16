import base64
import json
import numpy as np
from PIL import Image, ImageEnhance
import io
import os

try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    print("✅ DeepFace loaded!")
except ImportError:
    DEEPFACE_AVAILABLE = False
    print("⚠️ DeepFace not available")

# ─────────────────────────────────────────────
#  CONFIG
#  Model: Facenet512 (most accurate)
#  Threshold guide:
#    COSINE  0.40 = strict | 0.55 = balanced ✅ | 0.70 = loose
#    If your own face gets rejected  → increase COSINE_THRESHOLD
#    If other faces pass             → decrease COSINE_THRESHOLD
# ─────────────────────────────────────────────
MODEL_NAME           = "Facenet512"
COSINE_THRESHOLD     = 0.55   # ✅ balanced — works well in normal lighting
EUCLIDEAN_THRESHOLD  = 23.0   # ✅ Facenet512 typical range: 10–25


# ─────────────────────────────────────────────
#  HELPER — preprocess image before encoding
#  Improves accuracy in dark / low-quality webcam shots
# ─────────────────────────────────────────────
def _preprocess_image(image: Image.Image) -> Image.Image:
    # Consistent size
    image = image.resize((640, 480), Image.LANCZOS)

    # Slightly boost brightness & contrast for dark webcam images
    image = ImageEnhance.Brightness(image).enhance(1.1)
    image = ImageEnhance.Contrast(image).enhance(1.1)

    return image


# ─────────────────────────────────────────────
#  REGISTER — encode face from base64 image
# ─────────────────────────────────────────────
def encode_face_from_base64(image_base64: str):
    temp_path = 'temp_register.jpg'
    try:
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]

        image_bytes = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = _preprocess_image(image)
        image.save(temp_path, quality=95)

        if not DEEPFACE_AVAILABLE:
            return None, "DeepFace not installed"

        result = DeepFace.represent(
            img_path=temp_path,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend='opencv'   # fast & stable for webcam images
        )

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not result:
            return None, "No face detected"

        embedding = result[0]['embedding']
        print(f"✅ Face registered | embedding size: {len(embedding)}")
        return json.dumps(embedding), None

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return None, f"Face encoding error: {str(e)}"


# ─────────────────────────────────────────────
#  VERIFY — compare live face with stored encoding
# ─────────────────────────────────────────────
def verify_face(captured_base64: str, stored_encoding_json: str):
    temp_path = 'temp_verify.jpg'
    try:
        if ',' in captured_base64:
            captured_base64 = captured_base64.split(',')[1]

        image_bytes = base64.b64decode(captured_base64)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image = _preprocess_image(image)
        image.save(temp_path, quality=95)

        if not DEEPFACE_AVAILABLE:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            return False, "DeepFace not installed"

        captured_result = DeepFace.represent(
            img_path=temp_path,
            model_name=MODEL_NAME,
            enforce_detection=True,
            detector_backend='opencv'
        )

        if os.path.exists(temp_path):
            os.remove(temp_path)

        if not captured_result:
            return False, "No face detected in camera"

        captured_embedding = np.array(captured_result[0]['embedding'])
        stored_embedding   = np.array(json.loads(stored_encoding_json))

        # ── Cosine distance (primary check) ──────────────────
        dot_product   = np.dot(captured_embedding, stored_embedding)
        norm_captured = np.linalg.norm(captured_embedding)
        norm_stored   = np.linalg.norm(stored_embedding)
        cosine_sim    = dot_product / (norm_captured * norm_stored)
        cosine_dist   = 1.0 - cosine_sim   # 0 = identical, 2 = opposite

        # ── Euclidean distance (secondary check) ─────────────
        euclidean_dist = np.linalg.norm(captured_embedding - stored_embedding)

        confidence = round(cosine_sim * 100, 1)

        # ── Debug logs (visible in Flask server console) ──────
        print("─" * 50)
        print(f"🔍 Cosine distance  : {round(cosine_dist, 4)}  | threshold: < {COSINE_THRESHOLD}")
        print(f"🔍 Euclidean distance: {round(euclidean_dist, 2)} | threshold: < {EUCLIDEAN_THRESHOLD}")
        print(f"🔍 Confidence       : {confidence}%")
        print(f"🔍 Cosine pass      : {cosine_dist < COSINE_THRESHOLD}")
        print(f"🔍 Euclidean pass   : {euclidean_dist < EUCLIDEAN_THRESHOLD}")
        print("─" * 50)

        # ── Decision: BOTH must pass ──────────────────────────
        cosine_ok    = cosine_dist    < COSINE_THRESHOLD
        euclidean_ok = euclidean_dist < EUCLIDEAN_THRESHOLD

        if cosine_ok and euclidean_ok:
            return True, f"✅ Face verified! Confidence: {confidence}%"

        # ── Helpful rejection message ─────────────────────────
        if not cosine_ok:
            return False, (
                f"❌ Face not matched! Confidence: {confidence}% "
                f"(cosine: {round(cosine_dist, 3)} — need < {COSINE_THRESHOLD}). "
                f"Try better lighting or face the camera directly."
            )
        return False, (
            f"❌ Face not matched! Confidence: {confidence}% "
            f"(euclidean: {round(euclidean_dist, 2)} — need < {EUCLIDEAN_THRESHOLD})."
        )

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return False, f"Verification error: {str(e)}"