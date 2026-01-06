"""
Django management command to generate face embeddings for all students
Usage: python manage.py generate_embeddings
"""
from django.core.management.base import BaseCommand
from attendance.models import Student
from attendance.embedding_utils import save_student_embedding

class Command(BaseCommand):
    help = 'Generate face embeddings for all students with profile pictures'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate embeddings even if they already exist',
        )
        parser.add_argument(
            '--reg-id',
            type=str,
            help='Generate embedding for specific student by registration ID',
        )

    def handle(self, *args, **options):
        force = options['force']
        reg_id = options.get('reg_id')

        if reg_id:
            # Generate for specific student
            try:
                student = Student.objects.get(registration_id=reg_id)
                self.stdout.write(f"Processing {student.registration_id}...")
                if save_student_embedding(student):
                    self.stdout.write(self.style.SUCCESS(f'✓ Generated embedding for {student.registration_id}'))
                else:
                    self.stdout.write(self.style.ERROR(f'✗ Failed for {student.registration_id}'))
            except Student.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Student {reg_id} not found'))
            return

        # Generate for all students
        students = Student.objects.all()
        total = students.count()
        
        self.stdout.write(f"Found {total} students")
        
        success = 0
        skipped = 0
        failed = 0

        for i, student in enumerate(students, 1):
            self.stdout.write(f"[{i}/{total}] Processing {student.registration_id}...", ending=' ')
            
            # Skip if embedding already exists and not forcing
            if student.face_embedding and not force:
                self.stdout.write(self.style.WARNING('(skipped - already exists)'))
                skipped += 1
                continue
            
            # Skip if no profile picture
            if not student.profile_pic:
                self.stdout.write(self.style.WARNING('(no profile picture)'))
                skipped += 1
                continue
            
            # Generate embedding
            if save_student_embedding(student):
                self.stdout.write(self.style.SUCCESS('✓'))
                success += 1
            else:
                self.stdout.write(self.style.ERROR('✗'))
                failed += 1

        # Summary
        self.stdout.write("\n" + "="*50)
        self.stdout.write(self.style.SUCCESS(f"Successfully generated: {success}"))
        self.stdout.write(self.style.WARNING(f"Skipped: {skipped}"))
        self.stdout.write(self.style.ERROR(f"Failed: {failed}"))
        self.stdout.write("="*50)
