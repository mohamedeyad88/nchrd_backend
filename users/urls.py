from django.urls import path
from . import views

urlpatterns = [
    # Dashboard & Logs (تأكد أن هذا السطر موجود)
    path('dashboard/', views.dashboard_stats),
    path('logs/', views.system_logs_list),

    # Users
    path('users/', views.users_list),
    path('users/<int:pk>/', views.user_detail),

    # Companies
    path('companies/', views.companies_list),
    path('companies/<int:pk>/', views.company_detail),

    # Students
    path('students/', views.students_list),
    path('students/<int:pk>/', views.student_detail),

    # Visits
    path('visits/', views.visits_list),
    path('visits/<int:pk>/', views.visit_detail),

    # Evaluation Requests
    path('evaluation-requests/', views.evaluation_requests_list),
    path('evaluation-requests/<int:pk>/', views.evaluation_request_detail),

    # Assigned Evaluations
    path('assigned-evaluations/', views.assigned_evaluations_list),
    path('assigned-evaluations/<int:pk>/', views.assigned_evaluation_detail),

    # Evaluations
    path('evaluations/', views.evaluations_list),
    path('evaluations/<int:pk>/', views.evaluation_detail),

    # Training Days
    path('training-days/', views.training_days_list),
    path('training-days/<int:pk>/', views.training_day_detail),

    # Attendance
    path('attendance/', views.attendance_list),
    path('attendance/<int:pk>/', views.attendance_detail),
    path('attendance-report/', views.attendance_report),
    
    # Notifications
    path('notifications/', views.notifications_list),
    path('notifications/<int:pk>/read/', views.mark_notification_read),

    # Security
    path('change-password/', views.change_password),
]