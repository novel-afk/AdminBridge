from django.db import migrations

class Migration(migrations.Migration):
    dependencies = [
        ('api', '0011_activitylog'),
    ]
    operations = [
        migrations.RemoveField(
            model_name='student',
            name='comments',
        ),
    ] 