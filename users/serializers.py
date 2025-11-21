from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import TrainingDay


from .models import (
    Company,
    Student,
    Visit,
    EvaluationRequest,
    AssignedEvaluation,
    Evaluation,
)

User = get_user_model()


# ==========================
# USER SERIALIZER
# ==========================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "is_active"]


# ==========================
# COMPANY SERIALIZER
# ==========================
class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = "__all__"


# ==========================
# STUDENT SERIALIZER
# ==========================
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"


# ==========================
# VISIT SERIALIZER
# ==========================
class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = "__all__"


# ==========================
# EVALUATION REQUEST
# ==========================
class EvaluationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRequest
        fields = "__all__"


# ==========================
# ASSIGNED EVALUATION
# ==========================
class AssignedEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedEvaluation
        fields = "__all__"


# ==========================
# EVALUATION (التقييم)
# ==========================
class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = "__all__"


# ------------------------------
# TRAINING DAY SERIALIZER
# ------------------------------
class TrainingDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingDay
        fields = '__all__'


# ------------------------------
# ATTENDANCE RECORD SERIALIZER
# ------------------------------
class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = [
            'id',
            'student',
            'student_name',
            'company',
            'company_name',
            'date',
            'status',
            'reason',
            'recorded_by',
            'created_at'
        ]
        read_only_fields = ['created_at']

# TRAINING DAYS
path('training-days/', training_days_list),
path('training-days/<int:pk>/', training_day_detail),

# ATTENDANCE
path('attendance/', attendance_list),
path('attendance/<int:pk>/', attendance_detail),

