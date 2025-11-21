from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Count
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
from .models import Notification # أضف Notification للقائمة
from .serializers import NotificationSerializer, ChangePasswordSerializer # أضفهم للقائمة

from .models import (
    Company, Student, Visit, EvaluationRequest, 
    AssignedEvaluation, Evaluation, TrainingDay, 
    AttendanceRecord, SystemLog
)
from .serializers import (
    UserSerializer,
    CompanySerializer,
    StudentSerializer,
    VisitSerializer,
    EvaluationRequestSerializer,
    AssignedEvaluationSerializer,
    EvaluationSerializer,
    TrainingDaySerializer,
    AttendanceRecordSerializer,
    SystemLogSerializer
)

# استيراد ملف الصلاحيات الجديد
from .permissions import IsAdmin, IsManager, IsSupervisor, IsInstitution

User = get_user_model()

# ==============================
# 🔧 HELPER: SYSTEM LOGS
# ==============================
def log_action(user, action, details):
    if user and user.is_authenticated:
        SystemLog.objects.create(user=user, action=action, details=details)


# ==============================
# 📊 DASHBOARD & REPORTS (للإدارة فقط)
# ==============================
@api_view(['GET'])
@permission_classes([IsManager])  # المديرين والأدمن فقط
def dashboard_stats(request):
    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='active').count()
    total_companies = Company.objects.count()
    completed_evaluations = Evaluation.objects.count()
    pending_visits = Visit.objects.filter(status='pending').count()
    
    today = datetime.now().date()
    attendance_today = AttendanceRecord.objects.filter(date=today)
    
    return Response({
        "students": {"total": total_students, "active": active_students},
        "companies": {"total": total_companies},
        "evaluations": {"total_completed": completed_evaluations},
        "visits": {"pending": pending_visits},
        "attendance_today": {
            "present": attendance_today.filter(status='present').count(),
            "absent": attendance_today.filter(status='absent').count()
        }
    })


@api_view(['GET'])
@permission_classes([IsAdmin])  # الأدمن فقط يرى السجلات الحساسة
def system_logs_list(request):
    logs = SystemLog.objects.all().order_by('-timestamp')[:100]
    serializer = SystemLogSerializer(logs, many=True)
    return Response(serializer.data)


# ==============================
# 👥 USERS CRUD (للأدمن فقط)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsAdmin])  # لا أحد يضيف مستخدمين غير الأدمن
def users_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        log_action(request.user, 'ADD', f"إضافة مستخدم: {user.username}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def send_notification(user, title, message):
    """دالة مساعدة لإرسال إشعار لمستخدم معين"""
    if user:
        Notification.objects.create(user=user, title=title, message=message)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdmin])
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        return Response(UserSerializer(user).data)

    if request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, 'UPDATE', f"تحديث مستخدم: {user.username}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    log_action(request.user, 'DELETE', f"حذف مستخدم: {user.username}")
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 🏢 COMPANIES CRUD (للمديرين)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsManager])
def companies_list(request):
    if request.method == 'GET':
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    serializer = CompanySerializer(data=request.data)
    if serializer.is_valid():
        obj = serializer.save()
        log_action(request.user, 'ADD', f"إضافة مؤسسة: {obj.name}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsManager])
def company_detail(request, pk):
    company = get_object_or_404(Company, pk=pk)
    if request.method == 'GET':
        return Response(CompanySerializer(company).data)
    if request.method == 'PUT':
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, 'UPDATE', f"تحديث مؤسسة: {company.name}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    company.delete()
    log_action(request.user, 'DELETE', f"حذف مؤسسة: {company.name}")
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 🎓 STUDENTS CRUD (للمديرين والمشرفين - قراءة فقط للمشرف)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsSupervisor]) # المشرف يمكنه رؤية الطلاب
def students_list(request):
    if request.method == 'GET':
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    # فقط المدير أو الأدمن يضيف طالب (فحص يدوي للصلاحية هنا)
    if request.user.role not in ['admin', 'manager']:
        return Response({"error": "ليس لديك صلاحية لإضافة طالب"}, status=403)

    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        obj = serializer.save()
        log_action(request.user, 'ADD', f"إضافة طالب: {obj.name}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsSupervisor])
def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)
    
    if request.method == 'GET':
        return Response(StudentSerializer(student).data)

    # تعديل وحذف: للمدير فقط
    if request.user.role not in ['admin', 'manager']:
        return Response({"error": "ليس لديك صلاحية للتعديل أو الحذف"}, status=403)

    if request.method == 'PUT':
        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, 'UPDATE', f"تحديث طالب: {student.name}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    student.delete()
    log_action(request.user, 'DELETE', f"حذف طالب: {student.name}")
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 🚶 VISITS CRUD (للمشرفين)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsSupervisor])
def visits_list(request):
    if request.method == 'GET':
        visits = Visit.objects.all().order_by('-visit_date')
        if request.user.role == 'supervisor':
            # المشرف يرى زياراته فقط
            visits = visits.filter(supervisor=request.user)
        
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data)

    serializer = VisitSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        log_action(request.user, 'ADD', "تسجيل زيارة جديدة")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsSupervisor])
