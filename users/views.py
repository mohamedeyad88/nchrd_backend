from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import Company, Student, Visit, EvaluationRequest, AssignedEvaluation
from .serializers import (
    UserSerializer,
    CompanySerializer,
    StudentSerializer,
    VisitSerializer,
    EvaluationRequestSerializer,
    AssignedEvaluationSerializer
)

User = get_user_model()


# ==============================
# USERS CRUD
# ==============================
@api_view(['GET', 'POST'])
def users_list(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, pk):
    user = get_object_or_404(User, pk=pk)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# COMPANIES CRUD
# ==============================
@api_view(['GET', 'POST'])
def companies_list(request):
    if request.method == 'GET':
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    serializer = CompanySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def company_detail(request, pk):
    company = get_object_or_404(Company, pk=pk)

    if request.method == 'GET':
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    company.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# STUDENTS CRUD
# ==============================
@api_view(['GET', 'POST'])
def students_list(request):
    if request.method == 'GET':
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response(serializer.data)

    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def student_detail(request, pk):
    student = get_object_or_404(Student, pk=pk)

    if request.method == 'GET':
        serializer = StudentSerializer(student)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = StudentSerializer(student, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    student.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# VISITS CRUD
# ==============================
@api_view(['GET', 'POST'])
def visits_list(request):
    if request.method == 'GET':
        visits = Visit.objects.all()
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data)

    serializer = VisitSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def visit_detail(request, pk):
    visit = get_object_or_404(Visit, pk=pk)

    if request.method == 'GET':
        serializer = VisitSerializer(visit)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = VisitSerializer(visit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    visit.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# EVALUATION REQUESTS (الإدارة المركزية)
# ==============================
@api_view(['GET', 'POST'])
def evaluation_requests_list(request):
    if request.method == 'GET':
        qs = EvaluationRequest.objects.all().order_by('-created_at')
        serializer = EvaluationRequestSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = EvaluationRequestSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()  
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def evaluation_request_detail(request, pk):
    req = get_object_or_404(EvaluationRequest, pk=pk)

    if request.method == 'GET':
        serializer = EvaluationRequestSerializer(req)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = EvaluationRequestSerializer(req, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    req.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# ASSIGNED EVALUATIONS (توزيع المهام)
# ==============================
@api_view(['GET', 'POST'])
def assigned_evaluations_list(request):

    qs = AssignedEvaluation.objects.all().order_by('-assigned_at')

    supervisor = request.query_params.get("supervisor")
    status_q = request.query_params.get("status")

    if supervisor:
        qs = qs.filter(supervisor_id=supervisor)
    if status_q:
        qs = qs.filter(status=status_q)

    if request.method == 'GET':
        serializer = AssignedEvaluationSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = AssignedEvaluationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def assigned_evaluation_detail(request, pk):
    assign = get_object_or_404(AssignedEvaluation, pk=pk)

    if request.method == 'GET':
        serializer = AssignedEvaluationSerializer(assign)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = AssignedEvaluationSerializer(assign, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    assign.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


    # ==============================
# EVALUATION (نتيجة التقييم)
# ==============================
@api_view(['GET', 'POST'])
def evaluations_list(request):
    if request.method == 'GET':
        qs = Evaluation.objects.all().order_by('-date')
        serializer = EvaluationSerializer(qs, many=True)
        return Response(serializer.data)

    serializer = EvaluationSerializer(data=request.data)
    if serializer.is_valid():
        # Rule: لو النتيجة "غير جدير" لازم repeat_date
        if serializer.validated_data['result'] == "not_competent" and not serializer.validated_data.get('repeat_date'):
            return Response({"error": "يجب تحديد موعد إعادة للطالب غير الجدير"}, status=400)

        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
def evaluation_detail(request, pk):
    obj = get_object_or_404(Evaluation, pk=pk)

    if request.method == 'GET':
        return Response(EvaluationSerializer(obj).data)

    if request.method == 'PUT':
        serializer = EvaluationSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    obj.delete()
    return Response(status=204)


# ==============================
# TRAINING DAY API
# ==============================

@api_view(['GET', 'POST'])
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
def training_day_detail(request, pk):
    day = get_object_or_404(TrainingDay, pk=pk)

    if request.method == 'GET':
        serializer = TrainingDaySerializer(day)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = TrainingDaySerializer(day, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        day.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ==============================
# ATTENDANCE API
# ==============================

@api_view(['GET', 'POST'])
def attendance_list(request):
    if request.method == 'GET':
        qs = AttendanceRecord.objects.all().order_by('-date')
        
        # فلترة
        student_id = request.query_params.get('student')
        company_id = request.query_params.get('company')
        date = request.query_params.get('date')

        if student_id:
            qs = qs.filter(student_id=student_id)
        if company_id:
            qs = qs.filter(company_id=company_id)
        if date:
            qs = qs.filter(date=date)

        serializer = AttendanceRecordSerializer(qs, many=True)
        return Response(serializer.data)

    if request.method == 'POST':
        serializer = AttendanceRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def attendance_detail(request, pk):
    record = get_object_or_404(AttendanceRecord, pk=pk)

    if request.method == 'GET':
        serializer = AttendanceRecordSerializer(record)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = AttendanceRecordSerializer(record, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        record.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
from django.db.models import Q

# ==============================
# ATTENDANCE REPORT API
# ==============================

@api_view(['GET'])
def attendance_report(request):

    report_type = request.query_params.get('type')

    if report_type not in ['daily', 'weekly', 'monthly']:
        return Response({"error": "Invalid type. Use daily, weekly, or monthly"}, status=400)

    # ========================
    # DAILY REPORT
    # ========================
    if report_type == 'daily':
        date = request.query_params.get('date')
        if not date:
            return Response({"error": "date is required"}, status=400)

        target_date = parse_date(date)
        qs = AttendanceRecord.objects.filter(date=target_date)

        date_range = f"اليوم: {target_date}"

    # ========================
    # WEEKLY REPORT
    # ========================
    elif report_type == 'weekly':
        week_code = request.query_params.get('week')  # format: 2025-W03
        if not week_code:
            return Response({"error": "week is required"}, status=400)

        year, week_num = week_code.split("-W")
        year = int(year)
        week_num = int(week_num)

        # أول يوم في الأسبوع
        first_day = datetime.strptime(f'{year}-W{week_num}-1', "%Y-W%W-%w").date()
        last_day = first_day + timedelta(days=6)

        qs = AttendanceRecord.objects.filter(date__range=[first_day, last_day])

        date_range = f"الأسبوع: {first_day} → {last_day}"

    # ========================
    # MONTHLY REPORT
    # ========================
    elif report_type == 'monthly':
        month = request.query_params.get('month')  # format: 2025-01
        if not month:
            return Response({"error": "month is required"}, status=400)

        year, month_num = month.split("-")
        year = int(year)
        month_num = int(month_num)

        first_day = datetime(year, month_num, 1).date()
        if month_num == 12:
            last_day = datetime(year + 1, 1, 1).date() - timedelta(days=1)
        else:
            last_day = datetime(year, month_num + 1, 1).date() - timedelta(days=1)

        qs = AttendanceRecord.objects.filter(date__range=[first_day, last_day])

        date_range = f"الشهر: {first_day} → {last_day}"

    # ========================
    # CALCULATE STATS
    # ========================

    total_records = qs.count()

    absent_without = qs.filter(status="absent", reason__isnull=True).count()
    absent_with = qs.filter(status="absent", reason__isnull=False).count()
    present = qs.filter(status="present").count()

    total_students = qs.values('student').distinct().count()

    attendance_rate = 0
    if total_records > 0:
        attendance_rate = round((present / total_records) * 100, 2)

    # Serialize records
    records_data = AttendanceRecordSerializer(qs, many=True).data

    report = {
        "total_students": total_students,
        "total_records": total_records,
        "present": present,
        "absent": absent_without + absent_with,
        "absent_with_reason": absent_with,
        "absent_without_reason": absent_without,
        "attendance_rate": attendance_rate,
        "date_range": date_range,
        "records": records_data,
    }

    return Response(report)

