FROM python:3.9.7-buster

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update \
    && apt-get -y install libpq-dev gcc \
    && pip install psycopg2 \
    && apt-get install -y netcat \
    && apt install gettext -y

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install flake8
RUN pip install pymemcache
RUN pip install djangorestframework==3.13.1
RUN pip install gunicorn
RUN pip install daphne

RUN apt-get update && apt-get install -y supervisor
RUN mkdir -p /var/log/supervisor
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

COPY ./ ./
RUN sed -i 's/\r$//g' /usr/src/app/entrypoint.sh # Delete unnecessery characters [\r$]
RUN chmod +x /usr/src/app/entrypoint.sh

RUN ls
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]
# CMD ["gunicorn", "Angizeh_2.wsgi:application", "--bind", "0.0.0.0:8000"]
CMD ["/usr/bin/supervisord"]



