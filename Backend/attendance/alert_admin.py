"""
Admin Configuration for Alert Models - Register models in Django admin.
Add this to attendance/admin.py or create as separate file and import.
"""

from django.contrib import admin
from django.utils.html import format_html
from .alert_models import AttendanceAlert, AlertLog, AlertPreference, DailyAlertLimit


@admin.register(AttendanceAlert)
class AttendanceAlertAdmin(admin.ModelAdmin):
    list_display = ['student_display', 'alert_type_badge', 'status_badge', 'channel', 'created_at', 'sent_at']
    list_filter = ['status', 'alert_type', 'channel', 'created_at']
    search_fields = ['student__registration_id', 'student__email', 'recipient_email']
    readonly_fields = ['created_at', 'sent_at', 'error_message', 'retry_count']
    
    fieldsets = (
        ('Alert Information', {
            'fields': ('student', 'alert_type', 'status', 'channel')
        }),
        ('Recipient Details', {
            'fields': ('recipient_email', 'recipient_phone')
        }),
        ('Alert Content', {
            'fields': ('current_attendance', 'classes_needed', 'threshold')
        }),
        ('Timing', {
            'fields': ('created_at', 'sent_at')
        }),
        ('Error Handling', {
            'fields': ('error_message', 'retry_count', 'max_retries'),
            'classes': ('collapse',)
        }),
    )
    
    def student_display(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name} ({obj.student.registration_id})"
    student_display.short_description = 'Student'
    
    def alert_type_badge(self, obj):
        if obj.alert_type == 'absent':
            color = 'red'
        else:
            color = 'orange'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_alert_type_display()
        )
    alert_type_badge.short_description = 'Alert Type'
    
    def status_badge(self, obj):
        if obj.status == 'sent':
            color = 'green'
        elif obj.status == 'pending':
            color = 'blue'
        else:
            color = 'red'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    actions = ['mark_as_sent', 'retry_failed_alerts']
    
    def mark_as_sent(self, request, queryset):
        for alert in queryset:
            alert.mark_sent()
        self.message_user(request, f"{queryset.count()} alerts marked as sent.")
    mark_as_sent.short_description = "Mark selected alerts as sent"
    
    def retry_failed_alerts(self, request, queryset):
        failed_alerts = queryset.filter(status='failed', retry_count__lt=3)
        failed_alerts.update(status='pending')
        self.message_user(request, f"{failed_alerts.count()} alerts queued for retry.")
    retry_failed_alerts.short_description = "Retry failed alerts"


@admin.register(AlertLog)
class AlertLogAdmin(admin.ModelAdmin):
    list_display = ['alert', 'action', 'timestamp', 'details_preview']
    list_filter = ['action', 'timestamp', 'alert__student']
    search_fields = ['alert__student__registration_id']
    readonly_fields = ['timestamp', 'details']
    date_hierarchy = 'timestamp'
    
    def details_preview(self, obj):
        if obj.details:
            preview = str(obj.details)[:50]
            return f"{preview}..." if len(str(obj.details)) > 50 else preview
        return "-"
    details_preview.short_description = 'Details'


@admin.register(AlertPreference)
class AlertPreferenceAdmin(admin.ModelAdmin):
    list_display = ['student_display', 'email_alerts_display', 'sms_alerts_display', 'parent_notify', 'alerts_enabled']
    list_filter = ['email_on_absent', 'email_on_below_threshold', 'sms_enabled', 'notify_parent', 'alerts_disabled']
    search_fields = ['student__registration_id', 'student__email', 'phone_number', 'parent_email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Student', {
            'fields': ('student',)
        }),
        ('Email Preferences', {
            'fields': ('email_on_absent', 'email_on_below_threshold', 'email_frequency')
        }),
        ('SMS Preferences', {
            'fields': ('sms_enabled', 'phone_number', 'sms_on_absent', 'sms_on_below_threshold'),
            'classes': ('collapse',)
        }),
        ('Parent/Guardian Notification', {
            'fields': ('notify_parent', 'parent_email'),
            'classes': ('collapse',)
        }),
        ('Quiet Hours', {
            'fields': ('quiet_hours_enabled', 'quiet_hours_start', 'quiet_hours_end'),
            'classes': ('collapse',)
        }),
        ('Disable Temporarily', {
            'fields': ('alerts_disabled', 'disabled_until'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_display(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name} ({obj.student.registration_id})"
    student_display.short_description = 'Student'
    
    def email_alerts_display(self, obj):
        alerts = []
        if obj.email_on_absent:
            alerts.append('Absent')
        if obj.email_on_below_threshold:
            alerts.append('Threshold')
        return ', '.join(alerts) if alerts else 'None'
    email_alerts_display.short_description = 'Email Alerts'
    
    def sms_alerts_display(self, obj):
        if not obj.sms_enabled:
            return 'Disabled'
        alerts = []
        if obj.sms_on_absent:
            alerts.append('Absent')
        if obj.sms_on_below_threshold:
            alerts.append('Threshold')
        return ', '.join(alerts) if alerts else 'None'
    sms_alerts_display.short_description = 'SMS Alerts'
    
    def parent_notify(self, obj):
        return 'Yes' if obj.notify_parent else 'No'
    parent_notify.short_description = 'Notify Parent'
    
    def alerts_enabled(self, obj):
        status = 'Disabled' if obj.is_disabled() else 'Enabled'
        color = 'red' if obj.is_disabled() else 'green'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            status
        )
    alerts_enabled.short_description = 'Status'
    
    actions = ['enable_alerts', 'disable_alerts', 'enable_sms']
    
    def enable_alerts(self, request, queryset):
        queryset.update(alerts_disabled=False, disabled_until=None)
        self.message_user(request, f"Alerts enabled for {queryset.count()} students.")
    enable_alerts.short_description = "Enable alerts"
    
    def disable_alerts(self, request, queryset):
        queryset.update(alerts_disabled=True)
        self.message_user(request, f"Alerts disabled for {queryset.count()} students.")
    disable_alerts.short_description = "Disable alerts"
    
    def enable_sms(self, request, queryset):
        queryset.update(sms_enabled=True)
        self.message_user(request, f"SMS enabled for {queryset.count()} students.")
    enable_sms.short_description = "Enable SMS notifications"


@admin.register(DailyAlertLimit)
class DailyAlertLimitAdmin(admin.ModelAdmin):
    list_display = ['student', 'date', 'total_alerts', 'at_limit']
    list_filter = ['date', 'student__branch']
    search_fields = ['student__registration_id']
    readonly_fields = ['date', 'student']
    date_hierarchy = 'date'
    
    def total_alerts(self, obj):
        total = obj.absent_alerts_sent + obj.threshold_alerts_sent
        return format_html(
            '<strong>{}</strong> (Absent: {}, Threshold: {})',
            total,
            obj.absent_alerts_sent,
            obj.threshold_alerts_sent
        )
    total_alerts.short_description = 'Total Alerts'
    
    def at_limit(self, obj):
        if obj.can_send_alert():
            return format_html('<span style="color: green;">✓ Can Send</span>')
        else:
            return format_html('<span style="color: red;">✗ Limit Reached</span>')
    at_limit.short_description = 'Limit Status'
