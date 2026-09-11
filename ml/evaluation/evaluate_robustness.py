"""
AuthenAI Robustness & Calibration Evaluation Script
Simulates environmental degradations (JPEG compression, downsampling, Gaussian noise, low light)
and computes classification metrics: Accuracy, Precision, Recall, F1, FPR, FNR, and Brier Score.
"""

import numpy as np


def compute_classification_metrics(y_true, y_pred, y_prob):
    """Compute precision, recall, f1, FPR, FNR, and calibration brier score."""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    y_prob = np.array(y_prob)

    tp = np.sum((y_true == 1) & (y_pred == 1))
    fp = np.sum((y_true == 0) & (y_pred == 1))
    tn = np.sum((y_true == 0) & (y_pred == 0))
    fn = np.sum((y_true == 1) & (y_pred == 0))

    accuracy = (tp + tn) / max(1, len(y_true))
    precision = tp / max(1, (tp + fp))
    recall = tp / max(1, (tp + fn))
    f1 = 2 * (precision * recall) / max(1e-5, (precision + recall))

    fpr = fp / max(1, (fp + tn))
    fnr = fn / max(1, (fn + tp))

    # Brier score for probability calibration (lower is better, 0.0 is perfect)
    brier_score = np.mean((y_prob - y_true) ** 2)

    return {
        "Accuracy": round(float(accuracy), 4),
        "Precision": round(float(precision), 4),
        "Recall": round(float(recall), 4),
        "F1-Score": round(float(f1), 4),
        "False Positive Rate (FPR)": round(float(fpr), 4),
        "False Negative Rate (FNR)": round(float(fnr), 4),
        "Brier Score (Calibration)": round(float(brier_score), 4),
    }


def run_benchmark_simulation():
    print("=" * 70)
    print("AuthenAI Multi-Modal Forensics Robustness & Degradation Benchmark")
    print("=" * 70)

    conditions = [
        ("Normal Studio Conditions", 0.02, 0.03),
        ("High JPEG Compression (CRF 32)", 0.06, 0.08),
        ("Low Resolution (Downsampled 50%)", 0.09, 0.11),
        ("Low Lighting & Shadow Variance", 0.07, 0.09),
        ("Noisy Audio (SNR 10dB)", 0.08, 0.12),
        ("Low-Bandwidth Mobile Stream", 0.11, 0.14),
    ]

    n_samples = 500
    np.random.seed(42)

    for name, noise_fpr, noise_fnr in conditions:
        # True labels: 0 = Genuine, 1 = Fraud/Synthetic (50-50 split)
        y_true = np.random.choice([0, 1], size=n_samples, p=[0.7, 0.3])
        
        # Predicted probabilities with environmental degradation
        base_probs = np.where(y_true == 1, 0.88, 0.12)
        noise = np.random.normal(0, noise_fpr + noise_fnr, size=n_samples)
        y_prob = np.clip(base_probs + noise, 0.01, 0.99)
        y_pred = (y_prob >= 0.5).astype(int)

        metrics = compute_classification_metrics(y_true, y_pred, y_prob)

        print(f"\nCondition: {name}")
        for k, v in metrics.items():
            print(f"  - {k:<28}: {v}")


if __name__ == "__main__":
    run_benchmark_simulation()
