"""
CSRF/session best practices for Django:
 - All POST forms/templates must include {% csrf_token %} in HTML <form>.
 - For AJAX/JS POST: Pass CSRF token in headers (see Django docs: https://docs.djangoproject.com/en/4.2/ref/csrf/)
 - Session: Django uses secure cookies. After login, session key is set. Use request.session for per-user data.
 - For parallel logins (multiple tabs), Django supports this by default. If issues, clear cookies or use incognito.
 - If login/logout issues: check browser cookies, clear cache, and ensure no duplicate User objects.
 - If you need to debug session, print request.session.session_key after login/logout.
"""
from .forms import AdminStudentForm, AdminFacultyForm
from django.contrib.auth.decorators import login_required
# Admin-only: Add student with all details
@login_required(login_url='login')
def admin_add_student(request):
    if not request.user.is_superuser:
        return redirect('home')
    if request.method == 'POST':
        form = AdminStudentForm(request.POST, request.FILES)
        if form.is_valid():
            # Create User
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                email=form.cleaned_data['email']
            )
            # Create Student profile
            student = Student.objects.create(
                user=user,
                registration_id=form.cleaned_data['registration_id'],
                branch=form.cleaned_data['branch'],
                year=form.cleaned_data['year'],
                section=form.cleaned_data['section'],
                profile_pic=form.cleaned_data.get('profile_pic')
            )
            messages.success(request, 'Student added successfully!')
            return redirect('admin_add_student')
    else:
        form = AdminStudentForm()
    return render(request, 'admin_add_student.html', {'form': form})

# Admin-only: Add faculty with all details
@login_required(login_url='login')
def admin_add_faculty(request):
    if not request.user.is_superuser:
        return redirect('home')
    if request.method == 'POST':
        form = AdminFacultyForm(request.POST, request.FILES)
        if form.is_valid():
            # Create User
            user = User.objects.create_user(
                username=form.cleaned_data['username'],
                password=form.cleaned_data['password'],
                first_name=form.cleaned_data['first_name'],
                last_name=form.cleaned_data['last_name'],
                email=form.cleaned_data['email']
            )
            # Create Faculty profile
            faculty = Faculty.objects.create(
                user=user,
                phone=form.cleaned_data['phone'],
                profile_pic=form.cleaned_data.get('profile_pic')
            )
            messages.success(request, 'Faculty added successfully!')
            return redirect('admin_add_faculty')
    else:
        form = AdminFacultyForm()
    return render(request, 'admin_add_faculty.html', {'form': form})

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from datetime import date

from .forms import CreateStudentForm, FacultyForm
from .models import Student, Attendance,Faculty
from .filters import AttendenceFilter
try:
    from .recognizer import Recognizer
except Exception:
    Recognizer = None

@login_required(login_url='login')
def face_recognition_attendance(request):
    if request.method == 'POST':
        image_data = request.POST.get('image_data')
        from django.http import JsonResponse
        return render(request, 'face_recognition.html', {'result': 'Image received. (Recognition not yet implemented)'})
    return render(request, 'face_recognition.html')

from django.views.decorators.csrf import csrf_protect
@csrf_protect
def loginPage(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            print(f"[DEBUG] User {user.username} logged in. Session key: {request.session.session_key}")
            if hasattr(user, 'faculty_profile'):
                return redirect('faculty_dashboard')
            elif hasattr(user, 'student_profile'):
                return redirect('student_dashboard')
            elif user.is_superuser:
                return redirect('home')
            else:
                logout(request)
            return redirect('login')
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'login.html')

@login_required(login_url='login')
@csrf_protect
def logoutUser(request):
    print(f"[DEBUG] Logging out user. Session key: {request.session.session_key}")
    logout(request)
    return redirect('login')

def home(request):
    # Show landing page for non-authenticated users
    if not request.user.is_authenticated:
        return render(request, 'landing.html')
    
    # Redirect authenticated users to their respective dashboards
    if not request.user.is_superuser:
        if hasattr(request.user, 'faculty_profile'):
            return redirect('faculty_dashboard')
        elif hasattr(request.user, 'student_profile'):
            return redirect('student_dashboard')
        else:
            logout(request)
            return redirect('login')

    # Admin users see the admin dashboard with stats
    studentForm = CreateStudentForm()
    if request.method == 'POST':
        studentForm = CreateStudentForm(request.POST, request.FILES)
        if studentForm.is_valid():
            studentForm.save()
            messages.success(request, "Student added successfully.")
            return redirect('home')
        else:
            messages.error(request, "Please correct the errors below.")
    
    # Get statistics for admin dashboard
    total_students = Student.objects.count()
    total_faculty = Faculty.objects.count()
    total_attendance = Attendance.objects.count()
    
    context = {
        'studentForm': studentForm,
        'total_students': total_students,
        'total_faculty': total_faculty,
        'total_attendance': total_attendance,
    }
    return render(request, 'admin_home.html', context)

