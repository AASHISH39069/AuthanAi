# AuthenAI Model Training Pipelines

This folder provides instructions and scripts for training modular neural network classifiers when upgrading from prototype heuristics to dedicated deep learning models.

---

## Modular Architectures

1. **Document Tampering (ELA + EfficientNet)**:
   - Input: 3-channel ELA residual image (difference after JPEG 90% recompression).
   - Backbone: `timm` EfficientNet-B0 fine-tuned on binary cross-entropy (genuine vs tampered).

2. **Face Landmark Correlation & Embedding**:
   - Backbone: Pretrained MobileFaceNet or FaceNet (Inception-ResNet-v1).
   - Loss: ArcFace / CosFace loss for metric learning.

3. **Temporal Video Deepfake Classifier**:
   - Input: Sequences of 16 aligned face frames.
   - Model: 3D-CNN (ResNet3D / I3D) or TimeSformer examining inter-frame facial boundary jitter.

4. **Synthetic Voice Detector**:
   - Input: Log-mel spectrograms + Constant Q Transform (CQT).
   - Model: RawNet2 / LightCNN analyzing high-frequency phase and spectral cutoff anomalies.
