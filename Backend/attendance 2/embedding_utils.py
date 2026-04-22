"""
Utility functions for managing face embeddings
"""
import json
import numpy as np
from PIL import Image
import os
from django.conf import settings

# Import FaceNet model
try:
    from facenet_pytorch import MTCNN, InceptionResnetV1
    import torch
    FACENET_AVAILABLE = True
except ImportError:
    FACENET_AVAILABLE = False

# Initialize models (lazy loading)
_mtcnn = None
_resnet = None

def get_face_detector():
    """Lazy load MTCNN face detector"""
    global _mtcnn
    if _mtcnn is None and FACENET_AVAILABLE:
        _mtcnn = MTCNN(image_size=160, margin=0, device='cpu')
    return _mtcnn

def get_face_encoder():
    """Lazy load InceptionResnet face encoder"""
    global _resnet
    if _resnet is None and FACENET_AVAILABLE:
        _resnet = InceptionResnetV1(pretrained='vggface2').eval()
    return _resnet

def generate_face_embedding(image_path):
    """
    Generate face embedding from an image file
    Returns: numpy array of embedding or None if failed
    """
    if not FACENET_AVAILABLE:
        print("FaceNet not available")
        return None
    
    try:
        # Load image
        if not os.path.exists(image_path):
            print(f"Image not found: {image_path}")
            return None
        
        image = Image.open(image_path).convert('RGB')
        
        # Get models
        mtcnn = get_face_detector()
        resnet = get_face_encoder()
        
        # Detect and align face
        face = mtcnn(image)
        
        if face is None:
            print(f"No face detected in image: {image_path}")
            return None
        
        # Get embedding
        with torch.no_grad():
            embedding = resnet(face.unsqueeze(0))
        
        return embedding.numpy().flatten()
    
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None

def embedding_to_json(embedding):
    """Convert numpy embedding array to JSON string"""
    if embedding is None:
        return None
    return json.dumps(embedding.tolist())

def json_to_embedding(json_str):
    """Convert JSON string back to numpy array"""
    if not json_str:
        return None
    try:
        return np.array(json.loads(json_str))
    except Exception as e:
        print(f"Error parsing embedding JSON: {e}")
        return None

def save_student_embedding(student):
    """
    Generate and save face embedding for a student
    Args:
        student: Student model instance
    Returns:
        bool: True if successful, False otherwise
    """
    if not student.profile_pic:
        print(f"No profile picture for {student.registration_id}")
        return False
    
    # Get full path to image
    image_path = os.path.join(settings.MEDIA_ROOT, str(student.profile_pic))
    
    # Generate embedding
    embedding = generate_face_embedding(image_path)
    
    if embedding is None:
        print(f"Failed to generate embedding for {student.registration_id}")
        return False
    
    # Save to database
    student.face_embedding = embedding_to_json(embedding)
    student.save(update_fields=['face_embedding'])
    
    print(f"✓ Saved embedding for {student.registration_id}")
    return True

def compare_embeddings(embedding1, embedding2, threshold=0.6):
    """
    Compare two face embeddings using cosine similarity
    Args:
        embedding1: numpy array
        embedding2: numpy array
        threshold: similarity threshold (0-1)
    Returns:
        bool: True if similar (same person), False otherwise
    """
    try:
        if embedding1 is None or embedding2 is None:
            return False
        
        # Calculate cosine similarity
        similarity = np.dot(embedding1, embedding2) / (
            np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
        )
        
        return float(similarity) > threshold
    except Exception as e:
        print(f"Error comparing embeddings: {e}")
        return False
