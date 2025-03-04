from rest_framework.test import APIRequestFactory
from django.test import TestCase

class LoginTestCase(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    def test_leo_login(self):
        request = self.factory.post('/api/auth/login', {'username': 'leo', 'password': 'Goldenhand76'}) 
        print(request)