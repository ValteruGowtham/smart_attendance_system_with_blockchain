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
from datetime import date, datetime, time as dt_time, timedelta
import json
from django.utils import timezone

from .models import Student, Faculty, Attendance
from .embedding_utils import save_student_embedding


PERIOD_TIME_SLOTS = {
    '1': {'start': dt_time(9, 0), 'end': dt_time(10, 0), 'label': '09:00 AM - 10:00 AM'},
    '2': {'start': dt_time(10, 0), 'end': dt_time(11, 0), 'label': '10:00 AM - 11:00 AM'},
    '3': {'start': dt_time(11, 0), 'end': dt_time(12, 0), 'label': '11:00 AM - 12:00 PM'},
    '4': {'start': dt_time(12, 0), 'end': dt_time(13, 0), 'label': '12:00 PM - 01:00 PM'},
    '5': {'start': dt_time(13, 0), 'end': dt_time(14, 0), 'label': '01:00 PM - 02:00 PM'},
    '6': {'start': dt_time(14, 0), 'end': dt_time(15, 0), 'label': '02:00 PM - 03:00 PM'},
    '7': {'start': dt_time(15, 0), 'end': dt_time(16, 0), 'label': '03:00 PM - 04:00 PM'},
    '8': {'start': dt_time(16, 0), 'end': dt_time(17, 0), 'label': '04:00 PM - 05:00 PM'},
}


def get_period_time_label(period):
    slot = PERIOD_TIME_SLOTS.get(str(period))
    return slot['label'] if slot else ''


def get_period_start_time(period):
    slot = PERIOD_TIME_SLOTS.get(str(period))
    return slot['start'] if slot else None


def format_time_short(value):
    return value.strftime('%I:%M %p') if value else ''


def get_current_period(now_time=None):
    current_time = now_time or timezone.localtime(timezone.now()).time()
    for period, slot in PERIOD_TIME_SLOTS.items():
        # Use <= for end time to include exact boundary times (e.g., 2:00 PM)
        if slot['start'] <= current_time <= slot['end']:
            return period
    return None


def resolve_period(request):
    requested_period = request.POST.get('period', '').strip()
    if requested_period in PERIOD_TIME_SLOTS:
        return requested_period
    return get_current_period()


def get_class_students(branch, year, section):
    return Student.objects.filter(branch__iexact=branch, year__iexact=year, section__iexact=section)


def get_today_class_records(faculty, branch, year, section, period):
    return Attendance.objects.filter(
        date=date.today(),
        branch=branch,
        year=year,
        section=section,
        period=period,
        faculty=faculty,
    )


def get_period_cutoff(period):
    """Return today's cutoff time for the period (9 minutes 59 seconds from period start)."""
    slot = PERIOD_TIME_SLOTS.get(str(period))
    if not slot:
        return None
    # Set cutoff to 9 minutes 59 seconds after period start
    period_start = datetime.combine(date.today(), slot['start'])
    return period_start + timedelta(minutes=9, seconds=59)


