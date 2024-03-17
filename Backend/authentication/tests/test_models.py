from django.test import TestCase
from authentication.models import User


class LeoTestCase(TestCase):
    def setUp(self):
        """Set up the superuser account (leo)"""
        leo = User.objects.create(username="leo", phone="09391927031", is_superuser=True, is_admin=True)
        leo.set_password("Goldenhand76")

    def test_leo_is_exists(self):
        """Leo User is correctly identified"""
        leo = User.objects.filter(username="leo")
        self.assertEqual(leo.exists(), True),  "The user leo is not exists"
