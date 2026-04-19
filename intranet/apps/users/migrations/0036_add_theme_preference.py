# Generated manually for theme preference field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0035_auto_20200810_1547'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdarkmodeproperties',
            name='theme_preference',
            field=models.CharField(
                choices=[
                    ('light', 'Light Theme'),
                    ('dark', 'Dark Theme'),
                    ('dark_improved', 'Improved Dark'),
                ],
                default='light',
                help_text="User's preferred theme",
                max_length=20,
            ),
        ),
    ]