def close_attendance_window_and_mark_absent(faculty, branch, year, section, period):
    """Create Absent entries for students not yet recorded in this class-period."""
    students = get_class_students(branch, year, section)
    existing_records = get_today_class_records(faculty, branch, year, section, period)
    recorded_student_ids = set(existing_records.values_list('student_id', flat=True))
    period_start_time = get_period_start_time(period)

    created_absent = 0
    for student in students:
        if student.id in recorded_student_ids:
            continue
        Attendance.objects.create(
            faculty=faculty,
            student=student,
            date=date.today(),
            time=period_start_time,
            branch=branch,
            year=year,
            section=section,
            period=period,
            status='Absent',
        )
        created_absent += 1

    final_records = get_today_class_records(faculty, branch, year, section, period)
    return created_absent, final_records


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

        # Signal should generate embedding automatically; keep fallback for reliability.
        embedding_generated = bool(student.face_embedding)
        if profile_pic and not embedding_generated:
            embedding_generated = save_student_embedding(student)

        return JsonResponse({
            'success': True,
            'id': student.id,
            'embedding_generated': embedding_generated,
        })
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


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_student_update(request, student_id):
    """Update a student's details (admin only)."""
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        student = Student.objects.select_related('user').get(id=student_id)
        user = student.user
        
        # Update user fields
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.save()
        
        # Update student fields
        student.branch = request.POST.get('branch', student.branch)
        student.year = request.POST.get('year', student.year)
        student.section = request.POST.get('section', student.section)
        
        # Handle profile picture update
        if request.FILES.get('profile_pic'):
            student.profile_pic = request.FILES.get('profile_pic')
            # Regenerate embedding if new photo uploaded
            from .embedding_utils import save_student_embedding
            save_student_embedding(student)
        
        student.save()
        
        return JsonResponse({
            'success': True,
            'id': student.id,
        })
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@api_login_required
@require_http_methods(["POST", "DELETE"])
def api_student_delete(request, student_id):
    """Delete a student (admin only)."""
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        student = Student.objects.get(id=student_id)
        user = student.user
        username = user.username
        user.delete()  # This will cascade delete the student too
        return JsonResponse({'success': True, 'message': f'Student {username} deleted'})
    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_faculty_update(request, faculty_id):
    """Update a faculty member's details (admin only)."""
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        faculty = Faculty.objects.select_related('user').get(id=faculty_id)
        user = faculty.user
        
        # Update user fields
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.email = request.POST.get('email', user.email)
        user.save()
        
        # Update faculty fields
        faculty.phone = request.POST.get('phone', faculty.phone)
        
        # Handle profile picture update
        if request.FILES.get('profile_pic'):
            faculty.profile_pic = request.FILES.get('profile_pic')
        
        faculty.save()
        
        return JsonResponse({'success': True, 'id': faculty.id})
    except Faculty.DoesNotExist:
        return JsonResponse({'error': 'Faculty not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@csrf_exempt
@api_login_required
@require_http_methods(["POST", "DELETE"])
def api_faculty_delete(request, faculty_id):
    """Delete a faculty member (admin only)."""
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Admin access required'}, status=403)
    
    try:
        faculty = Faculty.objects.get(id=faculty_id)
        user = faculty.user
        username = user.username
        user.delete()  # This will cascade delete the faculty too
        return JsonResponse({'success': True, 'message': f'Faculty {username} deleted'})
    except Faculty.DoesNotExist:
        return JsonResponse({'error': 'Faculty not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


# ─── Attendance ──────────────────────────────────────────────
@api_login_required
def api_attendance_list(request):
    """List attendance records with optional search."""
    search = request.GET.get('search', '').strip()
    qs = Attendance.objects.select_related('student', 'student__user', 'faculty', 'faculty__user').all().order_by('-date', '-time', '-id')
    if search:
        qs = qs.filter(
            Q(student__registration_id__icontains=search) |
            Q(faculty__uid__icontains=search)
        )

    data = [{
        'id': a.id,
        'date': str(a.date) if a.date else '',
        'time': get_period_time_label(a.period) or format_time_short(a.time),
        'student_name': f"{a.student.user.first_name} {a.student.user.last_name}",
        'student_id': a.student.registration_id,
        'faculty_name': f"{a.faculty.user.first_name} {a.faculty.user.last_name}",
        'faculty_uid': a.faculty.uid,
        'branch': a.branch,
        'year': a.year,
        'section': a.section,
        'period': a.period,
        'period_time': get_period_time_label(a.period),
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
        'period_slots': {k: v['label'] for k, v in PERIOD_TIME_SLOTS.items()},
    })


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_attendance_window_open(request):
    """Open attendance window context for selected class and auto-detected period."""
    faculty = getattr(request.user, 'faculty_profile', None)
    if not faculty:
        return JsonResponse({'error': 'Not a faculty member'}, status=403)

    branch = request.POST.get('branch', '')
    year = request.POST.get('year', '')
    section = request.POST.get('section', '')
    period = resolve_period(request)

    period_start_time = get_period_start_time(period)
    if not period_start_time:
        return JsonResponse({'error': 'Current time is outside attendance periods (09:00 AM - 05:00 PM).'}, status=400)

    students = get_class_students(branch, year, section)
    if not students.exists():
        return JsonResponse({'error': f'No students found for {branch}-{year}-{section}.'}, status=400)

    cutoff = get_period_cutoff(period)
    now = timezone.localtime(timezone.now()).replace(tzinfo=None)

    # If already past cutoff, auto-close by marking absentees.
    if cutoff and now > cutoff:
        created_absent, final_records = close_attendance_window_and_mark_absent(
            faculty, branch, year, section, period
        )
        return JsonResponse({
            'success': False,
            'window_open': False,
            'auto_closed': True,
            'error': 'Attendance window closed (cutoff reached).',
            'period_time': get_period_time_label(period),
            'absent_marked_now': created_absent,
            'summary': {
                'present': final_records.filter(status='Present').count(),
                'absent': final_records.filter(status='Absent').count(),
                'total': final_records.count(),
            },
        }, status=400)

    return JsonResponse({
        'success': True,
        'window_open': True,
        'period': period,
        'period_time': get_period_time_label(period),
        'window_cutoff': cutoff.strftime('%I:%M %p') if cutoff else '',
        'window_cutoff_iso': cutoff.isoformat() if cutoff else '',
        'class_strength': students.count(),
        'message': 'Attendance window opened. Camera can remain active for on-the-spot submissions.',
    })


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_mark_attendance(request):
    """Mark attendance for a single recognized student only."""
    faculty = getattr(request.user, 'faculty_profile', None)
    if not faculty:
        return JsonResponse({'error': 'Not a faculty member'}, status=403)

    branch = request.POST.get('branch', '')
    year = request.POST.get('year', '')
    section = request.POST.get('section', '')
    period = resolve_period(request)
    face_image_data = request.POST.get('face_image_data', '')

    period_start_time = get_period_start_time(period)
    if not period_start_time:
        return JsonResponse({'error': 'Current time is outside attendance periods (09:00 AM - 05:00 PM).'}, status=400)

    if not face_image_data.strip():
        return JsonResponse({'error': 'Please capture a face image before submitting.'}, status=400)

    students = get_class_students(branch, year, section)
    if not students.exists():
        return JsonResponse({'error': f'No students found for {branch}-{year}-{section}.'}, status=400)

    cutoff = get_period_cutoff(period)
    now = timezone.localtime(timezone.now()).replace(tzinfo=None)
    if cutoff and now > cutoff:
        created_absent, final_records = close_attendance_window_and_mark_absent(
            faculty, branch, year, section, period
        )
        return JsonResponse({
            'error': 'Attendance window closed (cutoff reached).',
            'period_time': get_period_time_label(period),
            'absent_marked_now': created_absent,
            'summary': {
                'present': final_records.filter(status='Present').count(),
                'absent': final_records.filter(status='Absent').count(),
                'total': final_records.count(),
            },
        }, status=400)

    recognized = []
    if Recognizer and face_image_data:
        try:
            selected = {'branch': branch, 'year': year, 'section': section, 'period': period}
            recognized = Recognizer(selected, face_image_data)
        except Exception as e:
            recognized = []

    if len(recognized) != 1:
        return JsonResponse({
            'success': False,
            'unidentified': True,
            'error': 'Unidentified face. Please try again with a valid student face.',
        }, status=400)

    recognized_student = students.filter(registration_id=recognized[0]).first()
    if not recognized_student:
        return JsonResponse({
            'success': False,
            'unidentified': True,
            'error': 'Unidentified face. Please try again with a valid student face.',
        }, status=400)

    record, created = Attendance.objects.get_or_create(
        faculty=faculty,
        student=recognized_student,
        date=date.today(),
        branch=branch,
        year=year,
        section=section,
        period=period,
        defaults={
            'time': period_start_time,
            'status': 'Present',
        },
    )

    if not created and record.status != 'Present':
        record.status = 'Present'
        record.time = period_start_time
        record.save(update_fields=['status', 'time'])

    # Return today's attendance for that class
    today_records = get_today_class_records(faculty, branch, year, section, period).select_related('student', 'student__user')

    records = [{
        'time': get_period_time_label(a.period) or format_time_short(a.time),
        'student_id': a.student.registration_id,
        'student_name': f"{a.student.user.first_name} {a.student.user.last_name}",
        'class_info': f"{a.branch}-{a.year}-{a.section}",
        'period': a.period,
        'period_time': get_period_time_label(a.period),
        'status': a.status,
    } for a in today_records]

    present = today_records.filter(status='Present').count()
    total = today_records.count()
    absent = total - present
    pct = round(present / total * 100, 2) if total > 0 else 0

    return JsonResponse({
        'success': True,
        'marked_student_id': recognized_student.registration_id,
        'marked_student_name': f"{recognized_student.user.first_name} {recognized_student.user.last_name}",
        'period_time': get_period_time_label(period),
        'records': records,
        'summary': {'present': present, 'absent': absent, 'total': total, 'percentage': pct},
    })


@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_attendance_window_close(request):
    """Manually close attendance window and mark all unmarked students as Absent."""
    faculty = getattr(request.user, 'faculty_profile', None)
    if not faculty:
        return JsonResponse({'error': 'Not a faculty member'}, status=403)

    branch = request.POST.get('branch', '')
    year = request.POST.get('year', '')
    section = request.POST.get('section', '')
    period = resolve_period(request)

    period_start_time = get_period_start_time(period)
    if not period_start_time:
        return JsonResponse({'error': 'Current time is outside attendance periods (09:00 AM - 05:00 PM).'}, status=400)

    students = get_class_students(branch, year, section)
    if not students.exists():
        return JsonResponse({'error': f'No students found for {branch}-{year}-{section}.'}, status=400)

    created_absent, final_records = close_attendance_window_and_mark_absent(
        faculty, branch, year, section, period
    )

    records = [{
        'time': get_period_time_label(a.period) or format_time_short(a.time),
        'student_id': a.student.registration_id,
        'student_name': f"{a.student.user.first_name} {a.student.user.last_name}",
        'class_info': f"{a.branch}-{a.year}-{a.section}",
        'period': a.period,
        'period_time': get_period_time_label(a.period),
        'status': a.status,
    } for a in final_records.select_related('student', 'student__user')]

    present = final_records.filter(status='Present').count()
    total = final_records.count()
    absent = total - present
    pct = round(present / total * 100, 2) if total > 0 else 0

    return JsonResponse({
        'success': True,
        'window_open': False,
        'message': 'Attendance window closed. Remaining students marked absent.',
        'absent_marked_now': created_absent,
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
        'time': get_period_time_label(a.period) or format_time_short(a.time),
        'faculty_name': f"{a.faculty.user.first_name} {a.faculty.user.last_name}",
        'period': a.period,
        'period_time': get_period_time_label(a.period),
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
