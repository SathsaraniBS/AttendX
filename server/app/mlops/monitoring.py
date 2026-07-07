# server/app/mlops/monitoring.py
import psycopg2
from datetime import datetime, timedelta

CONFIDENCE_ALERT_THRESHOLD = 70.0  
LOW_CONFIDENCE_RATE_THRESHOLD = 0.15  


def check_model_drift(db_connection):

    cursor = db_connection.cursor()
    try:
        cursor.execute("""
            SELECT AVG(confidence), 
                   COUNT(*) FILTER (WHERE confidence < %s) * 1.0 / NULLIF(COUNT(*), 0) as low_conf_rate,
                   COUNT(*) as total_attempts
            FROM verification_logs
            WHERE created_at >= %s
        """, (CONFIDENCE_ALERT_THRESHOLD, datetime.now() - timedelta(hours=24)))

        avg_confidence, low_conf_rate, total = cursor.fetchone()

        # ✅ FIX: PostgreSQL NUMERIC division returns a Decimal that can
        # print as scientific notation (e.g. "0E-20"). Convert to plain
        # Python float so the API always returns a clean, predictable number.
        avg_confidence = float(avg_confidence) if avg_confidence is not None else 0.0
        low_conf_rate  = float(low_conf_rate)  if low_conf_rate  is not None else 0.0

        alerts = []
        if avg_confidence and avg_confidence < CONFIDENCE_ALERT_THRESHOLD:
            alerts.append(f"⚠️ Average confidence dropped to {avg_confidence:.1f}%")
        if low_conf_rate and low_conf_rate > LOW_CONFIDENCE_RATE_THRESHOLD:
            alerts.append(f"⚠️ {low_conf_rate*100:.1f}% of verifications had low confidence")

        return {
            "avg_confidence": round(avg_confidence, 2),
            "low_confidence_rate": round(low_conf_rate, 4),
            "total_attempts": total,
            "alerts": alerts,
            "status": "degraded" if alerts else "healthy"
        }
    finally:
        cursor.close()


# ─────────────────────────────────────────────────────────────
#  LOG — insert one verification attempt into verification_logs
#  Called from recognizer.py -> verify_face() after every attempt.
# ─────────────────────────────────────────────────────────────
def log_verification_to_db(db_conn, student_id, cosine_distance, euclidean_distance, confidence, verified):

    cursor = db_conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO verification_logs 
                (student_id, cosine_distance, euclidean_distance, confidence, verified)
            VALUES (%s, %s, %s, %s, %s)
        """, (student_id, cosine_distance, euclidean_distance, confidence, verified))
        db_conn.commit()
    except Exception as e:
        db_conn.rollback()
        print(f"⚠️ Failed to log verification to DB: {e}")
    finally:
        cursor.close()