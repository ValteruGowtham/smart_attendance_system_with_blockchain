
from django.db import models
from django.contrib.auth.models import AbstractUser, User


def user_directory_path(instance, filename):
    name, ext = filename.rsplit(".", 1)
    if hasattr(instance, 'user') and instance.user:
        name = instance.user.get_full_name() or instance.user.username
    else:
        name = (instance.firstname or '') + (instance.lastname or '')
    return f'Faculty_Images/{name}.{ext}'



class Faculty(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="faculty_profile")
    uid = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=200, null=True, blank=True)
    profile_pic = models.ImageField(upload_to=user_directory_path, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.uid})"


def student_directory_path(instance, filename):
    name, ext = filename.rsplit(".", 1)
    if hasattr(instance, 'user') and instance.user:
        name = instance.user.username
    else:
        name = instance.registration_id or 'unknown'
    return f'Student_Images/{instance.branch}/{instance.year}/{name}.{ext}'



class Student(models.Model):
    BRANCH = (('CSE','CSE'),('IT','IT'),('ECE','ECE'),('CHEM','CHEM'),('MECH','MECH'),('EEE','EEE'))
    YEAR = (('1','1'),('2','2'),('3','3'),('4','4'))

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="student_profile")
    registration_id = models.CharField(max_length=200, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    branch = models.CharField(max_length=100, null=True, choices=BRANCH)
    year = models.CharField(max_length=100, null=True, choices=YEAR)
    section = models.CharField(max_length=10, null=True, blank=True)
    profile_pic = models.ImageField(upload_to=student_directory_path, null=True, blank=True)
    face_embedding = models.TextField(null=True, blank=True)  # Store embedding as JSON string

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.registration_id})"


class Attendance(models.Model):
    faculty = models.ForeignKey(Faculty, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField(null=True)   # remove auto_now_add
    time = models.TimeField(null=True)   # remove auto_now_add
    branch = models.CharField(max_length=200, null=True, blank=True)
    year = models.CharField(max_length=200, null=True, blank=True)
    section = models.CharField(max_length=200, null=True, blank=True)
    period = models.CharField(max_length=200, null=True, blank=True)
    status = models.CharField(max_length=200, null=True, default='Absent')

    def __str__(self):
        return f"{self.student.registration_id}_{self.date}_{self.period}"
