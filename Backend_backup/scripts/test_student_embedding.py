"""
Test script to add a new student and verify embedding generation
"""
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()

from django.contrib.auth.models import User
from attendance.models import Student
from attendance.embedding_utils import save_student_embedding
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from io import BytesIO

def create_test_student():
    """Create a test student with profile picture"""
    
    # Student details
    reg_id = "TEST123"
    
    # Check if student already exists
    if Student.objects.filter(registration_id=reg_id).exists():
        print(f"Student {reg_id} already exists. Deleting...")
        Student.objects.filter(registration_id=reg_id).delete()
        User.objects.filter(username=reg_id).delete()
    
    print(f"\n{'='*50}")
    print(f"Creating test student: {reg_id}")
    print(f"{'='*50}\n")
    
    # Create User
    user = User.objects.create_user(
        username=reg_id,
        password=reg_id,
        first_name="Test",
        last_name="Student",
        email="test@example.com"
    )
    print(f"✓ Created user: {user.username}")
    
    # Create Student (without profile pic first)
    student = Student.objects.create(
        user=user,
        registration_id=reg_id,
        first_name="Test",
        last_name="Student",
        email="test@example.com",
        branch="CSE",
        year="3",
        section="A"
    )
    print(f"✓ Created student: {student.registration_id}")
    print(f"  - Branch: {student.branch}, Year: {student.year}, Section: {student.section}")
    
    # Check for existing image in media folder
    print(f"\n{'='*50}")
    print("Checking for profile picture...")
    print(f"{'='*50}\n")
    
    from django.conf import settings
    media_root = settings.MEDIA_ROOT
    
    # Look for any existing student images we can use
    student_images_dir = os.path.join(media_root, 'Student_Images')
    
    image_found = False
    if os.path.exists(student_images_dir):
        print(f"Searching in: {student_images_dir}")
        for root, dirs, files in os.walk(student_images_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_path = os.path.join(root, file)
                    print(f"\n✓ Found existing image: {image_path}")
                    
                    # Copy this image to the test student
                    try:
                        with open(image_path, 'rb') as img_file:
                            from django.core.files import File
                            student.profile_pic.save(f"{reg_id}.jpg", File(img_file), save=True)
                        print(f"✓ Assigned image to test student")
                        image_found = True
                        break
                    except Exception as e:
                        print(f"✗ Error assigning image: {e}")
            if image_found:
                break
    
    if not image_found:
        print("⚠ No existing student images found in media folder")
        print("  Please add a student with a profile picture first, or")
        print("  manually add an image to test embedding generation")
        return None
    
    # Generate embedding
    print(f"\n{'='*50}")
    print("Generating face embedding...")
    print(f"{'='*50}\n")
    
    if save_student_embedding(student):
        print(f"✓ Embedding generated successfully!")
        
        # Verify embedding
        student.refresh_from_db()
        if student.face_embedding:
            import json
            embedding_data = json.loads(student.face_embedding)
            print(f"  - Embedding dimension: {len(embedding_data)}")
            print(f"  - Sample values: {embedding_data[:5]}...")
            print(f"  - Storage size: ~{len(student.face_embedding)} characters")
            return student
        else:
            print(f"✗ Embedding not saved to database")
            return None
    else:
        print(f"✗ Failed to generate embedding")
        return None

if __name__ == "__main__":
    student = create_test_student()
    
    if student:
        print(f"\n{'='*50}")
        print("✅ Test completed successfully!")
        print(f"{'='*50}")
        print(f"\nStudent Details:")
        print(f"  Registration ID: {student.registration_id}")
        print(f"  Name: {student.first_name} {student.last_name}")
        print(f"  Profile Pic: {student.profile_pic}")
        print(f"  Has Embedding: {'✓ Yes' if student.face_embedding else '✗ No'}")
    else:
        print(f"\n{'='*50}")
        print("❌ Test failed")
        print(f"{'='*50}")
