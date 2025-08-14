#define GREEN_LED 6
#define RED_LED 5
#define BUZZER 3

void setup() {
  pinMode(GREEN_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  if (Serial.available()) {
    String msg = Serial.readStringUntil('\n');
    msg.trim();

    if (msg == "SAFE") {
      digitalWrite(GREEN_LED, HIGH);
      digitalWrite(RED_LED, LOW);
      digitalWrite(BUZZER, LOW);
    }
    else if (msg == "VIOLATION") {
      digitalWrite(GREEN_LED, LOW);
      digitalWrite(RED_LED, HIGH);
      tone(BUZZER, 1000);  // 1kHz buzzer
      delay(1000);
      noTone(BUZZER);
    }
  }
}
