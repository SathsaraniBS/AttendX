import base64
import json
import uuid
import tempfile
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
    print("⚠️ DeepFace not available — demo mode active")

# ✅ MLOps: experiment tracking + DB monitoring
from app.mlops.tracking import log_verification_attempt
from app.mlops.monitoring import log_verification_to_db

# ─────────────────────────────────────────────────────────────
#  CONFIG
#  Model     : Facenet512 (most accurate DeepFace model)
#  Detector  : retinaface (best accuracy) → mtcnn fallback
#
#  Threshold guide (COSINE distance — lower = more similar):
#    0.40 = strict   (false rejections possible in bad lighting)
#    0.55 = balanced ✅ recommended for webcam
#    0.70 = loose    (may allow similar-looking people)
#
#  If YOUR face gets rejected  → increase COSINE_THRESHOLD
#  If OTHER faces pass         → decrease COSINE_THRESHOLD
# ─────────────────────────────────────────────────────────────
MODEL_NAME          = "Facenet512"
COSINE_THRESHOLD    = 0.55    # ✅ balanced
EUCLIDEAN_THRESHOLD = 23.0    # ✅ Facenet512 typical: 10–25
DETECTOR_BACKEND    = "retinaface"   # retinaface > mtcnn > opencv


def _get_temp_path(prefix: str) -> str:
    
    filename = f'attendx_{prefix}_{uuid.uuid4().hex}.jpg'
    return os.path.join(tempfile.gettempdir(), filename)


def _preprocess_image(image: Image.Image) -> Image.Image:

    image = image.resize((640, 480), Image.LANCZOS)
    image = ImageEnhance.Brightness(image).enhance(1.1)
    image = ImageEnhance.Contrast(image).enhance(1.1)
    return image


def _decode_base64_image(image_base64: str) -> Image.Image:
    """Base64 string → PIL Image."""
    if ',' in image_base64:
        image_base64 = image_base64.split(',')[1]
    image_bytes = base64.b64decode(image_base64)
    return Image.open(io.BytesIO(image_bytes)).convert('RGB')


# ─────────────────────────────────────────────────────────────
#  REGISTER — encode face from base64 image
#  Returns: (encoding_json, error_message)
#           encoding_json = None if error
# ─────────────────────────────────────────────────────────────
def encode_face_from_base64(image_base64: str):
    temp_path = _get_temp_path('register')
    try:
        if not DEEPFACE_AVAILABLE:
            return None, "DeepFace not installed. Run: pip install deepface tf-keras"

        image = _decode_base64_image(image_base64)
        image = _preprocess_image(image)
        image.save(temp_path, quality=95)

        try:
            # ✅ retinaface — most accurate
            result = DeepFace.represent(
                img_path=temp_path,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend=DETECTOR_BACKEND
            )
        except Exception:
            # ✅ Fallback: opencv — faster but less accurate
            print("⚠️ retinaface failed — falling back to opencv")
            result = DeepFace.represent(
                img_path=temp_path,
                model_name=MODEL_NAME,
                enforce_detection=False,   
                detector_backend='opencv'
            )

        if not result:
            return None, "No face detected in the image"

        embedding = result[0]['embedding']
        print(f"✅ Face registered | model: {MODEL_NAME} | embedding: {len(embedding)}d")
        return json.dumps(embedding), None

    except ValueError as e:
        # enforce_detection=True — face not found
        return None, "No face detected! Please ensure your face is clearly visible and well-lit."
    except Exception as e:
        print(f"❌ Encode Error: {e}")
        return None, f"Face encoding failed: {str(e)}"
    finally:
        # ✅ Always cleanup temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


