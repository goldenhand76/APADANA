from django.test import Client
from django.test import TestCase

c = Client()


class LoginTestCase(TestCase):

    def test_leo_login(self):
        """Leo User is correctly identified"""
        response = c.post('/auth/login/', {'username': 'leo', 'password': 'Thereisnoway97'})
        print(response)