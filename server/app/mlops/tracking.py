# server/app/mlops/tracking.py
import mlflow
from datetime import datetime

MLFLOW_TRACKING_URI = "sqlite:///mlflow.db"  # local SQLite backend, simple සහ free
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)
mlflow.set_experiment("attendx-face-verification")

def log_verification_attempt(student_id, cosine_distance, euclidean_distance, 
                               confidence, verified, model_name="Facenet512"):
   
    with mlflow.start_run(run_name=f"verify_{student_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
        mlflow.log_param("student_id", student_id)
        mlflow.log_param("model", model_name)
        mlflow.log_param("cosine_threshold", 0.55)
        mlflow.log_param("euclidean_threshold", 23.0)

        mlflow.log_metric("cosine_distance", cosine_distance)
        mlflow.log_metric("euclidean_distance", euclidean_distance)
        mlflow.log_metric("confidence", confidence)
        mlflow.log_metric("verified", int(verified))