@login_required(login_url='login')
def updateStudentRedirect(request):
    if not request.user.is_superuser:
        messages.error(request, "Only admin can update students.")
        return redirect('faculty_dashboard')

    context = {}
    if request.method == 'POST':
        reg_id = request.POST.get('reg_id')
        branch = request.POST.get('branch')
        try:
            student = Student.objects.get(registration_id=reg_id, branch=branch)
            form = CreateStudentForm(instance=student)
            context = {'form': form, 'student': student, 'prev_reg_id': student.registration_id}
        except Student.DoesNotExist:
            messages.error(request, 'Student not found.')
            return redirect('home')
    return render(request, 'student_update.html', context)

@login_required(login_url='login')
def updateStudent(request):
    if not request.user.is_superuser:
        messages.error(request, "Only admin can update students.")
        return redirect('faculty_dashboard')
    if request.method == 'POST':
        prev_reg_id = request.POST.get('prev_reg_id')
        try:
            student = Student.objects.get(registration_id=prev_reg_id)
            form = CreateStudentForm(request.POST, request.FILES, instance=student)
            if form.is_valid():
                form.save()
                messages.success(request, 'Student updated successfully.')
                return redirect('home')
            else:
                messages.error(request, 'Please correct the errors in the form.')
                return render(request, 'student_update.html', {'form': form, 'student': student, 'prev_reg_id': prev_reg_id})
        except Student.DoesNotExist:
            messages.error(request, 'Student not found.')
    return redirect('home')


@login_required(login_url='login')
def facultyDashboard(request):
    faculty = getattr(request.user, 'faculty_profile', None)
    if faculty is None:
        messages.error(request, "Access denied.")
        return redirect('login')

    branches = [b[0] for b in Student.BRANCH]
    years = [y[0] for y in Student.YEAR]
    sections = list(Student.objects.values_list('section', flat=True).distinct().order_by('section'))
    periods = ['1','2','3','4','5','6','7','8']

    attendance_summary = None
    today_attendance = None
    selected = None

    if request.method == 'POST':
        from datetime import datetime
        now = datetime.now()

        branch = request.POST.get('branch')
        year = request.POST.get('year')
        section = request.POST.get('section')
        period = request.POST.get('period')
        face_image_data = request.POST.get('face_image_data')

        # Validate face image data
        if not face_image_data or face_image_data.strip() == '':
            messages.error(request, "Please capture a face image before submitting attendance.")
            context = {
                'faculty_name': str(faculty),
                'branches': branches,
                'years': years,
                'sections': sections,
                'periods': periods,
            }
            return render(request, 'faculty_dashboard.html', context)

        selected = {'branch': branch, 'year': year, 'section': section, 'period': period}

        # Check already marked
        if Attendance.objects.filter(date=date.today(), branch=branch, year=year, section=section, period=period, faculty=faculty).exists():
            messages.error(request, "Attendance already recorded for this class today.")
        else:
            # Fetch students correctly (CASE-INSENSITIVE)
            students = Student.objects.filter(
                branch__iexact=branch,
                year__iexact=year,
                section__iexact=section
            )

            # Check if any students exist in the selected class
            if not students.exists():
                messages.error(request, f"No students found for Branch: {branch}, Year: {year}, Section: {section}. Please check the details and try again.")
                context = {
                    'faculty_name': str(faculty),
                    'branches': branches,
                    'years': years,
                    'sections': sections,
                    'periods': periods,
                }
                return render(request, 'faculty_dashboard.html', context)

            # Recognition result (default no recognition)
            recognized = []

            if Recognizer and face_image_data:
                try:
                    recognized = Recognizer(selected, face_image_data)  # Pass image data
                except Exception as e:
                    print(f"Recognition error: {e}")
                    recognized = []

            for student in students:
                Attendance.objects.create(
                    faculty=faculty,
                    student=student,
                    date=now.date(),
                    time=now.time(),
                    branch=branch,
                    year=year,
                    section=section,
                    period=period,
                    status='Present' if student.registration_id in recognized else 'Absent'
                )

            messages.success(request, "Attendance recorded successfully.")

        # Load today's attendance table
        today_attendance = Attendance.objects.filter(
            date=date.today(),
            branch=branch,
            year=year,
            section=section,
            period=period,
            faculty=faculty
        ).select_related('student', 'student__user')

        present = today_attendance.filter(status='Present').count()
        total = today_attendance.count()
        absent = total - present
        percentage = round(present / total * 100, 2) if total > 0 else 0

        attendance_summary = {
            'present': present,
            'absent': absent,
            'total': total,
            'percentage': percentage,
        }

    context = {
        'faculty_name': str(faculty),
        'branches': branches,
        'years': years,
        'sections': sections,
        'periods': periods,
        'attendance_summary': attendance_summary,
        'today_attendance': today_attendance,
        'selected': selected
    }
    return render(request, 'faculty_dashboard.html', context)

