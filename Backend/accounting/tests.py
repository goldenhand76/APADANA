from django.test import TestCase
from authentication.models import User, Organization
import requests
import json


class AddUserTestCase(TestCase):

    def setUp(self):
        self.login_url = 'http://test.angizehco.com/api/auth/login/'
        self.list_user_url = 'http://test.angizehco.com/api/accounting/list-user/'
        self.add_user_url = 'http://test.angizehco.com/api/accounting/add-user/'
        self.login_data = {'username': 'leo', 'password': 'Goldenhand76'}
        self.update_headers()

    def update_headers(self):
        user = requests.post(self.login_url, self.login_data)
        response = json.loads(user.content)
        self.access = response['tokens']['access']
        self.headers = {'Authorization': f'Bearer {self.access}'}

    def test_add_user(self):
        data = {'name': 'x',
                'last_name': 'y',
                'phone': '09521235687',
                'username': 'testtttt',
                'password': 'Goldenhand76',
                'email': 'testtttt@gmail.com'}
        re = requests.post(self.add_user_url, data=data, headers=self.headers)
        print(re.content)

    def test_list_users(self):
        re = requests.get(self.list_user_url, headers=self.headers)
        print(re.content)
