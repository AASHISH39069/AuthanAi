# AuthenAI Machine Learning Benchmark Datasets Documentation

To train and evaluate production deepfake and synthetic identity detection models, the following recognized public academic benchmark datasets are recommended:

---

## 1. Video & Facial Deepfake Benchmarks

### FaceForensics++ (FF++)
- **Authors**: Technical University of Munich (TUM)
- **Modality**: Video Face-swapping, DeepFakes, Face2Face, FaceSwap, NeuralTextures.
- **Scale**: 1,000 original YouTube videos with 4,000 manipulated sequences across raw, HQ, and LQ compression levels.
- **Link**: [https://github.com/ondyari/FaceForensics](https://github.com/ondyari/FaceForensics)

### Celeb-DF (v2)
- **Authors**: SUNY Albany / Purdue
- **Modality**: High-visual-quality deepfake video generations with minimal boundary and temporal warping artifacts.
- **Scale**: 5,639 high-definition videos.
- **Link**: [https://github.com/yuezunli/celeb-deepfakeforensics](https://github.com/yuezunli/celeb-deepfakeforensics)

---

## 2. Voice Anti-Spoofing & Synthetic Audio

### ASVspoof 2021 / 2019
- **Authors**: EURECOM / Inria / University of Eastern Finland
- **Modality**: Logical Access (LA: Text-to-Speech synthesis and voice conversion), Physical Access (PA: acoustic room replays), and Deepfake (DF).
- **Format**: 16kHz uncompressed PCM WAV files.
- **Link**: [https://www.asvspoof.org/](https://www.asvspoof.org/)

---

## 3. Identity Document Tampering

### MIDV-500 & MIDV-2019
- **Authors**: Smart Engines
- **Modality**: 500 video clips of 50 identity documents (passports, identity cards, driving licenses) across various lighting and rotation distortions.
- **Link**: [https://arxiv.org/abs/1807.05786](https://arxiv.org/abs/1807.05786)

### DocTamper
- **Modality**: Fine-grained document image tampering dataset with copy-move, text replacement, and pixel-level splicing masks.

---

## 4. Privacy & Ethical Standards
*Do not commit raw biometric media or copyrighted video datasets to this source repository. Store datasets on secure external S3/GCS buckets with encrypted access controls.*
