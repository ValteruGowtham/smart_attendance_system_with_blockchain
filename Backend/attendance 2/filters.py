import django_filters
from django import forms
from .models import Attendance

class AttendenceFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(
        field_name='date',
        lookup_expr='exact',
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    branch = django_filters.CharFilter(field_name='branch', lookup_expr='icontains')
    year = django_filters.CharFilter(field_name='year', lookup_expr='icontains')
    section = django_filters.CharFilter(field_name='section', lookup_expr='icontains')
    Student_ID = django_filters.CharFilter(field_name='Student_ID', lookup_expr='icontains')

    class Meta:
        model = Attendance
        fields = ['date', 'branch', 'year', 'section', 'Student_ID', 'period']
