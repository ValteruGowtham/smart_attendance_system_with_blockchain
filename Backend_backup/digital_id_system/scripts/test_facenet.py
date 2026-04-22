"""
Test script to verify FaceNet installation and basic functionality
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Testing FaceNet installation...")

try:
    import torch
    print(f"✓ PyTorch version: {torch.__version__}")
except ImportError as e:
    print(f"✗ PyTorch not found: {e}")

try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    print("✓ FaceNet PyTorch imported successfully")
    
    # Try to initialize models
    mtcnn = MTCNN(image_size=160, margin=0, device='cpu')
    print("✓ MTCNN face detector initialized")
    
    resnet = InceptionResnetV1(pretrained='vggface2').eval()
    print("✓ InceptionResnet face encoder initialized (vggface2)")
    
except ImportError as e:
    print(f"✗ FaceNet PyTorch not found: {e}")
except Exception as e:
    print(f"✗ Error initializing models: {e}")

try:
    import cv2
    print(f"✓ OpenCV version: {cv2.__version__}")
except ImportError as e:
    print(f"✗ OpenCV not found: {e}")

try:
    import numpy as np
    print(f"✓ NumPy version: {np.__version__}")
except ImportError as e:
    print(f"✗ NumPy not found: {e}")

try:
    from PIL import Image
    print(f"✓ Pillow (PIL) imported successfully")
except ImportError as e:
    print(f"✗ Pillow not found: {e}")

print("\n" + "="*50)
print("Setup verification complete!")
print("="*50)
