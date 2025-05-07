from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_activitylog'),
    ]

    operations = [
        migrations.AddField(
            model_name='student',
            name='resume',
            field=models.FileField(blank=True, help_text='Upload CV/Resume (PDF only)', null=True, upload_to='student_resumes/'),
        ),
    ] 