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
    """Extract face embedding from image using FaceNet (single face)"""
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


def get_multiple_face_embeddings(image_array):
    """Extract embeddings for all faces detected in image using FaceNet"""
    if not FACENET_AVAILABLE or torch is None:
        return []
    
    try:
        mtcnn = get_face_detector()
        resnet = get_face_encoder()
        
        # Convert numpy array to PIL Image
        if isinstance(image_array, np.ndarray):
            image = Image.fromarray(image_array)
        else:
            image = image_array
        
        # Detect and align all faces - return_prob=True gives us boxes and probabilities
        faces, probs = mtcnn(image, return_prob=True)
        
        if faces is None or len(faces) == 0:
            print("No faces detected in image")
            return []
        
        print(f"Detected {len(faces)} face(s) in image")
        
        # Get embeddings for all detected faces
        embeddings = []
        with torch.no_grad():
            for idx, face in enumerate(faces):
                if face is not None:
                    embedding = resnet(face.unsqueeze(0))
                    embeddings.append({
                        'embedding': embedding.numpy().flatten(),
                        'confidence': float(probs[idx]) if probs is not None else 1.0,
                        'face_index': idx
                    })
                    print(f"  Face {idx + 1}: detection confidence = {probs[idx]:.3f}" if probs is not None else f"  Face {idx + 1}: processed")
        
        return embeddings
    
    except Exception as e:
        print(f"Error extracting multiple face embeddings: {e}")
        return []

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


def MultiRecognizer(details, face_image_data=None, similarity_threshold=0.6):
    """
    Multi-face recognition using stored embeddings:
      - details dict contains 'branch', 'year', 'section', 'period'
      - face_image_data is base64 encoded image from webcam
      - similarity_threshold: cosine similarity threshold for matching (default: 0.6)
      - returns dict with:
        {
          'recognized_students': [{'registration_id': str, 'name': str, 'confidence': float}, ...],
          'unknown_faces_count': int,
          'total_faces_detected': int
        }
    
    This version detects and recognizes multiple faces simultaneously.
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
    
    # If no face image provided or FaceNet not available, return empty result
    if not face_image_data or not FACENET_AVAILABLE:
        print("No face image provided or FaceNet not available")
        return {
            'recognized_students': [],
            'unknown_faces_count': 0,
            'total_faces_detected': 0
        }
    
    # Decode captured image
    captured_image = decode_base64_image(face_image_data)
    if captured_image is None:
        print("Failed to decode captured image")
        return {
            'recognized_students': [],
            'unknown_faces_count': 0,
            'total_faces_detected': 0
        }
    
    # Get embeddings for all detected faces
    detected_faces = get_multiple_face_embeddings(captured_image)
    if not detected_faces:
        print("Could not extract any faces from captured image")
        return {
            'recognized_students': [],
            'unknown_faces_count': 0,
            'total_faces_detected': 0
        }
    
    print(f"Processing {len(detected_faces)} detected face(s) against {students.count()} students...")
    
    # Build student embedding database
    student_embeddings = {}
    students_with_embeddings = 0
    
    for student in students:
        if not student.face_embedding:
            print(f"⚠ No embedding stored for {student.registration_id}")
            continue
        
        student_embedding = json_to_embedding(student.face_embedding)
        if student_embedding is None:
            print(f"⚠ Invalid embedding for {student.registration_id}")
            continue
        
        student_embeddings[student.registration_id] = {
            'embedding': student_embedding,
            'student': student
        }
        students_with_embeddings += 1
    
    print(f"Loaded {students_with_embeddings} student embeddings")
    
    # Match each detected face against all student embeddings
    recognized_students = []
    recognized_ids = set()  # Track to prevent duplicates
    unknown_faces = 0
    
    for face_data in detected_faces:
        captured_embedding = face_data['embedding']
        face_idx = face_data['face_index']
        
        best_match = None
        best_similarity = 0.0
        
        # Find best matching student for this face
        for reg_id, student_data in student_embeddings.items():
            student_embedding = student_data['embedding']
            
            # Calculate cosine similarity
            similarity = np.dot(captured_embedding, student_embedding) / (
                np.linalg.norm(captured_embedding) * np.linalg.norm(student_embedding)
            )
            
            if similarity > best_similarity and similarity > similarity_threshold:
                best_similarity = similarity
                best_match = {
                    'registration_id': reg_id,
                    'student': student_data['student'],
                    'confidence': float(similarity)
                }
        
        if best_match:
            # Check if this student was already recognized (prevent duplicates)
            if best_match['registration_id'] not in recognized_ids:
                recognized_ids.add(best_match['registration_id'])
                student = best_match['student']
                recognized_students.append({
                    'registration_id': best_match['registration_id'],
                    'name': f"{student.first_name} {student.last_name}",
                    'confidence': best_match['confidence']
                })
                print(f"✓ Face {face_idx + 1} recognized: {best_match['registration_id']} (confidence: {best_match['confidence']:.3f})")
            else:
                print(f"⚠ Face {face_idx + 1} matched {best_match['registration_id']} but already recognized (duplicate)")
        else:
            unknown_faces += 1
            print(f"✗ Face {face_idx + 1}: Unknown (no match above threshold {similarity_threshold})")
    
    print(f"Total recognized: {len(recognized_students)} unique student(s), {unknown_faces} unknown face(s)")
    
    return {
        'recognized_students': recognized_students,
        'unknown_faces_count': unknown_faces,
        'total_faces_detected': len(detected_faces)
    }