def visit_detail(request, pk):
    visit = get_object_or_404(Visit, pk=pk)
    
    # المشرف لا يرى زيارات غيره
    if request.user.role == 'supervisor' and visit.supervisor != request.user:
        return Response({"error": "غير مصرح لك برؤية هذه الزيارة"}, status=403)

    if request.method == 'GET':
        return Response(VisitSerializer(visit).data)

    if request.method == 'PUT':
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, 'UPDATE', f"تحديث زيارة رقم: {pk}")
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        # المشرف لا يحذف الزيارات، فقط المدير
        if request.user.role == 'supervisor':
            return Response({"error": "لا يمكن للمشرف حذف الزيارات"}, status=403)
            
        visit.delete()
        log_action(request.user, 'DELETE', f"حذف زيارة رقم: {pk}")
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 📋 EVALUATION REQUESTS (الإدارة)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsManager])
def evaluation_requests_list(request):
    if request.method == 'GET':
        qs = EvaluationRequest.objects.all().order_by('-created_at')
        serializer = EvaluationRequestSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = EvaluationRequestSerializer(data=request.data)
    if serializer.is_valid():
        obj = serializer.save(issued_by=request.user)
        log_action(request.user, 'ADD', f"إنشاء طلب تقييم: {obj.title}")
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsManager])
def evaluation_request_detail(request, pk):
    req = get_object_or_404(EvaluationRequest, pk=pk)
    if request.method == 'GET':
        return Response(EvaluationRequestSerializer(req).data)
    
    if request.method == 'PUT':
        serializer = EvaluationRequestSerializer(req, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    req.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 🤝 ASSIGNED EVALUATIONS
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsManager])
def assigned_evaluations_list(request):
    qs = AssignedEvaluation.objects.all().order_by('-assigned_at')
    if request.method == 'GET':
        serializer = AssignedEvaluationSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = AssignedEvaluationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsManager])
def assigned_evaluation_detail(request, pk):
    assign = get_object_or_404(AssignedEvaluation, pk=pk)
    if request.method == 'GET':
        return Response(AssignedEvaluationSerializer(assign).data)
    if request.method == 'PUT':
        serializer = AssignedEvaluationSerializer(assign, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    assign.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# ⭐ FINAL EVALUATIONS (للمشرفين)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsSupervisor])
def evaluations_list(request):
    if request.method == 'GET':
        qs = Evaluation.objects.all().order_by('-date')
        if request.user.role == 'supervisor':
            qs = qs.filter(supervisor=request.user)
            
        serializer = EvaluationSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = EvaluationSerializer(data=request.data)
    if serializer.is_valid():
        if serializer.validated_data['result'] == "not_competent" and not serializer.validated_data.get('repeat_date'):
            return Response({"error": "يجب تحديد موعد إعادة للطالب غير الجدير"}, status=400)

        obj = serializer.save(supervisor=request.user) # ربط المشرف تلقائياً
        log_action(request.user, 'ADD', f"إضافة تقييم للطالب ID: {obj.student.id}")
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsSupervisor])
def evaluation_detail(request, pk):
    obj = get_object_or_404(Evaluation, pk=pk)

    if request.user.role == 'supervisor' and obj.supervisor != request.user:
        return Response({"error": "غير مصرح لك بتعديل هذا التقييم"}, status=403)

    if request.method == 'GET':
        return Response(EvaluationSerializer(obj).data)

    if request.method == 'PUT':
        serializer = EvaluationSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_action(request.user, 'UPDATE', f"تعديل تقييم رقم: {pk}")
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    # المشرف لا يحذف التقييمات النهائية، فقط المدير
    if request.user.role == 'supervisor':
        return Response({"error": "لا يمكن حذف التقييم بعد اعتماده"}, status=403)

    obj.delete()
    return Response(status=204)


# ==============================
# 📅 TRAINING DAYS
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsManager])
def training_days_list(request):
    if request.method == 'GET':
        days = TrainingDay.objects.all().order_by('-date')
        serializer = TrainingDaySerializer(days, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = TrainingDaySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsManager])
