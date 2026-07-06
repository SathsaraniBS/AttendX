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
                   COUNT(*) FILTER (WHERE confidence < %s) * 1.0 / COUNT(*) as low_conf_rate,
                   COUNT(*) as total_attempts
            FROM verification_logs
            WHERE created_at >= %s
        """, (CONFIDENCE_ALERT_THRESHOLD, datetime.now() - timedelta(hours=24)))
        
        avg_confidence, low_conf_rate, total = cursor.fetchone()

        alerts = []
        if avg_confidence and avg_confidence < CONFIDENCE_ALERT_THRESHOLD:
            alerts.append(f"⚠️ Average confidence dropped to {avg_confidence:.1f}%")
        if low_conf_rate and low_conf_rate > LOW_CONFIDENCE_RATE_THRESHOLD:
            alerts.append(f"⚠️ {low_conf_rate*100:.1f}% of verifications had low confidence")

        return {
            "avg_confidence": avg_confidence,
            "low_confidence_rate": low_conf_rate,
            "total_attempts": total,
            "alerts": alerts,
            "status": "degraded" if alerts else "healthy"
        }
    finally:
        cursor.close()