# ─────────────────────────────────────────────────────────────
#  VERIFY — compare live face with stored encoding
#  Returns: (verified: bool, message: str)
#
#  student_id, db_conn — optional, pass these from the calling
#  route so this verification attempt gets logged to MLflow
#  and the verification_logs table (MLOps monitoring).
# ─────────────────────────────────────────────────────────────
def verify_face(captured_base64: str, stored_encoding_json: str, student_id=None, db_conn=None):
    temp_path = _get_temp_path('verify')
    try:
        if not DEEPFACE_AVAILABLE:
            return False, "DeepFace not installed. Run: pip install deepface tf-keras"

        image = _decode_base64_image(captured_base64)
        image = _preprocess_image(image)
        image.save(temp_path, quality=95)

        try:
            # ✅ retinaface — most accurate
            captured_result = DeepFace.represent(
                img_path=temp_path,
                model_name=MODEL_NAME,
                enforce_detection=True,  
                detector_backend=DETECTOR_BACKEND
            )
        except Exception:
            # ✅ Fallback: opencv
            print("⚠️ retinaface failed — falling back to opencv")
            captured_result = DeepFace.represent(
                img_path=temp_path,
                model_name=MODEL_NAME,
                enforce_detection=True,
                detector_backend='opencv'
            )

        if not captured_result:
            return False, "No face detected in camera. Please look directly at the camera."

        # ── Embeddings load ──────────────────────────────────
        captured_embedding = np.array(captured_result[0]['embedding'])
        stored_embedding   = np.array(json.loads(stored_encoding_json))

        # ── Cosine distance (primary) ────────────────────────
        dot_product   = np.dot(captured_embedding, stored_embedding)
        norm_captured = np.linalg.norm(captured_embedding)
        norm_stored   = np.linalg.norm(stored_embedding)

        if norm_captured == 0 or norm_stored == 0:
            return False, "Invalid face embedding. Please re-register your face."

        cosine_sim  = dot_product / (norm_captured * norm_stored)
        cosine_dist = 1.0 - cosine_sim

        # ── Euclidean distance (secondary) ───────────────────
        euclidean_dist = float(np.linalg.norm(captured_embedding - stored_embedding))

        confidence = round(float(cosine_sim) * 100, 1)

        # ── Debug logs (Flask server console) ────────────────
        print("─" * 55)
        print(f"🔍 Model            : {MODEL_NAME}")
        print(f"🔍 Cosine dist      : {round(cosine_dist, 4)}  | need < {COSINE_THRESHOLD}  | {'✅ PASS' if cosine_dist < COSINE_THRESHOLD else '❌ FAIL'}")
        print(f"🔍 Euclidean dist   : {round(euclidean_dist, 2)} | need < {EUCLIDEAN_THRESHOLD} | {'✅ PASS' if euclidean_dist < EUCLIDEAN_THRESHOLD else '❌ FAIL'}")
        print(f"🔍 Confidence       : {confidence}%")
        print("─" * 55)

        # ── Decision: BOTH must pass ─────────────────────────
        cosine_ok    = cosine_dist    < COSINE_THRESHOLD
        euclidean_ok = euclidean_dist < EUCLIDEAN_THRESHOLD
        verified     = cosine_ok and euclidean_ok

        if verified:
            message = f"✅ Face verified! Confidence: {confidence}%"
        elif not cosine_ok and not euclidean_ok:
            message = (
                f"❌ Face not matched! Confidence: {confidence}%. "
                f"Try better lighting or face the camera directly."
            )
        elif not cosine_ok:
            message = (
                f"❌ Face not matched! Confidence: {confidence}% "
                f"(cosine: {round(cosine_dist, 3)} — need < {COSINE_THRESHOLD}). "
                f"Try better lighting or look directly at the camera."
            )
        else:
            message = (
                f"❌ Face not matched! Confidence: {confidence}% "
                f"(euclidean: {round(euclidean_dist, 2)} — need < {EUCLIDEAN_THRESHOLD}). "
                f"Please re-register your face for better accuracy."
            )

        # ── ✅ MLOps: Log this verification attempt ──────────
        # Logging is wrapped in try/except so a logging failure
        # can NEVER break actual face verification (security-critical path).
        try:
            log_verification_attempt(
                student_id=student_id,
                cosine_distance=cosine_dist,
                euclidean_distance=euclidean_dist,
                confidence=confidence,
                verified=verified
            )
            if db_conn is not None and student_id is not None:
                log_verification_to_db(
                    db_conn, student_id, cosine_dist, euclidean_dist, confidence, verified
                )
        except Exception as log_err:
            print(f"⚠️ MLOps logging failed (non-critical): {log_err}")

        return verified, message

    except ValueError as e:
        # Face not detected
        return False, "No face detected in camera. Please ensure good lighting and face the camera."
    except json.JSONDecodeError:
        return False, "Stored face encoding is invalid. Please re-register your face."
    except Exception as e:
        print(f"❌ Verify Error: {e}")
        return False, f"Verification error: {str(e)}"
    finally:
        # ✅ Always cleanup temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass