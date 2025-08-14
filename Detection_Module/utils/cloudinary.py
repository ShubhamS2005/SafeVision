import requests
import hashlib
import time
import random

from dotenv import load_dotenv
import os

load_dotenv()


CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
API_KEY = os.getenv("CLOUDINARY_API_KEY")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET")


CLOUDINARY_UPLOAD_URL = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload"


def generate_signature(params_to_sign, api_secret):
    sorted_params = sorted((k, v) for k, v in params_to_sign.items() if v)
    param_str = "&".join(f"{k}={v}" for k, v in sorted_params)
    to_sign = param_str + api_secret
    return hashlib.sha1(to_sign.encode("utf-8")).hexdigest()


class PPEViolationUploader:
    def send_log_to_dashboard(self, missing_ppe, snapshot_path, reported_by=None):
        try:
            zone = random.choice(["Zone A", "Zone B", "Zone C"])

            # 🔄 Normalize missing_ppe to a list
            if isinstance(missing_ppe, set):
                missing_ppe = list(missing_ppe)
            elif isinstance(missing_ppe, str):
                missing_ppe = [missing_ppe]
            elif not isinstance(missing_ppe, list):
                missing_ppe = [str(missing_ppe)]

            # 🖼 Prepare Cloudinary upload
            timestamp = int(time.time())
            public_id = f"ppe_snapshot_{timestamp}"

            params_to_sign = {
                "timestamp": timestamp,
                "public_id": public_id
            }
            signature = generate_signature(params_to_sign, API_SECRET)

            upload_params = {
                "timestamp": timestamp,
                "public_id": public_id,
                "api_key": API_KEY,
                "signature": signature
            }

            with open(snapshot_path, "rb") as image_file:
                cloud_response = requests.post(
                    CLOUDINARY_UPLOAD_URL,
                    files={"file": image_file},
                    data=upload_params
                )

            if cloud_response.status_code not in [200, 201]:
                print(f"❌ Cloudinary upload failed: {cloud_response.text}")
                return

            cloudinary_url = cloud_response.json().get("secure_url")
            if not cloudinary_url:
                print("❌ No URL returned from Cloudinary.")
                return

            # 📤 Send log to backend dashboard
            data = {
                "zone": zone,
                "ppeMissing": missing_ppe,
                "snapshotUrl": cloudinary_url
            }
            if reported_by:
                data["reportedBy"] = reported_by

            print(f"📤 Sending JSON: {data}")

            response = requests.post("http://localhost:8000/api/v1/log/report", json=data)

            if response.status_code in [200, 201]:
                print(f"✅ Sent log to dashboard for {zone}.")
            else:
                print(f"❌ Server responded with status {response.status_code}: {response.text}")

        except Exception as e:
            print(f"❌ Failed to send log: {e}")
