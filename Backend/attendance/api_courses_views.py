import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Course, Student, Faculty
from .api_views import api_login_required

@api_login_required
def api_courses_list(request):
    courses = Course.objects.select_related('faculty', 'faculty__user').prefetch_related('students').all()
    data = [{
        'id': c.id,
        'course_code': c.course_code,
        'course_name': c.course_name,
        'faculty_name': f"{c.faculty.user.first_name} {c.faculty.user.last_name}" if c.faculty else '',
        'faculty_id': c.faculty.id if c.faculty else None,
        'branch': c.branch,
        'year': c.year,
        'section': c.section,
        'semester': c.semester,
        'academic_year': c.academic_year,
        'enrolled_count': c.students.count()
    } for c in courses]
    return JsonResponse(data, safe=False)

@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_course_add(request):
    if not request.user.is_superuser:
        return JsonResponse({'error': 'Forbidden'}, status=403)
    try:
        data = json.loads(request.body)
        course = Course.objects.create(
            course_code=data.get('course_code'),
            course_name=data.get('course_name'),
            faculty_id=data.get('faculty_id'),
            branch=data.get('branch'),
            year=data.get('year'),
            section=data.get('section'),
            semester=data.get('semester'),
            academic_year=data.get('academic_year')
        )
        return JsonResponse({'success': True, 'id': course.id})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
@api_login_required
@require_http_methods(["POST"])
def api_course_enroll(request, course_id):
    if not request.user.is_superuser and not hasattr(request.user, 'faculty_profile'):
        return JsonResponse({'error': 'Forbidden'}, status=403)
    try:
        course = Course.objects.get(id=course_id)
        data = json.loads(request.body)
        student_ids = data.get('student_ids', [])
        students = Student.objects.filter(id__in=student_ids)
        course.students.add(*students)
        return JsonResponse({'success': True, 'enrolled_count': course.students.count()})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@api_login_required
def api_course_students(request, course_id):
    try:
        course = Course.objects.get(id=course_id)
        students = course.students.select_related('user').all()
        data = [{
            'id': s.id,
            'registration_id': s.registration_id,
            'first_name': s.user.first_name,
            'last_name': s.user.last_name,
            'branch': s.branch,
            'year': s.year,
            'section': s.section
        } for s in students]
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
