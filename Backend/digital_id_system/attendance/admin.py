from django.contrib import admin

from .models import *
from .alert_admin import (
    AttendanceAlertAdmin, AlertLogAdmin, AlertPreferenceAdmin, DailyAlertLimitAdmin
)

# Register your models here.

admin.site.register(Faculty)
admin.site.register(Student)
admin.site.register(Attendance)