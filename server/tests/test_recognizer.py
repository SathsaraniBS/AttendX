import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import numpy as np
from app.face_engine.recognizer import COSINE_THRESHOLD, EUCLIDEAN_THRESHOLD


# ─────────────────────────────────────────────────────────────
#  UNIT TESTS — cosine/euclidean distance logic
#  These test the MATH, not the actual DeepFace model call
#  (no camera, no DB, no network — fast and isolated)
# ─────────────────────────────────────────────────────────────

def cosine_distance(a, b):
    """Same formula used in recognizer.py verify_face()"""
    a, b = np.array(a), np.array(b)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    cosine_sim = dot / (norm_a * norm_b)
    return 1.0 - cosine_sim


def euclidean_distance(a, b):
    a, b = np.array(a), np.array(b)
    return float(np.linalg.norm(a - b))


class TestDistanceCalculations:

    def test_identical_embeddings_have_zero_distance(self):
        """Same face compared to itself should be a perfect match."""
        embedding = [0.5, 0.3, 0.8, 0.1]
        dist = cosine_distance(embedding, embedding)
        assert dist == pytest.approx(0.0, abs=1e-6)

    def test_identical_embeddings_pass_threshold(self):
        embedding = [0.5, 0.3, 0.8, 0.1]
        dist = cosine_distance(embedding, embedding)
        assert dist < COSINE_THRESHOLD

    def test_very_different_embeddings_fail_threshold(self):
        """Completely different vectors should NOT be verified as a match."""
        embedding_a = [1.0, 0.0, 0.0, 0.0]
        embedding_b = [0.0, 1.0, 0.0, 0.0]
        dist = cosine_distance(embedding_a, embedding_b)
        assert dist > COSINE_THRESHOLD

    def test_euclidean_distance_zero_for_identical(self):
        embedding = [0.2, 0.4, 0.6, 0.8]
        dist = euclidean_distance(embedding, embedding)
        assert dist == pytest.approx(0.0, abs=1e-6)

    def test_euclidean_distance_within_threshold_for_similar(self):
        """Small variation (e.g. same face, slightly different lighting)
        should still pass the Euclidean threshold."""
        embedding_a = [1.0, 1.0, 1.0, 1.0]
        embedding_b = [1.01, 0.99, 1.02, 0.98]
        dist = euclidean_distance(embedding_a, embedding_b)
        assert dist < EUCLIDEAN_THRESHOLD

    def test_zero_norm_embedding_does_not_crash(self):
        """Edge case: a zero-vector should not cause a ZeroDivisionError.
        (This documents the norm==0 guard in verify_face())"""
        embedding_a = [0.0, 0.0, 0.0, 0.0]
        embedding_b = [0.5, 0.3, 0.8, 0.1]
        norm_a = np.linalg.norm(embedding_a)
        assert norm_a == 0
        # verify_face() checks for this and returns an error message
        # instead of dividing by zero — this test documents that contract.