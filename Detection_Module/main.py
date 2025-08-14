# main.py
import cv2
from src.ppe_detector import PPEDetector
from utils.alert import AlertManager
from dotenv import load_dotenv
import os

load_dotenv()

IP_CAMERA_URL = os.getenv("IP_CAMERA_URL")
# Setup
MODEL_PATH = "Detection_Module/weights/sh17_yolov8.pt"  
ALLOWED_CLASSES = [
    "helmet", "vest", "gloves","shoes", "mask",
    "no_helmet", "no_vest", "no_mask"
]

detector = PPEDetector(MODEL_PATH, ALLOWED_CLASSES)
alerter = AlertManager()



cap = cv2.VideoCapture(0)


print("🚨 Starting real-time detection...")
while True:
    ret, frame = cap.read()
    if not ret:
        break

    detections = detector.detect(frame)
    annotated_frame, should_stop = alerter.process_detections(frame, detections)
    cv2.imshow("SafeVision PPE Detection", annotated_frame)


    if should_stop or cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

