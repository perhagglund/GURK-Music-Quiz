# GURK-Music-Quiz
Music quiz made by:


Lead backend developer: [Adam Beijar](https://github.com/adambeijar)
Lead frontend developer: [Per Hägglund](https://github.com/perhagglund)
Lead Graphics designer: Daniel Ehrngren

This is a game where you guess songs that are in reverse

how to start:
(If you are on windows you will need Ubuntu for windows to run the backend)

First you start a terminal (Ubuntu or other linux distro/macOS)
After that download redis (`apt-get install redis`)
Then run command `redis-server` to start redis server
Then open up a new terminal window
```setup backend
git clone https://github.com/GURK-Production/GURK-Music-Quiz
cd GURK-Music-Quiz
python3 -m venv ./venv
source /venv/bin/activate (for windows: /venv/Script/activate)
pip3 install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Then open up one more terminal window
```celery guide
python -m celery -A GURK-Music-Quiz -l info
```

We plan to take over the worlds