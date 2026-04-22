"""
Verify student embeddings in database
"""
import os
import sys
import django
import json

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()

from attendance.models import Student

print("\n" + "="*70)
print("STUDENT EMBEDDINGS VERIFICATION")
print("="*70 + "\n")

students = Student.objects.all()

for i, student in enumerate(students, 1):
    print(f"[{i}] Student: {student.registration_id}")
    print(f"    Name: {student.first_name} {student.last_name}")
    print(f"    Branch: {student.branch}, Year: {student.year}, Section: {student.section}")
    print(f"    Profile Pic: {student.profile_pic}")
    
    if student.face_embedding:
        try:
            embedding = json.loads(student.face_embedding)
            print(f"    ✓ Embedding: EXISTS")
            print(f"      - Dimensions: {len(embedding)}")
            print(f"      - Sample values: [{embedding[0]:.4f}, {embedding[1]:.4f}, {embedding[2]:.4f}, ...]")
            print(f"      - Storage size: {len(student.face_embedding)} chars (~{len(student.face_embedding)//1024}KB)")
        except Exception as e:
            print(f"    ✗ Embedding: CORRUPTED ({e})")
    else:
        print(f"    ✗ Embedding: NOT FOUND")
    
    print()

print("="*70)
print(f"Total students: {students.count()}")
print(f"With embeddings: {students.exclude(face_embedding__isnull=True).exclude(face_embedding='').count()}")
print(f"Without embeddings: {students.filter(face_embedding__isnull=True).count() + students.filter(face_embedding='').count()}")
print("="*70)
