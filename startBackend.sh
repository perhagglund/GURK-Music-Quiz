screen -S backend bash -c "source ./venv/bin/activate; python manage.py migrate; python manage.py runserver"
