export const ARDUINO_CODE = `/**
 * ESP32 Chicken Coop Controller
 * 
 * Hardware:
 * - ESP32 DevKit V1
 * - LDR (Photoresistor) + 10k Resistor (Voltage Divider) on PIN 34
 * - 28BYJ-48 Stepper Motor + ULN2003 Driver on PINS 19, 18, 5, 17
 * - DC Motor (Feeder) on PIN 16 (via MOSFET/Transistor)
 * 
 * Libraries needed:
 * - AccelStepper (optional, or use custom sequence below)
 * - NTPClient (for time)
 * - WiFiUdp
 */

#include <WiFi.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <esp_sleep.h>

// --- CONFIGURATION ---
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// GPIO PINS
#define LDR_PIN 34          // Analog input for Light Sensor
#define FEEDER_PIN 16       // PWM/Digital pin for Feeder Motor
#define STEPPER_IN1 19
#define STEPPER_IN2 18
#define STEPPER_IN3 5
#define STEPPER_IN4 17

// Thresholds & Timers
const int SUNRISE_THRESHOLD = 2000; // Adjust based on calibration (0-4095)
const int SUNSET_THRESHOLD = 1000;
const long LDR_READ_INTERVAL = 60000; // Check light every 60s
const int FEED_DURATION_MS = 5000;

// State Tracking
enum DoorState { CLOSED, OPENING, OPEN, CLOSING, JAMMED };
DoorState currentDoorState = CLOSED;
unsigned long lastStateChange = 0;

// NTP Setup
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000); // Offset 0, Update 60s

// Stepper Logic (Half-step sequence for 28BYJ-48)
const int stepsPerRevolution = 4096; 
int stepCount = 0;

void setup() {
  Serial.begin(115200);
  
  // Pin Modes
  pinMode(LDR_PIN, INPUT);
  pinMode(FEEDER_PIN, OUTPUT);
  pinMode(STEPPER_IN1, OUTPUT);
  pinMode(STEPPER_IN2, OUTPUT);
  pinMode(STEPPER_IN3, OUTPUT);
  pinMode(STEPPER_IN4, OUTPUT);
  
  digitalWrite(FEEDER_PIN, LOW); // Feeder off
  
  // WiFi Connect
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    Serial.print(".");
    retry++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(" Connected!");
    timeClient.begin();
  } else {
    Serial.println(" WiFi Failed. Running in Offline Mode.");
  }

  // Initial Check
  checkSensors();
}

void loop() {
  timeClient.update();
  
  // 1. Check Light Levels & Manage Door
  static unsigned long lastCheck = 0;
  if (millis() - lastCheck > 1000) { // Check every second for demo, use longer in prod
    checkSensors();
    lastCheck = millis();
  }

  // 2. Check Feeding Schedule
  checkFeeding();

  // 3. Power Management (Simple placeholder)
  // In a real battery scenario, we would calculate time until next event 
  // and enter Deep Sleep or Light Sleep here.
}

void checkSensors() {
  // Smooth LDR Reading
  long sum = 0;
  for(int i=0; i<10; i++) {
    sum += analogRead(LDR_PIN);
    delay(10);
  }
  int ldrValue = sum / 10;
  
  Serial.print("LDR: "); Serial.print(ldrValue);
  Serial.print(" | Door: "); Serial.println(currentDoorState);

  // Door Logic
  if (ldrValue > SUNRISE_THRESHOLD && currentDoorState == CLOSED) {
    openDoor();
  } else if (ldrValue < SUNSET_THRESHOLD && currentDoorState == OPEN) {
    closeDoor();
  }
}

void checkFeeding() {
  int currentHour = timeClient.getHours();
  int currentMinute = timeClient.getMinutes();
  int currentSecond = timeClient.getSeconds();
  
  // Simple check for 8:00:00 and 16:00:00
  if ((currentHour == 8 || currentHour == 16) && 
      currentMinute == 0 && currentSecond == 0) {
    runFeeder();
  }
}

void openDoor() {
  Serial.println("Opening Door...");
  currentDoorState = OPENING;
  
  // Drive Stepper Forward (Placeholder logic)
  for(int i=0; i<stepsPerRevolution * 2; i++) { // 2 Rotations
    stepMotor(i % 8);
    delay(1); // Speed control
  }
  
  currentDoorState = OPEN;
  Serial.println("Door OPEN");
}

void closeDoor() {
  Serial.println("Closing Door...");
  currentDoorState = CLOSING;
  
  // Drive Stepper Backward
  for(int i=stepsPerRevolution * 2; i>0; i--) {
    stepMotor(i % 8);
    delay(1);
  }
  
  currentDoorState = CLOSED;
  Serial.println("Door CLOSED");
}

void runFeeder() {
  Serial.println("Feeding Time!");
  digitalWrite(FEEDER_PIN, HIGH);
  delay(FEED_DURATION_MS);
  digitalWrite(FEEDER_PIN, LOW);
  Serial.println("Feeding Complete.");
}

// Low level stepper sequence (IN1-IN4)
void stepMotor(int step) {
  switch(step) {
    case 0: digitalWrite(STEPPER_IN1, HIGH); digitalWrite(STEPPER_IN2, LOW); digitalWrite(STEPPER_IN3, LOW); digitalWrite(STEPPER_IN4, LOW); break;
    case 1: digitalWrite(STEPPER_IN1, HIGH); digitalWrite(STEPPER_IN2, HIGH); digitalWrite(STEPPER_IN3, LOW); digitalWrite(STEPPER_IN4, LOW); break;
    case 2: digitalWrite(STEPPER_IN1, LOW); digitalWrite(STEPPER_IN2, HIGH); digitalWrite(STEPPER_IN3, LOW); digitalWrite(STEPPER_IN4, LOW); break;
    case 3: digitalWrite(STEPPER_IN1, LOW); digitalWrite(STEPPER_IN2, HIGH); digitalWrite(STEPPER_IN3, HIGH); digitalWrite(STEPPER_IN4, LOW); break;
    case 4: digitalWrite(STEPPER_IN1, LOW); digitalWrite(STEPPER_IN2, LOW); digitalWrite(STEPPER_IN3, HIGH); digitalWrite(STEPPER_IN4, LOW); break;
    case 5: digitalWrite(STEPPER_IN1, LOW); digitalWrite(STEPPER_IN2, LOW); digitalWrite(STEPPER_IN3, HIGH); digitalWrite(STEPPER_IN4, HIGH); break;
    case 6: digitalWrite(STEPPER_IN1, LOW); digitalWrite(STEPPER_IN2, LOW); digitalWrite(STEPPER_IN3, LOW); digitalWrite(STEPPER_IN4, HIGH); break;
    case 7: digitalWrite(STEPPER_IN1, HIGH); digitalWrite(STEPPER_IN2, LOW); digitalWrite(STEPPER_IN3, LOW); digitalWrite(STEPPER_IN4, HIGH); break;
  }
}
`;

export const WIRING_GUIDE = `
** Wiring Guide **

1. **Light Sensor (LDR):**
   - Connect one leg of LDR to 3.3V.
   - Connect other leg to GPIO 34.
   - Connect a 10kΩ resistor from GPIO 34 to GND (Voltage Divider).

2. **Stepper Motor (28BYJ-48 & ULN2003):**
   - IN1 -> GPIO 19
   - IN2 -> GPIO 18
   - IN3 -> GPIO 5
   - IN4 -> GPIO 17
   - Power Driver Board (ULN2003) with 5V external power (not from ESP32 if possible).
   - Connect GND to ESP32 GND.

3. **Feeder Motor (DC Motor):**
   - Use a MOSFET (e.g., IRLZ44N) or NPN Transistor (2N2222 for small motors).
   - Gate/Base -> GPIO 16 (via 220Ω resistor).
   - Drain/Collector -> Motor (-).
   - Motor (+) -> External Power (+).
   - Source/Emitter -> GND.
   - Add a flyback diode across the motor terminals.
`;