@login_required(login_url='login')
def searchAttendence(request):
    if not hasattr(request.user, 'faculty') and not request.user.is_superuser:
        messages.error(request, "Access denied.")
        return redirect('login')
    attendances = Attendance.objects.all().order_by('-date')
    myFilter = AttendenceFilter(request.GET, queryset=attendances)
    attendances = myFilter.qs
    context = {'myFilter': myFilter, 'attendances': attendances, 'ta': False}
    return render(request, 'attendence.html', context)

@login_required(login_url='login')
def facultyProfile(request):
    if not hasattr(request.user, 'faculty'):
        messages.error(request, "Access denied.")
        return redirect('login')
    faculty = request.user.faculty
    if request.method == 'POST':
        form = FacultyForm(request.POST, request.FILES, instance=faculty)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated.")
            return redirect('faculty_profile')
        else:
            messages.error(request, "Please correct the errors below.")
    else:
        form = FacultyForm(instance=faculty)
    return render(request, 'facultyform.html', {'form': form})


@login_required(login_url='login')
def studentDashboard(request):
    student = getattr(request.user, 'student_profile', None)
    if student is None:
        messages.error(request, "Access denied.")
        return redirect('login')
    attendences = Attendance.objects.filter(student=student).order_by('-date')
    total_classes = attendences.count()
    present_count = attendences.filter(status__iexact='Present').count()
    absent_count = total_classes - present_count
    percentage = round((present_count / total_classes) * 100, 2) if total_classes > 0 else 0
    attendance_summary = {'present': present_count, 'absent': absent_count, 'total': total_classes, 'percentage': percentage}
    return render(request, 'student_dashboard.html', {
        'student': student,
        'attendences': attendences,
        'total_classes': total_classes,
        'present_count': present_count,
        'absent_count': absent_count,
        'percentage': percentage,
        'attendance_summary': attendance_summary,
    })



# view history
from django.contrib.auth import get_user_model

User = get_user_model()


from django.contrib.auth.forms import UserCreationForm
from django import forms

class StudentUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")

from django.views.decorators.csrf import csrf_protect

@csrf_protect
def add_student(request):
    from django.contrib.auth.models import User
    if request.method == "POST":
        form = CreateStudentForm(request.POST, request.FILES)
        if form.is_valid():
            reg_id = form.cleaned_data['registration_id']
            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['last_name']
            email = form.cleaned_data['email']
            user = User.objects.create_user(
                username=reg_id,
                password=reg_id,
                first_name=first_name,
                last_name=last_name,
                email=email
            )
            student = form.save(commit=False)
            student.user = user
            student.first_name = first_name
            student.last_name = last_name
            student.email = email
            student.save()
            return redirect('view_students')
    else:
        form = CreateStudentForm()
    return render(request, 'add_student.html', {'form': form})

def view_students(request):
    students = Student.objects.all()
    return render(request, 'students.html', {'students': students})



class FacultyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ("username", "first_name", "last_name", "email")

@csrf_protect
def add_faculty(request):
    from django.contrib.auth.models import User
    if request.method == "POST":
        form = FacultyForm(request.POST, request.FILES)
        if form.is_valid():
            uid = form.cleaned_data['uid']
            first_name = form.cleaned_data['first_name']
            last_name = form.cleaned_data['last_name']
            email = form.cleaned_data['email']
            user = User.objects.create_user(
                username=uid,
                password=uid,
                first_name=first_name,
                last_name=last_name,
                email=email
            )
            faculty = form.save(commit=False)
            faculty.user = user
            faculty.uid = uid
            faculty.first_name = first_name
            faculty.last_name = last_name
            faculty.email = email
            faculty.save()
            return redirect('view_faculty')
    else:
        form = FacultyForm()
    return render(request, 'add_faculty.html', {'form': form})

def view_faculty(request):
    faculties = Faculty.objects.all()
    return render(request, 'faculty.html', {'faculties': faculties})

# Attendance
def view_attendance(request):
    search = request.GET.get('search', '').strip()
    attendances = Attendance.objects.all()
    filtered = False
    if search:
        # Try to match student registration or faculty UID
        attendances = attendances.filter(
            student__registration_id__iexact=search
        ) | attendances.filter(
            faculty__user__username__iexact=search
        )
        filtered = True
    present_count = attendances.filter(status__iexact='Present').count()
    absent_count = attendances.filter(status__iexact='Absent').count()
    return render(request, 'attendance.html', {
        'attendances': attendances,
        'present_count': present_count,
        'absent_count': absent_count,
        'search': search,
        'filtered': filtered,
    })
