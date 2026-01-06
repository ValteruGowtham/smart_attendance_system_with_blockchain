
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from .models import Student, Faculty
from .embedding_utils import save_student_embedding

# Admin form for full student details (user + profile)
class AdminStudentForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()
    registration_id = forms.CharField(max_length=200)
    branch = forms.ChoiceField(choices=Student.BRANCH)
    year = forms.ChoiceField(choices=Student.YEAR)
    section = forms.CharField(max_length=10, required=False)
    profile_pic = forms.ImageField(required=False)

# Admin form for full faculty details (user + profile)
class AdminFacultyForm(forms.Form):
    username = forms.CharField(max_length=150)
    password = forms.CharField(widget=forms.PasswordInput)
    first_name = forms.CharField(max_length=150)
    last_name = forms.CharField(max_length=150)
    email = forms.EmailField()
    phone = forms.CharField(max_length=200, required=False)
    profile_pic = forms.ImageField(required=False)


# Only include fields that exist in Student model

class CreateStudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['registration_id', 'first_name', 'last_name', 'email', 'branch', 'year', 'section', 'profile_pic']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
    
    def save(self, commit=True):
        """Override save to generate face embedding when profile pic is added"""
        student = super().save(commit=commit)
        
        if commit and student.profile_pic:
            # Generate face embedding in background
            try:
                save_student_embedding(student)
            except Exception as e:
                print(f"Warning: Could not generate embedding for {student.registration_id}: {e}")
        
        return student


# Only include fields that exist in Faculty model


class FacultyForm(forms.ModelForm):
    class Meta:
        model = Faculty
        fields = ['uid', 'first_name', 'last_name', 'email', 'phone', 'profile_pic']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for visible in self.visible_fields():
            visible.field.widget.attrs['class'] = 'form-control'
