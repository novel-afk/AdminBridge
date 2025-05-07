from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0012_add_student_resume'),
    ]
    operations = [
        migrations.RemoveField(
            model_name='student',
            name='comments',
        ),
    ] 