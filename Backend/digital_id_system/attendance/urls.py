from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('login/', views.loginPage, name='login'),
    path('logout/', views.logoutUser, name='logout'),
    path('', views.home, name='home'),
    path('student/update/', views.updateStudent, name='update_student'),
    path('student/update/search/', views.updateStudentRedirect, name='update_student_redirect'),
    path('account/', views.facultyProfile, name='account'),
    path('searchattendence/', views.searchAttendence, name='searchattendence'),
    path('faculty/dashboard/', views.facultyDashboard, name='faculty_dashboard'),
    path('faculty/profile/', views.facultyProfile, name='faculty_profile'),
    path('faculty/attendance/', views.facultyDashboard, name='take_attendance'),
    path('faculty/attendance/search/', views.searchAttendence, name='search_attendance'),
    path('updateStudentRedirect/', views.updateStudentRedirect, name='updateStudentRedirect'),
    path('student/dashboard/', views.studentDashboard, name='student_dashboard'),
    path('password_change/', auth_views.PasswordChangeView.as_view(template_name='attendence_sys/password_change.html', success_url='/password_change_done/'), name='password_change'),
    path('password_change_done/', auth_views.PasswordChangeDoneView.as_view(template_name='attendence_sys/password_change_done.html'), name='password_change_done'),
    
    path('add-student/', views.add_student, name='add_student'),
    path('view-students/', views.view_students, name='view_students'),
    path('add-faculty/', views.add_faculty, name='add_faculty'),
    path('view-faculty/', views.view_faculty, name='view_faculty'),
    path('view-attendance/', views.view_attendance, name='view_attendance'),

    path('face-recognition/', views.face_recognition_attendance, name='face_recognition_attendance'),

    # Admin add student/faculty
    path('admin/add-student/', views.admin_add_student, name='admin_add_student'),
    path('admin/add-faculty/', views.admin_add_faculty, name='admin_add_faculty'),

]
