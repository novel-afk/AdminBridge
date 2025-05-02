# AdminBridge Backend

The backend API for the AdminBridge application built with Django and Django REST Framework.

## Local Development Setup

1. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

4. Run the development server:
   ```bash
   python manage.py runserver
   ```

## Deployment on Railway.app

1. Create a Railway account at [Railway.app](https://railway.app)

2. Create a new project from GitHub repository

3. Add a PostgreSQL database from the Railway dashboard

4. Set environment variables in Railway dashboard:
   - `DEBUG`: False
   - `ALLOWED_HOSTS`: your-app.railway.app
   - `SECRET_KEY`: your-secret-key

5. Deploy your application

## API Endpoints

- API Root: `http://localhost:8000/api/` or `https://your-app.railway.app/api/`
- Tasks API: `http://localhost:8000/api/tasks/` or `https://your-app.railway.app/api/tasks/`
- Admin Interface: `http://localhost:8000/admin/` or `https://your-app.railway.app/admin/`

## Technologies Used

- Django 5.0.3
- Django REST Framework 3.14.0
- Django CORS Headers 4.3.1
- PostgreSQL (on Railway.app)
- Gunicorn for production server
- WhiteNoise for static file serving 