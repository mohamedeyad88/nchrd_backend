from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Company,
    Student,
    Visit,
    EvaluationRequest,
    AssignedEvaluation,
    Evaluation,
    TrainingDay,
    AttendanceRecord,
    SystemLog,
    Notification  # تأكد من وجود هذا الاستيراد
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "role", "is_active"]

class CompanySerializer(serializers.ModelSerializer):
    student_count = serializers.ReadOnlyField()
    class Meta:
        model = Company
        fields = "__all__"

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = "__all__"

class VisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visit
        fields = "__all__"

class EvaluationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationRequest
        fields = "__all__"

class AssignedEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssignedEvaluation
        fields = "__all__"

class EvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evaluation
        fields = "__all__"

class TrainingDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingDay
        fields = "__all__"

class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    company_name = serializers.CharField(source='company.name', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['created_at']

class SystemLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = SystemLog
        fields = '__all__'

# ------------------------------
# NOTIFICATIONS SERIALIZER (هذا ما كان ينقصك)
# ------------------------------
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at']

# ------------------------------
# CHANGE PASSWORD SERIALIZER
# ------------------------------
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)