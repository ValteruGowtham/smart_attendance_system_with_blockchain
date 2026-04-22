import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image
import os
from django.conf import settings
from .models import Student
from .embedding_utils import (
    get_face_detector,
    get_face_encoder,
    json_to_embedding,
    compare_embeddings,
    FACENET_AVAILABLE
)

# Import FaceNet model
try:
    import torch
except ImportError:
    torch = None

def decode_base64_image(image_data):
    """Decode base64 image string to numpy array"""
    try:
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        return np.array(image)
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def get_face_embedding(image_array):
    """Extract face embedding from image using FaceNet"""
    if not FACENET_AVAILABLE or torch is None:
        return None
    
    try:
        mtcnn = get_face_detector()
        resnet = get_face_encoder()
        
        # Convert numpy array to PIL Image
        if isinstance(image_array, np.ndarray):
            image = Image.fromarray(image_array)
        else:
            image = image_array
        
        # Detect and align face
        face = mtcnn(image)
        
        if face is None:
            print("No face detected in image")
            return None
        
        # Get embedding
        with torch.no_grad():
            embedding = resnet(face.unsqueeze(0))
        
        return embedding.numpy().flatten()
    
    except Exception as e:
        print(f"Error extracting face embedding: {e}")
        return None

def Recognizer(details, face_image_data=None):
    """
    Face recognition using stored embeddings:
      - details dict contains 'branch', 'year', 'section', 'period'
      - face_image_data is base64 encoded image from webcam
      - returns list of registration_id strings that are "recognized"
    
    This version uses pre-stored embeddings for faster recognition.
    """
    branch = details.get('branch')
    year = details.get('year')
    section = details.get('section')
    
    # Get all students in the class
    students = Student.objects.filter(
        branch__iexact=branch,
        year__iexact=year,
        section__iexact=section
    )
    
    # If no face image provided or FaceNet not available, return empty list (all absent)
    if not face_image_data or not FACENET_AVAILABLE:
        print("No face image provided or FaceNet not available")
        return []
    
    # Decode captured image
    captured_image = decode_base64_image(face_image_data)
    if captured_image is None:
        print("Failed to decode captured image")
        return []
    
    # Get embedding for captured face
    captured_embedding = get_face_embedding(captured_image)
    if captured_embedding is None:
        print("Could not extract face from captured image")
        return []
    
    print(f"Processing {students.count()} students...")
    
    # Compare captured face with each student's stored embedding
    recognized = []
    students_with_embeddings = 0
    
    for student in students:
        # Load student's stored embedding
        if not student.face_embedding:
            print(f"⚠ No embedding stored for {student.registration_id}")
            continue
        
        students_with_embeddings += 1
        student_embedding = json_to_embedding(student.face_embedding)
        
        if student_embedding is None:
            print(f"⚠ Invalid embedding for {student.registration_id}")
            continue
        
        # Compare embeddings
        if compare_embeddings(captured_embedding, student_embedding):
            recognized.append(student.registration_id)
            print(f"✓ Recognized: {student.registration_id}")
    
    print(f"Total recognized: {len(recognized)} out of {students_with_embeddings} students with embeddings")
    return recognized
