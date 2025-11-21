from django.urls import path
from . import views

urlpatterns = [
    # Users
    path('list/', views.users_list),
    path('<int:pk>/', views.user_detail),

    # Companies
    path('companies/', views.companies_list),
    path('companies/<int:pk>/', views.company_detail),

    # Students
    path('students/', views.students_list),
    path('students/<int:pk>/', views.student_detail),

    # Visits
    path('visits/', views.visits_list),
    path('visits/<int:pk>/', views.visit_detail),

    # Evaluation Requests (الإدارة المركزية)
    path('evaluation-requests/', views.evaluation_requests_list),
    path('evaluation-requests/<int:pk>/', views.evaluation_request_detail),

    # Assigned Evaluations (توزيع المدير)
    path('assigned-evaluations/', views.assigned_evaluations_list),
    path('assigned-evaluations/<int:pk>/', views.assigned_evaluation_detail),

    # Evaluations (تقييم المشرف)
    path('evaluations/', views.evaluations_list),
    path('evaluations/<int:pk>/', views.evaluation_detail),

    # TRAINING DAYS
path('training-days/', training_days_list),
path('training-days/<int:pk>/', training_day_detail),

# ATTENDANCE
path('attendance/', attendance_list),
path('attendance/<int:pk>/', attendance_detail),

path('attendance-report/', attendance_report),


]
