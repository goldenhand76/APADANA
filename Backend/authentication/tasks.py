import requests
from celery import shared_task
from celery.utils.log import get_task_logger

from .utils import Util

logger = get_task_logger(__name__)


@shared_task(name="send_verify_email")
def send_verify_email(data):
    logger.info("sent feedback email")
    return Util.send_email(data)


@shared_task(name="send_register_email")
def send_register_email(data):
    logger.info("sent register email")
    return Util.send_email_2(data)


@shared_task(name="send_verify_sms")
def send_verify_sms(phone, link):
    data = {'from': '50004001927031', 'to': [phone], 'text': link, 'udh': ''}
    response = requests.post('https://console.melipayamak.com/api/send/advanced/fe0dc37dac1c4ebebde2f5a49a54b5e2',
                             json=data)
    print(response.json())
