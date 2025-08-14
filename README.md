# 🛡️ SafeVision – Industrial PPE Detection & Alert System

SafeVision is a **real-time PPE (Personal Protective Equipment) detection and alert system** designed for industrial safety compliance.  
It integrates **computer vision**, **web dashboards**, and **hardware alerts (Arduino)** to monitor PPE usage across multiple zones.

## 📂 Project Structure
```bash
SafeVision/
│
├── backend/ # Node.js + Express REST API server 
│ ├── MongoDB models, routes, and controllers 
│ ├── Authentication, role-based access control 
│ ├── Violation logging, supervisor-zone assignments
│
├── frontend/ # React + TailwindCSS dashboard
│ ├── Admin & supervisor role-based UI
│ ├── Real-time violation charts & zone management
│ ├── CSV/PDF exports
│
├── detection-module/ # Python (YOLO + DeepSORT) PPE detection system
│ ├── Gate-level and zone-level detection
│ ├── Violation frame saving & buffered alert suppression
│ ├── REST API integration for logging and email alerts
│ ├── Arduino integration for on-site visual/audio alerts
│
└── README.md

``` 
---

## 🚀 Features

### 🎯 Real-Time PPE Detection
- Uses **YOLO object detection** + **DeepSORT tracking**
- Person-wise PPE association (Helmet, Vest, Gloves, etc.)
- Zone-based violation logging

### 📊 Interactive Dashboard
- Built with **React** + **TailwindCSS**
- Role-based access (**Admin** / **Supervisor**)
- Live violation feed, analytics, and charts
- Zone assignment & management
- CSV/PDF export of violation logs

### 🔔 Alert System
- **Arduino integration** for on-site hardware alerts
- Success screen & warning screen simulation (factory-style)
- Email alerts via **Resend API** to zone supervisors
- Buffered frame analysis to reduce false positives

---

## 🖥️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer + Cloudinary (image storage)

### Detection Module
- Python 3
- OpenCV
- YOLO (SH17 Pretrained Model)
- DeepSORT tracking
- Flask API (for dashboard integration)
- Pygame (UI sounds)

### Hardware
- Arduino UNO / Mega
- Buzzer + LED + LCD/OLED Display
- Serial communication from Python detection module

---

## ⚡ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/safevision.git
cd safevision
2️⃣ Backend Setup
```
---
```bash
cd backend
npm install
cp .env.example .env  # Configure MongoDB URI, JWT secret, Cloudinary keys, Resend API key
npm run dev
```
---
3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm start
```
---
4️⃣ Detection Module Setup
```bash
cd detection-module
pip install -r requirements.txt
python detect.py
```
---

## 🔌 Arduino Deployment
The detection module supports Arduino integration for physical alerts:

Connect Arduino with buzzer, LED, and display to your system via USB.

Update SERIAL_PORT in detection-module/config.py.

Detection script will trigger "PPE Violation" or "Safe to Proceed" signals to Arduino.

Factory-style hardware alerts are displayed in real-time.


## 🏭 Real-World Usage
SafeVision can be deployed in:

Factory entry gates

Construction sites

Zone-specific safety monitoring

Integration with industrial IoT systems

## 📜 License
This project is licensed under the MIT License – see the LICENSE file for details.


## 📬 Contact
For queries or collaborations:

Developer: Shubham Srivastava

Email: shubhamsrivastava12568@gmail.com