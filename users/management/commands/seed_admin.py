from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create default admin user"

    def handle(self, *args, **kwargs):
        User = get_user_model()

        email = "admin@system.com"
        username = "admin"
        password = "123456"

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING("Admin already exists"))
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f"Admin created: {email}"))
