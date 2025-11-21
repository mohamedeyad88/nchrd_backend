from django.contrib import admin
from .models import (
    User, Company, Student, Visit, EvaluationRequest, 
    AssignedEvaluation, Evaluation, TrainingDay, 
    AttendanceRecord, SystemLog
)

admin.site.register(User)
admin.site.register(Company)
admin.site.register(Student)
admin.site.register(Visit)
admin.site.register(EvaluationRequest)
admin.site.register(AssignedEvaluation)
admin.site.register(Evaluation)
admin.site.register(TrainingDay)
admin.site.register(AttendanceRecord)
admin.site.register(SystemLog)