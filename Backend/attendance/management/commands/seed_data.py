import random
from datetime import date, time, timedelta

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from attendance.models import Student, Faculty, Course, Attendance


class Command(BaseCommand):
    help = "Populate database with demo students, faculty, courses, and attendance records"

    def handle(self, *args, **options):
        self.stdout.write("=" * 60)
        self.stdout.write("  Smart Attendance - Seed Data Script")
        self.stdout.write("=" * 60)
        self.stdout.write("")

        self._create_faculty()
        self._create_students()
        self._create_courses()
        self._create_attendance()

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("  Seed complete!")
        self.stdout.write("")
        self.stdout.write("  Demo Logins:")
        self.stdout.write("  -----------")
        self.stdout.write("  Admin:   admin / admin")
        self.stdout.write("  Faculty: FAC001 / FAC001  (Rajesh Kumar)")
        self.stdout.write("  Student: CSE2021001 / CSE2021001  (Aarav Mehta)")
        self.stdout.write("=" * 60)

    # ── Faculty ──────────────────────────────────────────────
    def _create_faculty(self):
        self.stdout.write("\n--- Faculty ---")
        faculty_data = [
            {"uid": "FAC001", "first": "Rajesh",  "last": "Kumar",  "email": "rajesh.kumar@college.edu",  "phone": "9876543210"},
            {"uid": "FAC002", "first": "Sunita",  "last": "Sharma", "email": "sunita.sharma@college.edu", "phone": "9876543211"},
            {"uid": "FAC003", "first": "Amit",    "last": "Patel",  "email": "amit.patel@college.edu",    "phone": "9876543212"},
            {"uid": "FAC004", "first": "Deepa",   "last": "Nair",   "email": "deepa.nair@college.edu",    "phone": "9876543213"},
        ]
        for fd in faculty_data:
            if Faculty.objects.filter(uid=fd["uid"]).exists():
                self.stdout.write(f"  [exists] {fd['uid']}")
                continue
            user = User.objects.create_user(
                username=fd["uid"], password=fd["uid"],
                first_name=fd["first"], last_name=fd["last"], email=fd["email"],
            )
            Faculty.objects.create(
                user=user, uid=fd["uid"],
                first_name=fd["first"], last_name=fd["last"],
                email=fd["email"], phone=fd["phone"],
            )
            self.stdout.write(self.style.SUCCESS(f"  [created] {fd['uid']} - {fd['first']} {fd['last']}"))

    # ── Students ─────────────────────────────────────────────
    def _create_students(self):
        self.stdout.write("\n--- Students ---")
        students_data = [
            # CSE - Year 2 - Section A
            {"reg": "CSE2021001", "first": "Aarav",    "last": "Mehta",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021002", "first": "Ananya",   "last": "Reddy",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021003", "first": "Rohan",    "last": "Sharma",    "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021004", "first": "Priya",    "last": "Gupta",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021005", "first": "Vikram",   "last": "Singh",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021006", "first": "Sneha",    "last": "Iyer",      "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021007", "first": "Arjun",    "last": "Verma",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021008", "first": "Kavya",    "last": "Nair",      "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021009", "first": "Rahul",    "last": "Patel",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021010", "first": "Meera",    "last": "Joshi",     "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021011", "first": "Dev",      "last": "Chauhan",   "branch": "CSE", "year": "2", "section": "A"},
            {"reg": "CSE2021012", "first": "Ishita",   "last": "Kapoor",    "branch": "CSE", "year": "2", "section": "A"},
            # CSE - Year 3 - Section B
            {"reg": "CSE2020001", "first": "Aditya",   "last": "Rao",       "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020002", "first": "Riya",     "last": "Desai",     "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020003", "first": "Karthik",  "last": "Menon",     "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020004", "first": "Nisha",    "last": "Agarwal",   "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020005", "first": "Sanjay",   "last": "Mishra",    "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020006", "first": "Pooja",    "last": "Kulkarni",  "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020007", "first": "Manish",   "last": "Tiwari",    "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020008", "first": "Divya",    "last": "Pandey",    "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020009", "first": "Suresh",   "last": "Yadav",     "branch": "CSE", "year": "3", "section": "B"},
            {"reg": "CSE2020010", "first": "Anjali",   "last": "Bhat",      "branch": "CSE", "year": "3", "section": "B"},
            # ECE - Year 2 - Section A
            {"reg": "ECE2021001", "first": "Nikhil",   "last": "Saxena",    "branch": "ECE", "year": "2", "section": "A"},
            {"reg": "ECE2021002", "first": "Shruti",   "last": "Malhotra",  "branch": "ECE", "year": "2", "section": "A"},
            {"reg": "ECE2021003", "first": "Varun",    "last": "Chopra",    "branch": "ECE", "year": "2", "section": "A"},
            {"reg": "ECE2021004", "first": "Neha",     "last": "Bansal",    "branch": "ECE", "year": "2", "section": "A"},
            {"reg": "ECE2021005", "first": "Kunal",    "last": "Jain",      "branch": "ECE", "year": "2", "section": "A"},
            {"reg": "ECE2021006", "first": "Swati",    "last": "Srivastava","branch": "ECE", "year": "2", "section": "A"},
        ]
        for sd in students_data:
            if Student.objects.filter(registration_id=sd["reg"]).exists():
                self.stdout.write(f"  [exists] {sd['reg']}")
                continue
            user = User.objects.create_user(
                username=sd["reg"], password=sd["reg"],
                first_name=sd["first"], last_name=sd["last"],
                email=f"{sd['reg'].lower()}@student.college.edu",
            )
            Student.objects.create(
                user=user, registration_id=sd["reg"],
                first_name=sd["first"], last_name=sd["last"],
                email=user.email,
                branch=sd["branch"], year=sd["year"], section=sd["section"],
            )
            self.stdout.write(self.style.SUCCESS(f"  [created] {sd['reg']} - {sd['first']} {sd['last']}"))

    # ── Courses ──────────────────────────────────────────────
    def _create_courses(self):
        self.stdout.write("\n--- Courses ---")
        courses_data = [
            {"code": "CS301", "name": "Data Structures",               "fac": "FAC001", "b": "CSE", "y": "2", "s": "A", "sem": "3", "ay": "2025-26"},
            {"code": "CS302", "name": "Database Management Systems",   "fac": "FAC002", "b": "CSE", "y": "2", "s": "A", "sem": "3", "ay": "2025-26"},
            {"code": "MA201", "name": "Engineering Mathematics III",   "fac": "FAC002", "b": "CSE", "y": "2", "s": "A", "sem": "3", "ay": "2025-26"},
            {"code": "CS501", "name": "Machine Learning",             "fac": "FAC001", "b": "CSE", "y": "3", "s": "B", "sem": "5", "ay": "2025-26"},
            {"code": "CS502", "name": "Computer Networks",            "fac": "FAC003", "b": "CSE", "y": "3", "s": "B", "sem": "5", "ay": "2025-26"},
            {"code": "EC301", "name": "Signals and Systems",          "fac": "FAC004", "b": "ECE", "y": "2", "s": "A", "sem": "3", "ay": "2025-26"},
        ]
        for cd in courses_data:
            if Course.objects.filter(course_code=cd["code"]).exists():
                self.stdout.write(f"  [exists] {cd['code']}")
                continue
            fac = Faculty.objects.get(uid=cd["fac"])
            course = Course.objects.create(
                course_code=cd["code"], course_name=cd["name"],
                faculty=fac, branch=cd["b"], year=cd["y"], section=cd["s"],
                semester=cd["sem"], academic_year=cd["ay"],
            )
            students = Student.objects.filter(branch=cd["b"], year=cd["y"], section=cd["s"])
            course.students.set(students)
            self.stdout.write(self.style.SUCCESS(f"  [created] {cd['code']} - {cd['name']}  ({students.count()} students)"))

    # ── Attendance Records ───────────────────────────────────
    def _create_attendance(self):
        self.stdout.write("\n--- Attendance Records ---")
        today = date.today()

        for course_code, period_num in [("CS301", "1"), ("CS502", "3"), ("CS302", "2")]:
            try:
                course = Course.objects.get(course_code=course_code)
            except Course.DoesNotExist:
                self.stdout.write(f"  [skip] {course_code} not found")
                continue

            fac = course.faculty
            students = list(course.students.all())
            count = 0
            presence_rate = 0.80 if course_code != "CS502" else 0.72

            for day_offset in range(14, 0, -1):
                att_date = today - timedelta(days=day_offset)
                if att_date.weekday() >= 5:
                    continue
                for stu in students:
                    status = "Present" if random.random() < presence_rate else "Absent"
                    fake_tx = f"0x{random.getrandbits(256):064x}"
                    if not Attendance.objects.filter(
                        faculty=fac, student=stu, date=att_date,
                        course=course, period=period_num
                    ).exists():
                        Attendance.objects.create(
                            faculty=fac, student=stu, course=course,
                            date=att_date, time=time(9 + int(period_num), 0),
                            branch=stu.branch, year=stu.year, section=stu.section,
                            period=period_num, status=status,
                            blockchain_tx=fake_tx,
                            blockchain_status='confirmed'
                        )
                        count += 1

            self.stdout.write(self.style.SUCCESS(f"  [created] {count} records for {course_code} ({course.course_name})"))
