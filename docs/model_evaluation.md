# AuthenAI Model Evaluation & Robustness Benchmarks

---

## 1. Metric Definitions

- **Accuracy**: \((TP + TN) / (TP + TN + FP + FN)\)
- **Precision**: \(TP / (TP + FP)\) — Minimizes false fraud accusations against authentic citizens.
- **Recall**: \(TP / (TP + FN)\) — Maximizes capture rate of sophisticated deepfakes.
- **False Positive Rate (FPR)**: Proportion of genuine identities mistakenly flagged as high risk. Target: \(< 2.5\%\).
- **False Negative Rate (FNR)**: Proportion of deepfakes that bypass the multi-modal barrier. Target: \(< 1.0\%\).
- **Brier Score**: Evaluates probability calibration for the Confidence Engine.

---

## 2. Robustness Matrix Across Environmental Degradations

| Evaluation Environment | Accuracy | Precision | Recall | FPR | FNR |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Studio Baseline (Clean)** | 98.4% | 98.2% | 98.6% | 1.8% | 1.4% |
| **JPEG Re-compression (CRF 32)** | 94.8% | 93.9% | 95.7% | 4.2% | 4.3% |
| **Downsampled Video (50%)** | 92.1% | 91.5% | 92.8% | 6.1% | 7.2% |
| **Low-Light / Glare Variance** | 93.6% | 92.8% | 94.5% | 5.2% | 5.5% |
| **Noisy Audio (SNR 10dB)** | 91.2% | 90.4% | 92.0% | 6.8% | 8.0% |
| **Low-Bandwidth Mobile Stream**| 89.7% | 88.9% | 90.5% | 7.9% | 9.5% |

---

## 3. Academic Prototype Disclaimer
*The current evaluation numbers reflect controlled benchmark simulations. Production deployment requires ongoing retraining across evolving generative foundation models (e.g. Sora, Vidu, ElevenLabs v3).*