def training_day_detail(request, pk):
    day = get_object_or_404(TrainingDay, pk=pk)
    if request.method == 'GET':
        return Response(TrainingDaySerializer(day).data)
    if request.method == 'PUT':
        serializer = TrainingDaySerializer(day, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    day.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 📝 ATTENDANCE API (مشرفين + مؤسسات)
# ==============================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated]) # سنفحص الدور في الداخل
def attendance_list(request):
    # السماح للمشرفين، المديرين، والمؤسسات
    if request.user.role not in ['admin', 'manager', 'supervisor', 'institution']:
        return Response({"error": "غير مصرح"}, status=403)

    if request.method == 'GET':
        qs = AttendanceRecord.objects.all().order_by('-date')
        
        # المؤسسة ترى طلابها فقط (سنحتاج ربط المستخدم بالمؤسسة لاحقاً بشكل أفضل)
        # حالياً، سنفترض أن المؤسسة ترسل الـ ID الخاص بها للفلترة، أو نعتمد على الأدمن
        
        serializer = AttendanceRecordSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = AttendanceRecordSerializer(data=request.data)
        if serializer.is_valid():
            obj = serializer.save(recorded_by=request.user)
            log_action(request.user, 'ADD', f"تسجيل غياب/حضور للطالب: {obj.student.id}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def attendance_detail(request, pk):
    record = get_object_or_404(AttendanceRecord, pk=pk)
    if request.method == 'GET':
        return Response(AttendanceRecordSerializer(record).data)
    if request.method == 'PUT':
        serializer = AttendanceRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    if request.user.role not in ['admin', 'manager']:
         return Response({"error": "غير مصرح بالحذف"}, status=403)
         
    record.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# 📈 ATTENDANCE REPORT
# ==============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def attendance_report(request):
    report_type = request.query_params.get('type')
    if report_type not in ['daily', 'weekly', 'monthly']:
        return Response({"error": "Invalid type"}, status=400)

    qs = AttendanceRecord.objects.all()
    date_range = ""

    if report_type == 'daily':
        date = request.query_params.get('date')
        if not date: return Response({"error": "date required"}, status=400)
        target_date = parse_date(date)
        qs = qs.filter(date=target_date)
        date_range = f"اليوم: {target_date}"

    elif report_type == 'weekly':
        week_code = request.query_params.get('week')
        if not week_code: return Response({"error": "week required"}, status=400)
        year, week_num = week_code.split("-W")
        first_day = datetime.strptime(f'{year}-W{week_num}-1', "%Y-W%W-%w").date()
        last_day = first_day + timedelta(days=6)
        qs = qs.filter(date__range=[first_day, last_day])
        date_range = f"الأسبوع: {first_day} → {last_day}"

    elif report_type == 'monthly':
        month = request.query_params.get('month')
        if not month: return Response({"error": "month required"}, status=400)
        year, month_num = month.split("-")
        year, month_num = int(year), int(month_num)
        first_day = datetime(year, month_num, 1).date()
        if month_num == 12:
            last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            last_day = datetime(year, month_num + 1, 1).date() - timedelta(days=1)
        qs = qs.filter(date__range=[first_day, last_day])
        date_range = f"الشهر: {first_day} → {last_day}"

    total_records = qs.count()
    present_count = qs.filter(status="present").count()
    
    attendance_rate = 0
    if total_records > 0:
        attendance_rate = round((present_count / total_records) * 100, 2)

    return Response({
        "total_records": total_records,
        "present": present_count,
        "attendance_rate": attendance_rate,
        "date_range": date_range,
        "records": AttendanceRecordSerializer(qs, many=True).data
    })

# ==============================
# 🔔 NOTIFICATIONS API
# ==============================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """جلب إشعارات المستخدم الحالي"""
    qs = Notification.objects.filter(user=request.user).order_by('-created_at')
    # يمكن إضافة فلتر لجلب غير المقروءة فقط
    if request.query_params.get('unread') == 'true':
        qs = qs.filter(is_read=False)
        
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):
    """تحديد الإشعار كمقروء"""
    notif = get_object_or_404(Notification, pk=pk)
    if notif.user != request.user:
        return Response({"error": "ليس لديك صلاحية"}, status=403)
    
    notif.is_read = True
    notif.save()
    return Response({"status": "success"})


# ==============================
# 🔐 AUTH & PASSWORD
# ==============================
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """تغيير كلمة المرور"""
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)

    if serializer.is_valid():
        if not user.check_password(serializer.data.get("old_password")):
            return Response({"error": "كلمة المرور القديمة غير صحيحة"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.data.get("new_password"))
        user.save()
        log_action(user, 'UPDATE', "تم تغيير كلمة المرور")
        return Response({"status": "تم تغيير كلمة المرور بنجاح"}, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)    