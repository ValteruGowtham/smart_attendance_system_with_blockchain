"""
Attendance Prediction Logic
Calculates current percentage, classes needed, and risk level
"""

from django.db.models import Q, Count
from datetime import date
from .models import Attendance, Student


class AttendancePrediction:
    """
    Calculates attendance predictions and risk levels.
    """
    
    TARGET_PERCENTAGE = 75
    
    def __init__(self, total_classes, attended_classes, target_percentage=None):
        """
        Initialize prediction calculator.
        
        Args:
            total_classes (int): Total number of classes held
            attended_classes (int): Number of classes student attended
            target_percentage (float): Target attendance percentage (default: 75)
        """
        self.total_classes = int(total_classes)
        self.attended_classes = int(attended_classes)
        self.target_percentage = target_percentage or self.TARGET_PERCENTAGE
        
        # Validate inputs
        if self.total_classes <= 0:
            raise ValueError("Total classes must be greater than 0")
        if self.attended_classes < 0:
            raise ValueError("Attended classes cannot be negative")
        if self.attended_classes > self.total_classes:
            raise ValueError("Attended classes cannot exceed total classes")
    
    def get_current_percentage(self):
        """
        Calculate current attendance percentage.
        
        Returns:
            float: Current attendance percentage (0-100)
        """
        if self.total_classes == 0:
            return 0.0
        return round((self.attended_classes / self.total_classes) * 100, 2)
    
    def get_classes_needed(self):
        """
        Calculate classes needed to reach target percentage.
        
        Returns:
            int: Number of additional classes needed
        """
        current_pct = self.get_current_percentage()
        
        # Already above target
        if current_pct >= self.target_percentage:
            return 0
        
        # Formula: (x + attended) / (x + total) = target / 100
        # Where x is classes needed
        # Solving: x = (target * total - 100 * attended) / (100 - target)
        
        target_decimal = self.target_percentage / 100
        
        # If target is 100%, can't reach if already below
        if self.target_percentage == 100:
            return float('inf')
        
        classes_needed = (
            (self.target_percentage * self.total_classes - 100 * self.attended_classes) /
            (100 - self.target_percentage)
        )
        
        return max(0, int(classes_needed) if classes_needed == int(classes_needed) else int(classes_needed) + 1)
    
    def get_risk_level(self):
        """
        Determine risk level based on current attendance.
        
        Risk Levels:
            - CRITICAL: < 50% (urgent action needed)
            - WARNING: 50-74% (needs improvement)
            - SAFE: >= 75% (target met)
        
        Returns:
            dict: {
                'level': 'CRITICAL' | 'WARNING' | 'SAFE',
                'color': 'red' | 'yellow' | 'green',
                'message': str
            }
        """
        current_pct = self.get_current_percentage()
        
        if current_pct >= self.target_percentage:
            return {
                'level': 'SAFE',
                'color': 'green',
                'message': f'Your attendance is at {current_pct}%. Great job! Keep it up!'
            }
        elif current_pct >= 50:
            return {
                'level': 'WARNING',
                'color': 'yellow',
                'message': f'Your attendance is at {current_pct}%. Attend {self.get_classes_needed()} more classes to reach {self.target_percentage}%'
            }
        else:
            return {
                'level': 'CRITICAL',
                'color': 'red',
                'message': f'Your attendance is at {current_pct}%. URGENT: Attend {self.get_classes_needed()} more classes to reach {self.target_percentage}%'
            }
    
    def get_projection(self, future_classes=5):
        """
        Project attendance if student attends X more classes.
        
        Args:
            future_classes (int): Number of future classes to consider
        
        Returns:
            dict: Projections for attending/missing future classes
        """
        if future_classes < 0:
            raise ValueError("Future classes cannot be negative")
        
        attended_all = self.attended_classes + future_classes
        total_all = self.total_classes + future_classes
        
        if_attend_all = round((attended_all / total_all) * 100, 2) if total_all > 0 else 0
        if_miss_all = round((self.attended_classes / total_all) * 100, 2) if total_all > 0 else 0
        
        return {
            'future_classes': future_classes,
            'if_attend_all': if_attend_all,
            'if_miss_all': if_miss_all,
            'current': self.get_current_percentage()
        }
    
    def to_dict(self):
        """
        Return complete prediction as dictionary.
        
        Returns:
            dict: Complete prediction data
        """
        return {
            'attended_classes': self.attended_classes,
            'total_classes': self.total_classes,
            'current_percentage': self.get_current_percentage(),
            'target_percentage': self.target_percentage,
            'classes_needed': self.get_classes_needed(),
            'risk_level': self.get_risk_level(),
            'projection': self.get_projection(),
            'remaining_classes': self.total_classes - self.attended_classes
        }


class StudentAttendancePrediction:
    """
    Calculate attendance prediction for a specific student.
    """
    
    @staticmethod
    def get_student_prediction(student, subject=None, target_percentage=75):
        """
        Get attendance prediction for a student.
        
        Args:
            student (Student): Student object
            subject (str): Optional subject filter
            target_percentage (float): Target attendance percentage
        
        Returns:
            dict: Prediction data
        
        Raises:
            Student.DoesNotExist: If student not found
        """
        # Get all attendance records for student
        query = Attendance.objects.filter(student=student)
        
        if subject:
            query = query.filter(branch=subject)
        
        # Count total and attended classes
        total_classes = query.count()
        attended_classes = query.filter(status='Present').count()
        
        if total_classes == 0:
            return {
                'error': 'No attendance records found',
                'student_id': student.registration_id,
                'message': 'Student has no attendance records yet'
            }
        
        prediction = AttendancePrediction(
            total_classes=total_classes,
            attended_classes=attended_classes,
            target_percentage=target_percentage
        )
        
        result = prediction.to_dict()
        result['student_id'] = student.registration_id
        result['student_name'] = f"{student.first_name} {student.last_name}"
        
        return result
    
    @staticmethod
    def get_class_at_risk_students(branch, year, section, threshold=75):
        """
        Get list of students in a class who are at risk (below threshold).
        
        Args:
            branch (str): Branch code
            year (str): Year
            section (str): Section
            threshold (float): Risk threshold percentage
        
        Returns:
            list: List of at-risk students with their predictions
        """
        students = Student.objects.filter(
            branch=branch,
            year=year,
            section=section
        )
        
        at_risk_students = []
        
        for student in students:
            prediction = StudentAttendancePrediction.get_student_prediction(
                student,
                target_percentage=threshold
            )
            
            if 'error' not in prediction:
                current_pct = prediction['current_percentage']
                if current_pct < threshold:
                    at_risk_students.append({
                        'student_id': prediction['student_id'],
                        'student_name': prediction['student_name'],
                        'current_percentage': current_pct,
                        'classes_needed': prediction['classes_needed'],
                        'risk_level': prediction['risk_level']['level']
                    })
        
        # Sort by attendance percentage (lowest first)
        at_risk_students.sort(key=lambda x: x['current_percentage'])
        
        return at_risk_students
    
    @staticmethod
    def get_batch_predictions(student_ids, target_percentage=75):
        """
        Get predictions for multiple students.
        
        Args:
            student_ids (list): List of student IDs (registration_id)
            target_percentage (float): Target attendance percentage
        
        Returns:
            list: List of predictions for each student
        """
        predictions = []
        
        students = Student.objects.filter(registration_id__in=student_ids)
        
        for student in students:
            prediction = StudentAttendancePrediction.get_student_prediction(
                student,
                target_percentage=target_percentage
            )
            predictions.append(prediction)
        
        return predictions
