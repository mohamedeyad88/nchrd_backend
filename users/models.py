from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

# ------------------------------
# 1. CUSTOM USER MODEL (المستخدمين والأدوار)
# ------------------------------
class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        BRANCH_MANAGER = 'manager', 'مدير فرع'
        SUPERVISOR = 'supervisor', 'مشرف'
        EMPLOYEE = 'employee', 'موظف'
        INSTITUTION = 'institution', 'مؤسسة تدريبية'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)
    phone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ------------------------------
# 3. COMPANY / INSTITUTION MODEL (المؤسسات)
# ------------------------------
class Company(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    training_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="نوع التدريب")
    supervisor_name = models.CharField(max_length=150, blank=True, null=True, verbose_name="المشرف بالمؤسسة")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def student_count(self):
        return self.students.count()


# ------------------------------
# 2. STUDENT MODEL (الطلاب + صور)
# ------------------------------
class Student(models.Model):
    STATUS_CHOICES = [
        ('active', 'نشط'),
        ('suspended', 'متوقف'),
        ('graduated', 'خريج'),
    ]

    name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=14, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # حقل صورة الطالب الجديد 📸
    personal_photo = models.ImageField(upload_to='students_photos/', blank=True, null=True, verbose_name="صورة الطالب")
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='students')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"


# ------------------------------
# 6. VISIT MODEL (الزيارات)
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
    notes = models.TextField(blank=True, null=True, verbose_name="البلاغات والملاحظات")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Visit - {self.company.name} - {self.student.name}"


# ------------------------------
# EVALUATION REQUEST (طلب التقييم)
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
        return f"Request: {self.title}"


# ------------------------------
# ASSIGNED EVALUATION (توزيع المهام)
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
        return f"Assigned #{self.id} -> {self.student}"


# ------------------------------
# 5. FINAL EVALUATION (التقييمات المفصلة)
# ------------------------------
class Evaluation(models.Model):
    assigned_evaluation = models.OneToOneField(
        AssignedEvaluation, on_delete=models.CASCADE, related_name="evaluation"
    )

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="evaluations")
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="evaluations")
    supervisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="evaluations")

    # المعايير التفصيلية
    punctuality = models.IntegerField(default=0, verbose_name="الالتزام بالمواعيد")
    behavior = models.IntegerField(default=0, verbose_name="السلوك")
    practical_skills = models.IntegerField(default=0, verbose_name="المهارات العملية")
    learning_level = models.IntegerField(default=0, verbose_name="مستوى التعلم")
    performance_quality = models.IntegerField(default=0, verbose_name="جودة الأداء")
    teamwork = models.IntegerField(default=0, verbose_name="العمل ضمن فريق")

    # النتيجة النهائية
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
# TRAINING DAY (أيام التدريب)
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
# 4. ATTENDANCE RECORD (الحضور + ملفات)
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

    reason = models.CharField(max_length=255, blank=True, null=True, verbose_name="سبب الغياب")
    is_excused = models.BooleanField(default=False, verbose_name="إثبات الغياب (بعذر)")
    
    # حقل ملف إثبات العذر الجديد 📁
    proof_file = models.FileField(upload_to='attendance_proofs/', blank=True, null=True, verbose_name="ملف إثبات العذر")
    
    recorded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='attendance_created'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.get_status_display()}"


# ------------------------------
# 10. SYSTEM LOGS (السجلات)
# ------------------------------
class SystemLog(models.Model):
    ACTION_TYPES = [
        ('ADD', 'إضافة'),
        ('UPDATE', 'تعديل'),
        ('DELETE', 'حذف'),
        ('LOGIN', 'تسجيل دخول'),
        ('LOGIN_FAILED', 'فشل دخول'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.timestamp}"


# ------------------------------
# 8. NOTIFICATIONS (الإشعارات)
# ------------------------------
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.username} - {self.title}"