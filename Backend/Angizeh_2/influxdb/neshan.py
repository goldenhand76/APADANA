import requests

result = requests.get("https://api.neshan.org/v5/reverse?lat=35.9669307&lng=59.3360585", headers={"Api-Key": "service.3ba09e320ed6436fabd187bfef2463d4"})
print(result.text)