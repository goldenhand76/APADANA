from django.core.mail import EmailMultiAlternatives, send_mail
import requests
import os
from pathlib import Path
import geoip2.database

BASE_DIR = Path(__file__).resolve().parent.parent


class Util:
    @staticmethod
    def send_email(data):
        email = EmailMultiAlternatives(
            data['email_subject'],
            data['plain_message'],
            from_email="support@angizehco.com",
            to=[data['to_email']])
        email.attach_alternative(data["html_message"], "text/html")
        email.send()

    @staticmethod
    def send_email_2(data):
        send_mail(
            data['email_subject'],
            data['email_body'],
            from_email="support@angizehco.com",
            recipient_list=data['to_email'])

    @staticmethod
    def send_sms(phone_number, link):

        data = '{"ParameterArray":[{'
        data += f'"Parameter": "content1", "ParameterValue": "بر روی لینک زیر کلیک نمایید :\n"' + '},'
        data += '{' + f' "Parameter": "content2", "ParameterValue": "{link[:50]}"' + '},'
        data += '{' + f' "Parameter": "content3", "ParameterValue": "{link[50:100]}"' + '},'
        data += '{' + f' "Parameter": "content4", "ParameterValue": "{link[100:150]}"' + '},'
        data += '{' + f' "Parameter": "content5", "ParameterValue": "{link[150:200]}"' + '},'
        data += '{' + f' "Parameter": "content6", "ParameterValue": "{link[200:250]}"' + '},'
        data += '{' + f' "Parameter": "content7", "ParameterValue": "{link[250:300]}"' + '},'
        data += '{' + f' "Parameter": "content8", "ParameterValue": "{link[300:350]}"' + '},'
        data += '{' + f' "Parameter": "content9", "ParameterValue": "{link[350:400]}"' + '},'
        data += '{' + f' "Parameter": "content10", "ParameterValue": "{link[400:]}"' + '},'
        data += f'], "Mobile":"{phone_number}", "TemplateId":"57702"' + '}'
        secret = {"UserApiKey": "b200f8976bca76bed79af897", "SecretKey": "kg9dQN2cHkVpMBxE"}
        sms = requests.request("POST", url="https://RestfulSms.com/api/Token", data=secret)
        token = sms.json()['TokenKey'].strip()
        headers = {'Content-Type': 'application/json', 'x-sms-ir-secure-token': token}
        response = requests.request("POST", url="https://RestfulSms.com/api/UltraFastSend", headers=headers,
                                    data=data.encode('utf-8'))
        return response

    def get_client_ip(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR', None)
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

    def get_client_location(ip):
        with geoip2.database.Reader(BASE_DIR / 'GeoLite2-Country.mmdb') as reader:
            response = reader.country(ip)
            city = response.country.iso_code
        return city
