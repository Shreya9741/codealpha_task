# Connecta - CodeAlpha Social Media Platform

A simple professional mini social media application for CodeAlpha Task 2.

## Required technologies only
- HTML
- CSS
- JavaScript
- Django
- SQLite

No React, Node.js, Express.js, MongoDB, Bootstrap, Tailwind, Django REST Framework, or other third-party packages are required.

## Features
- User registration and login
- User profiles and bio
- Posts
- Comments
- Like/unlike
- Follow/unfollow
- Follower/following counts
- SQLite database
- Responsive interface

## Windows commands
Open Command Prompt in this folder:

python -m venv venv
venv\\Scripts\\activate
python -m pip install Django
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

Open http://127.0.0.1:8000/

If PowerShell blocks Activate.ps1, do not change security settings. Use:
venv\\Scripts\\python.exe -m pip install Django
venv\\Scripts\\python.exe manage.py makemigrations
venv\\Scripts\\python.exe manage.py migrate
venv\\Scripts\\python.exe manage.py runserver
