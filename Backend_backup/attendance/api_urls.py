from django.urls import path
from . import api_views

urlpatterns = [
    # Auth
    path('auth/user/', api_views.api_user_info, name='api_user_info'),
    path('auth/login/', api_views.api_login, name='api_login'),
    path('auth/logout/', api_views.api_logout, name='api_logout'),

    # Admin
    path('admin/stats/', api_views.api_admin_stats, name='api_admin_stats'),

    # Students
    path('students/', api_views.api_students_list, name='api_students_list'),
    path('students/add/', api_views.api_student_add, name='api_student_add'),
    path('students/<int:student_id>/update/', api_views.api_student_update, name='api_student_update'),
    path('students/<int:student_id>/delete/', api_views.api_student_delete, name='api_student_delete'),

    # Faculty
    path('faculty/', api_views.api_faculty_list, name='api_faculty_list'),
    path('faculty/add/', api_views.api_faculty_add, name='api_faculty_add'),
    path('faculty/<int:faculty_id>/update/', api_views.api_faculty_update, name='api_faculty_update'),
    path('faculty/<int:faculty_id>/delete/', api_views.api_faculty_delete, name='api_faculty_delete'),

    # Attendance
    path('attendance/', api_views.api_attendance_list, name='api_attendance_list'),
    path('attendance/mark/', api_views.api_mark_attendance, name='api_mark_attendance'),

    # Dashboards
    path('faculty/dashboard/', api_views.api_faculty_dashboard, name='api_faculty_dashboard'),
    path('student/dashboard/', api_views.api_student_dashboard, name='api_student_dashboard'),
]
