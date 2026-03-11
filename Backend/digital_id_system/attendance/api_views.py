"""
REST API views for the React frontend.
All endpoints return JSON responses.
"""
from functools import wraps

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from datetime import date, datetime
import json

from .models import Student, Faculty, Attendance


def api_login_required(view_func):
    """Return 401 JSON instead of redirecting to a login page."""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

try:
    from .recognizer import Recognizer
except Exception:
    Recognizer = None


def api_user_info(request):
    """Return current user info + role."""
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})

    user = request.user
    role = 'unknown'
    profile = {}

    if user.is_superuser:
        role = 'admin'
    elif hasattr(user, 'faculty_profile'):
        role = 'faculty'
        f = user.faculty_profile
        profile = {
            'uid': f.uid,
            'phone': f.phone,
            'profile_pic': f.profile_pic.url if f.profile_pic else None,
        }
    elif hasattr(user, 'student_profile'):
        role = 'student'
        s = user.student_profile
        profile = {
            'registration_id': s.registration_id,
            'branch': s.branch,
            'year': s.year,
            'section': s.section,
            'profile_pic': s.profile_pic.url if s.profile_pic else None,
        }

    return JsonResponse({
        'authenticated': True,
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'role': role,
        'profile': profile,
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    """Login and return user info."""
    data = json.loads(request.body)
    username = data.get('username', '')
    password = data.get('password', '')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        role = 'unknown'
        if user.is_superuser:
            role = 'admin'
        elif hasattr(user, 'faculty_profile'):
            role = 'faculty'
        elif hasattr(user, 'student_profile'):
            role = 'student'
        return JsonResponse({
            'success': True,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role,
        })
    return JsonResponse({'success': False, 'error': 'Invalid username or password'}, status=401)


@csrf_exempt
@require_http_methods(["POST"])
def api_logout(request):
    logout(request)
    return JsonResponse({'success': True})


# ─── Admin stats ─────────────────────────────────────────────
@api_login_required
def api_admin_stats(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Forbidden'}, status=403)
    return JsonResponse({
        'total_students': Student.objects.count(),
        'total_faculty': Faculty.objects.count(),
        'total_attendance': Attendance.objects.count(),
    })


# ─── Students CRUD ───────────────────────────────────────────
@api_login_required
def api_students_list(request):
    students = Student.objects.select_related('user').all()
    data = [{
        'id': s.id,
        'first_name': s.user.first_name,
        'last_name': s.user.last_name,
        'email': s.user.email,
        'registration_id': s.registration_id,
        'branch': s.branch,
        'year': s.year,
        'section': s.section,
        'profile_pic': s.profile_pic.url if s.profile_pic else None,
    } for s in students]
    return JsonResponse(data, safe=False)


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_student_add(request):
    """Add a student (admin or faculty)."""
    try:
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        email = request.POST.get('email', '')
        registration_id = request.POST.get('registration_id', '')
        branch = request.POST.get('branch', '')
        year = request.POST.get('year', '')
        section = request.POST.get('section', '')
        profile_pic = request.FILES.get('profile_pic')

        user = User.objects.create_user(
            username=registration_id,
            password=registration_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        student = Student.objects.create(
            user=user,
            registration_id=registration_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            branch=branch,
            year=year,
            section=section,
            profile_pic=profile_pic,
        )
        return JsonResponse({'success': True, 'id': student.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─── Faculty CRUD ────────────────────────────────────────────
@api_login_required
def api_faculty_list(request):
    faculties = Faculty.objects.select_related('user').all()
    data = [{
        'id': f.id,
        'uid': f.uid,
        'first_name': f.user.first_name,
        'last_name': f.user.last_name,
        'email': f.user.email,
        'phone': f.phone,
        'profile_pic': f.profile_pic.url if f.profile_pic else None,
    } for f in faculties]
    return JsonResponse(data, safe=False)


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_faculty_add(request):
    """Add a faculty member."""
    try:
        first_name = request.POST.get('first_name', '')
        last_name = request.POST.get('last_name', '')
        email = request.POST.get('email', '')
        uid = request.POST.get('uid', '')
        phone = request.POST.get('phone', '')
        profile_pic = request.FILES.get('profile_pic')

        user = User.objects.create_user(
            username=uid,
            password=uid,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        faculty = Faculty.objects.create(
            user=user,
            uid=uid,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            profile_pic=profile_pic,
        )
        return JsonResponse({'success': True, 'id': faculty.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─── Attendance ──────────────────────────────────────────────
@api_login_required
def api_attendance_list(request):
    """List attendance records with optional search."""
    search = request.GET.get('search', '').strip()
    qs = Attendance.objects.select_related('student', 'student__user', 'faculty', 'faculty__user').all().order_by('-date', '-time')
    if search:
        qs = qs.filter(
            Q(student__registration_id__icontains=search) |
            Q(faculty__uid__icontains=search)
        )

    data = [{
        'id': a.id,
        'date': str(a.date) if a.date else '',
        'time': str(a.time) if a.time else '',
        'student_name': f"{a.student.user.first_name} {a.student.user.last_name}",
        'student_id': a.student.registration_id,
        'faculty_name': f"{a.faculty.user.first_name} {a.faculty.user.last_name}",
        'branch': a.branch,
        'year': a.year,
        'section': a.section,
        'period': a.period,
        'status': a.status,
    } for a in qs[:500]]

    present = qs.filter(status__iexact='Present').count()
    absent = qs.filter(status__iexact='Absent').count()

    return JsonResponse({'records': data, 'present_count': present, 'absent_count': absent})


# ─── Faculty Dashboard ───────────────────────────────────────
@api_login_required
def api_faculty_dashboard(request):
    """Return faculty dashboard metadata (branches, years, sections, periods)."""
    faculty = getattr(request.user, 'faculty_profile', None)
    if not faculty:
        return JsonResponse({'error': 'Not a faculty member'}, status=403)

    branches = [b[0] for b in Student.BRANCH]
    years = [y[0] for y in Student.YEAR]
    sections = list(Student.objects.values_list('section', flat=True).distinct().order_by('section'))
    periods = ['1', '2', '3', '4', '5', '6', '7', '8']

    return JsonResponse({
        'faculty_name': str(faculty),
        'branches': branches,
        'years': years,
        'sections': sections,
        'periods': periods,
    })


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_mark_attendance(request):
    """Mark attendance with face recognition."""
    faculty = getattr(request.user, 'faculty_profile', None)
    if not faculty:
        return JsonResponse({'error': 'Not a faculty member'}, status=403)

    branch = request.POST.get('branch', '')
    year = request.POST.get('year', '')
    section = request.POST.get('section', '')
    period = request.POST.get('period', '')
    face_image_data = request.POST.get('face_image_data', '')

    if not face_image_data.strip():
        return JsonResponse({'error': 'Please capture a face image before submitting.'}, status=400)

    if Attendance.objects.filter(date=date.today(), branch=branch, year=year, section=section, period=period, faculty=faculty).exists():
        return JsonResponse({'error': 'Attendance already recorded for this class today.'}, status=400)

    students = Student.objects.filter(branch__iexact=branch, year__iexact=year, section__iexact=section)
    if not students.exists():
        return JsonResponse({'error': f'No students found for {branch}-{year}-{section}.'}, status=400)

    recognized = []
    if Recognizer and face_image_data:
        try:
            selected = {'branch': branch, 'year': year, 'section': section, 'period': period}
            recognized = Recognizer(selected, face_image_data)
        except Exception as e:
            recognized = []

    now = datetime.now()
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
            status='Present' if student.registration_id in recognized else 'Absent',
        )

    # Return today's attendance for that class
    today_records = Attendance.objects.filter(
        date=date.today(), branch=branch, year=year, section=section, period=period, faculty=faculty
    ).select_related('student', 'student__user')

    records = [{
        'time': str(a.time),
        'student_id': a.student.registration_id,
        'student_name': f"{a.student.user.first_name} {a.student.user.last_name}",
        'class_info': f"{a.branch}-{a.year}-{a.section}",
        'period': a.period,
        'status': a.status,
    } for a in today_records]

    present = today_records.filter(status='Present').count()
    total = today_records.count()
    absent = total - present
    pct = round(present / total * 100, 2) if total > 0 else 0

    return JsonResponse({
        'success': True,
        'records': records,
        'summary': {'present': present, 'absent': absent, 'total': total, 'percentage': pct},
    })


# ─── Student Dashboard ───────────────────────────────────────
@api_login_required
def api_student_dashboard(request):
    student = getattr(request.user, 'student_profile', None)
    if not student:
        return JsonResponse({'error': 'Not a student'}, status=403)

    attendances = Attendance.objects.filter(student=student).select_related('faculty', 'faculty__user').order_by('-date')
    total = attendances.count()
    present = attendances.filter(status__iexact='Present').count()
    absent = total - present
    pct = round((present / total) * 100, 2) if total > 0 else 0

    records = [{
        'date': str(a.date) if a.date else '',
        'time': str(a.time) if a.time else '',
        'faculty_name': f"{a.faculty.user.first_name} {a.faculty.user.last_name}",
        'period': a.period,
        'status': a.status,
    } for a in attendances]

    return JsonResponse({
        'student': {
            'first_name': student.user.first_name,
            'last_name': student.user.last_name,
            'registration_id': student.registration_id,
            'branch': student.branch,
            'year': student.year,
            'section': student.section,
        },
        'records': records,
        'summary': {
            'present': present,
            'absent': absent,
            'total': total,
            'percentage': pct,
        },
    })
