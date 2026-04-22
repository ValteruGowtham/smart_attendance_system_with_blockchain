from datetime import date, timedelta, time as dt_time
import random

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from attendance.models import Faculty, Student, Attendance


PERIOD_START_TIMES = {
    "1": dt_time(9, 0),
    "2": dt_time(10, 0),
    "3": dt_time(11, 0),
    "4": dt_time(12, 0),
    "5": dt_time(13, 0),
    "6": dt_time(14, 0),
    "7": dt_time(15, 0),
    "8": dt_time(16, 0),
}

FIRST_NAMES = [
    "Aarav", "Diya", "Vikram", "Isha", "Karthik", "Meera", "Naveen", "Pooja", "Rahul", "Sneha",
    "Arjun", "Nisha", "Surya", "Anika", "Rohit", "Divya", "Aditya", "Keerthi", "Manoj", "Priya",
]
LAST_NAMES = [
    "Kumar", "Sharma", "Reddy", "Patel", "Nair", "Rao", "Singh", "Iyer", "Gupta", "Verma",
]
SECTIONS = ["A", "B", "C"]


class Command(BaseCommand):
    help = "Seed demo data: 82 students, 13 faculty, 265 attendance (70% Present / 30% Absent)."

    def add_arguments(self, parser):
        parser.add_argument("--students", type=int, default=82)
        parser.add_argument("--faculty", type=int, default=13)
        parser.add_argument("--attendance", type=int, default=265)

    @transaction.atomic
    def handle(self, *args, **options):
        target_students = options["students"]
        target_faculty = options["faculty"]
        target_attendance = options["attendance"]

        created_students = self._ensure_students(target_students)
        created_faculty = self._ensure_faculty(target_faculty)
        created_attendance = self._ensure_attendance(target_attendance)

        self.stdout.write(self.style.SUCCESS("Seeding completed."))
        self.stdout.write(f"Students created: {created_students}")
        self.stdout.write(f"Faculty created: {created_faculty}")
        self.stdout.write(f"Attendance created: {created_attendance}")
        self.stdout.write(f"Current totals -> Students: {Student.objects.count()}, Faculty: {Faculty.objects.count()}, Attendance: {Attendance.objects.count()}")

        present_count = Attendance.objects.filter(status__iexact="Present").count()
        absent_count = Attendance.objects.filter(status__iexact="Absent").count()
        total = Attendance.objects.count()
        pct_present = round((present_count / total) * 100, 2) if total else 0
        pct_absent = round((absent_count / total) * 100, 2) if total else 0
        self.stdout.write(f"Status split -> Present: {present_count} ({pct_present}%), Absent: {absent_count} ({pct_absent}%)")

    def _ensure_faculty(self, target_count):
        created = 0
        current = Faculty.objects.count()
        for i in range(current + 1, target_count + 1):
            uid = f"FAC{i:03d}"
            username = f"fac{i:03d}"
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            email = f"{username}@college.edu"

            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                },
            )
            if user_created:
                user.set_password(username)
                user.save()

            _, fac_created = Faculty.objects.get_or_create(
                uid=uid,
                defaults={
                    "user": user,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "phone": f"9{random.randint(100000000, 999999999)}",
                },
            )
            if fac_created:
                created += 1

        return created

    def _ensure_students(self, target_count):
        created = 0
        current = Student.objects.count()
        branches = [b[0] for b in Student.BRANCH]
        years = [y[0] for y in Student.YEAR]

        for i in range(current + 1, target_count + 1):
            reg = f"STU{i:04d}"
            username = reg.lower()
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            email = f"{username}@college.edu"
            branch = random.choice(branches)
            year = random.choice(years)
            section = random.choice(SECTIONS)

            user, user_created = User.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                },
            )
            if user_created:
                user.set_password(username)
                user.save()

            _, stu_created = Student.objects.get_or_create(
                registration_id=reg,
                defaults={
                    "user": user,
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "branch": branch,
                    "year": year,
                    "section": section,
                },
            )
            if stu_created:
                created += 1

        return created

    def _ensure_attendance(self, target_count):
        existing_total = Attendance.objects.count()
        if existing_total >= target_count:
            return 0

        faculties = list(Faculty.objects.all())
        students = list(Student.objects.all())

        if not faculties or not students:
            return 0

        to_create = target_count - existing_total

        target_present_total = round(target_count * 0.70)
        target_absent_total = target_count - target_present_total

        existing_present = Attendance.objects.filter(status__iexact="Present").count()
        existing_absent = Attendance.objects.filter(status__iexact="Absent").count()

        present_needed = max(0, target_present_total - existing_present)
        absent_needed = max(0, target_absent_total - existing_absent)

        statuses = ["Present"] * min(present_needed, to_create)
        remaining = to_create - len(statuses)
        statuses += ["Absent"] * min(absent_needed, remaining)
        remaining = to_create - len(statuses)

        # If existing records already exceeded one bucket, fill remainder proportionally.
        statuses += ["Present" if i % 10 < 7 else "Absent" for i in range(remaining)]
        random.shuffle(statuses)

        today = date.today()
        created = 0

        for status in statuses:
            student = random.choice(students)
            faculty = random.choice(faculties)
            period = str(random.randint(1, 8))
            cls_date = today - timedelta(days=random.randint(0, 45))

            Attendance.objects.create(
                faculty=faculty,
                student=student,
                date=cls_date,
                time=PERIOD_START_TIMES[period],
                branch=student.branch,
                year=student.year,
                section=student.section,
                period=period,
                status=status,
            )
            created += 1

        return created
