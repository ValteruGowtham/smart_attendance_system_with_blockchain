from rest_framework import serializers
from .models import Student, Course, Attendance
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
class Meta:
    model = Student
    fields = ['id', 'user', 'roll_no', 'photo', 'blockchain_wallet']


class AttendanceSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    course = serializers.StringRelatedField()
class Meta:
    model = Attendance
    fields = ['id', 'student', 'course', 'timestamp', 'status', 'blockchain_tx']