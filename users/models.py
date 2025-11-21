from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


# ------------------------------
# CUSTOM USER MODEL
# ------------------------------
class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.username


# ------------------------------
# COMPANY MODEL
# ------------------------------
class Company(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ------------------------------
# STUDENT MODEL
# ------------------------------
class Student(models.Model):
    name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=14, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='students')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# ------------------------------
# VISIT MODEL
# ------------------------------
class Visit(models.Model):
    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('pending', 'Pending'),
        ('canceled', 'Canceled'),
    ]

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='visits')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='visits')
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visits')

    visit_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit - {self.company.name} - {self.student.name}"


# ------------------------------
# EVALUATION REQUEST (طلب تقييم)
# ------------------------------
class EvaluationRequest(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    issued_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='issued_evaluation_requests'
    )
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(blank=True, null=True)

    companies = models.ManyToManyField(Company, blank=True, related_name='evaluation_requests')
    students = models.ManyToManyField(Student, blank=True, related_name='evaluation_requests')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request: {self.title} (id={self.id})"


# ------------------------------
# ASSIGNED EVALUATION (توزيع التقييم)
# ------------------------------
class AssignedEvaluation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('printed', 'Printed'),
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('delivered', 'Delivered'),
        ('canceled', 'Canceled'),
    ]

    evaluation_request = models.ForeignKey(EvaluationRequest, on_delete=models.CASCADE, related_name='assignments')
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_evaluations')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, related_name='assigned_evaluations')
    student = models.ForeignKey(Student, on_delete=models.SET_NULL, null=True, related_name='assigned_evaluations')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    assigned_at = models.DateTimeField(auto_now_add=True)
    printed_at = models.DateTimeField(blank=True, null=True)
    started_at = models.DateTimeField(blank=True, null=True)
    submitted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Assigned #{self.id} -> {self.student} / {self.supervisor}"


# ------------------------------
# FINAL EVALUATION (التقييم النهائي)
# ------------------------------
class Evaluation(models.Model):
    assigned_evaluation = models.OneToOneField(
        AssignedEvaluation, on_delete=models.CASCADE, related_name="evaluation"
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="evaluations")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="evaluations")
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="evaluations")

    result = models.CharField(max_length=20, choices=[
        ("competent", "جدير"),
        ("not_competent", "غير جدير"),
    ])

    notes = models.TextField(blank=True, null=True)
    date = models.DateField(auto_now_add=True)
    repeat_date = models.DateField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=[
        ("submitted", "مُسلّم من المشرف"),
        ("delivered", "اتسلّم للمدرسة"),
    ], default="submitted")

    def __str__(self):
        return f"Evaluation for {self.student}"


# ------------------------------
# TRAINING DAY (اليوم التدريبي)
# ------------------------------
class TrainingDay(models.Model):
    DAY_TYPE_CHOICES = [
        ('study', 'يوم دراسي'),
        ('official_holiday', 'إجازة رسمية'),
        ('training', 'تدريب في الشركة'),
        ('closed', 'اليوم مغلق'),
    ]

    date = models.DateField(unique=True)
    day_type = models.CharField(max_length=20, choices=DAY_TYPE_CHOICES, default='training')

    def __str__(self):
        return f"{self.date} - {self.get_day_type_display()}"


# ------------------------------
# ATTENDANCE RECORD (غياب الطالب)
# ------------------------------
class AttendanceRecord(models.Model):
    ATTENDANCE_CHOICES = [
        ('present', 'حاضر'),
        ('absent', 'غايب'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='attendance_records')

    date = models.DateField()
    status = models.CharField(max_length=10, choices=ATTENDANCE_CHOICES, default='present')

    reason = models.CharField(max_length=255, blank=True, null=True)
    recorded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='attendance_created'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.get_status_display()}"
