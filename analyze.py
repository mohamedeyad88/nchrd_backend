import os

TARGET_KEYWORDS = [
    "models.py", "views.py", "serializers.py", "urls.py",
    "permissions.py", "admin.py", "apps.py"
]

MODULES = ["attendance", "evaluations", "tasks", "activity", "students", "institutions"]

def analyze_project(path):
    print("=" * 60)
    print(f"🔍 Analyzing project at: {path}")
    print("=" * 60)

    found_modules = {m: False for m in MODULES}

    for root, dirs, files in os.walk(path):
        folder = os.path.basename(root)

        # Check if this folder is one of our modules
        if folder in found_modules:
            found_modules[folder] = True

        # Print folder name
        print(f"\n📁 Folder: {root}")

        # Print files inside
        for f in files:
            mark = "⭐" if f in TARGET_KEYWORDS else "  "
            print(f"   {mark} File: {f}")

    print("\n" + "-" * 60)
    print("📌 Module Existence Report")
    print("-" * 60)

    for module, exists in found_modules.items():
        status = "✔ موجود" if exists else "❌ مش موجود"
        print(f"   {module:15} → {status}")

    print("=" * 60)
    print("🔚 Analysis Finished")
    print("=" * 60)


# ================================
# 🔧 ضع مسار مشروعك هنا
# ================================
project_path = r"C:\path_to_project\nchrd_backend"

analyze_project(project_path)
