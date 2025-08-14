# import serial

class ArduinoController:
    def __init__(self, port="COM3", baud=9600):
        try:
            # self.arduino = serial.Serial(port, baud, timeout=1)
            print("✅ Arduino connected on", port)
        except Exception as e:
            print("❌ Arduino connection failed:", e)
            self.arduino = None

    def send_signal(self, message):
        if self.arduino and self.arduino.is_open:
            try:
                self.arduino.write((message + "\n").encode())
            except Exception as e:
                print("⚠️ Arduino write failed:", e)
