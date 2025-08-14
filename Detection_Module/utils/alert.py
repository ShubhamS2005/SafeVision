import cv2
from collections import deque
from datetime import datetime
import os
import csv
import pyautogui
import numpy as np
import pygame
# from utils.arduino_control import ArduinoController ardinuo
import requests
import random
import hashlib
import time
from utils.cloudinary import PPEViolationUploader



REQUIRED_PPE = {"helmet", "gloves", "shoes"}
BUFFER_SIZE = 7


class AlertManager:
    def __init__(self, buffer_size=BUFFER_SIZE):
        self.frame_buffer = deque(maxlen=buffer_size)
        self.log_dir = "Detection_Module/output/alerts"
        self.csv_log = "Detection_Module/output/final_alert_log.csv"
        os.makedirs(self.log_dir, exist_ok=True)
        self.logged = False
        self.buffer_size = buffer_size

        if not os.path.exists(self.csv_log) or os.path.getsize(self.csv_log) == 0:
            with open(self.csv_log, "w", newline="") as f:
                csv.writer(f).writerow(["Timestamp", "Result", "Snapshot"])
        
        pygame.mixer.init()
        self.success_sound_path = "Detection_Module/assets/success.mp3"    
        self.violation_sound_path = "Detection_Module/assets/warning.mp3"
        

        # self.arduino = ArduinoController("COM3")

    def process_detections(self, frame, detections):
        ppe_present = {det["class"] for det in detections}
        full_compliance = REQUIRED_PPE.issubset(ppe_present)
        self.frame_buffer.append((frame.copy(), full_compliance, ppe_present))

        status_text = "✅ All PPE Worn - Safe to Proceed" if full_compliance else "⚠️ PPE Missing - Monitoring..."
        status_color = (0, 255, 0) if full_compliance else (0, 0, 255)
        cv2.putText(frame, status_text, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, status_color, 2)

        for det in detections:
            x1, y1, x2, y2 = det["bbox"]
            label = f"{det['class']} {det['confidence']:.2f}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 255), 2)
            cv2.putText(frame, label, (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

        if len(self.frame_buffer) == self.buffer_size and not self.logged:
            if any(full for _, full, _ in self.frame_buffer):
                self._play_sound(self.success_sound_path)
                self.show_success_screen()
                self.log_result("Safe", "")
                return frame, True
            else:
                # All frames show violation, pick first frame for saving
                frame_to_save, _, present = self.frame_buffer[0]
                missing = REQUIRED_PPE - present
                path = self.send_alert(frame_to_save, present)
        
                self.show_violation_screen()
                self.log_result("Violation", path)
        
                uploader=PPEViolationUploader()
                uploader.send_log_to_dashboard(missing_ppe=missing, snapshot_path=path)
        
                return frame, True
        
        
        return frame, False
    


    def _play_sound(self, path):
        try:
            pygame.mixer.music.load(path)
            pygame.mixer.music.play()
        except Exception as e:
            print(f"⚠️ Sound playback failed: {e}")


    def send_alert(self, frame, ppe_present):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = os.path.join(self.log_dir, f"violation_{timestamp}.jpg")
        cv2.imwrite(path, frame)
        missing = REQUIRED_PPE - ppe_present
        print(f"🚨 PPE Violation Detected! Missing: {', '.join(missing)}")
        try:
            pyautogui.alert("🚨 PPE Violation Detected at Gate!")
            self._play_sound(self.violation_sound_path)

        except Exception:
            pass
        return path

    def show_success_screen(self):
        canvas = 255 * np.ones((800, 1280, 3), dtype=np.uint8)
        canvas[:] = (200, 255, 200)  # light green background

        message = "✅ All PPE Worn\nAccess Granted"
        self._show_message_screen("Status", message, (0, 150, 0))

        # self.arduino.send_signal("SAFE")


    def show_violation_screen(self):
        canvas = 255 * np.ones((800, 1280, 3), dtype=np.uint8)
        canvas[:] = (255, 220, 220)  

        message = "🚨 PPE Violation\nAccess Denied"
        self._show_message_screen("Status", message, (0, 0, 255))

        # self.arduino.send_signal("VIOLATION")


    def _show_message_screen(self, winname, message, text_color):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        canvas = 255 * np.ones((800, 1280, 3), dtype=np.uint8)
        lines = message.split("\n")

        font = cv2.FONT_HERSHEY_SIMPLEX
        scale = 2
        thickness = 5
        line_height = 100

        for i, line in enumerate(lines):
            textsize = cv2.getTextSize(line, font, scale, thickness)[0]
            x = (canvas.shape[1] - textsize[0]) // 2
            y = 200 + i * line_height
            cv2.putText(canvas, line, (x, y), font, scale, text_color, thickness)

        cv2.rectangle(canvas, (50, 50), (1230, 750), (0, 0, 0), 10)
        cv2.putText(canvas, timestamp, (950, 50), font, 0.8, (80, 80, 80), 2)

        cv2.namedWindow(winname, cv2.WINDOW_NORMAL)
        cv2.setWindowProperty(winname, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
        cv2.imshow(winname, canvas)
        cv2.waitKey(3000)
        cv2.destroyWindow(winname)
        self.logged = True



    def log_result(self, result, path):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.csv_log, "a", newline="") as f:
            csv.writer(f).writerow([timestamp, result, path])


    

    