# Aarogya - AI Integrated Hospital Management System

![Aarogya HMS](https://img.shields.io/badge/Aarogya-HMS-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-5.0-green?style=flat-square)
![React](https://img.shields.io/badge/React-18.3-blue?style=flat-square)
![Security](https://img.shields.io/badge/Security-Enhanced-red?style=flat-square)

**Aarogya** (आरोग्य - meaning "Health" in Sanskrit) is a modern, AI-powered Hospital Management System designed to revolutionize healthcare delivery through intelligent automation, real-time communication, and comprehensive patient care management.

---

## 🌟 Key Features

### 🤖 AI-Powered Intelligence
- **Dual AI Agents**:
  - **Patient Health Agent**: Public-facing, safety-restricted AI for general health guidance
  - **Clinical Decision Support Agent**: Doctor-only AI for analytical insights and trend detection
- **DeepSeek API Integration**: Advanced language model for medical context understanding
- **Safety-First Design**: Strict guardrails prevent diagnosis, prognosis, or medical advice

### 🏥 Comprehensive Hospital Management
- **User Management**: Role-based access (Admin, Doctor, Nurse, Patient)
- **Medical Records**: Secure, encrypted patient data with full audit trails
- **Appointment System**: Online booking with real-time availability
- **Pharmacy Management**: Prescription tracking, medicine inventory
- **Lab Management**: Test ordering, results tracking with file attachments
- **Billing System**: Invoice generation with itemized breakdowns
- **Vitals Monitoring**: Real-time patient vital signs tracking

### 🔒 Enterprise-Grade Security
- **Security Monitor Microservice**: Real-time intrusion detection and prevention
  - SQL Injection, XSS, Command Injection detection
  - Path Traversal, LFI/RFI, SSRF protection
  - Behavioral anomaly detection
  - Automatic IP banning
- **Django Security Stack**:
  - `django-axes`: Brute force protection (5 attempts, 1-hour lockout)
  - `django-csp`: Content Security Policy enforcement
  - JWT Authentication with token refresh
  - Encrypted data at rest and in transit
- **Audit Logging**: Complete activity tracking for compliance

### 🎨 Modern User Interface
- **React + Vite Frontend**: Fast, responsive single-page application
- **Shadcn UI Components**: Beautiful, accessible design system
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach
- **Dark Mode Support**: User preference-based theming

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Patient    │  │    Doctor    │  │    Admin     │     │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────▼───────┐
                    │  API Gateway  │
                    │  (Axios)      │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│   Security     │  │  Django REST   │  │  Channels   │
│   Monitor      │  │   Framework    │  │ (WebSocket) │
│   (Port 8080)  │  │  (Port 8000)   │  │             │
└────────────────┘  └────────┬───────┘  └─────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   PostgreSQL   │  │     Redis       │  │   DeepSeek     │
│   Database     │  │  (Cache/Queue)  │  │   AI API       │
└────────────────┘  └─────────────────┘  └────────────────┘
```

---

## 📋 Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **Redis**: Latest stable version (for Channels)
- **PostgreSQL**: 13+ (recommended) or SQLite (development)

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/ienvysn/wildheads.git
cd wildheads
git checkout backend-updates
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your DEEPSEEK_API_KEY

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
# Username: admin
# Password: (your choice)

# Set admin role (important!)
python manage.py shell
>>> from users.models import User
>>> admin = User.objects.get(username='admin')
>>> admin.role = 'admin'
>>> admin.save()
>>> exit()
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Start the Application

**Option A: Secure Mode (Recommended)**
```bash
# From project root
./run_secure.sh
```
This starts both the Security Monitor (port 8080) and Django backend (port 8000).

**Option B: Development Mode**
```bash
# Terminal 1: Backend
./run_server.sh

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin
- **Security Monitor**: http://localhost:8080/status

---

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/users/register/          - Register new user
POST /api/users/login/              - Login (returns JWT tokens)
POST /api/users/token/refresh/      - Refresh access token
GET  /api/users/profile/            - Get current user profile
GET  /api/users/doctors/            - List all doctors
GET  /api/users/patients/           - List patients (role-based)
```

### Medical Endpoints
```
POST /api/medical/vitals/           - Record patient vitals
GET  /api/medical/appointments/     - List appointments
POST /api/medical/appointments/     - Create appointment
```

### AI Endpoints
```
POST /api/ai/chat/                  - Public patient chat (no auth required)
POST /api/ai/analyze/{patient_id}/  - Doctor-only clinical analysis
```

### Pharmacy Endpoints
```
GET  /api/pharmacy/medicines/       - List available medicines
GET  /api/pharmacy/prescriptions/   - List prescriptions (role-based)
POST /api/pharmacy/prescriptions/   - Create prescription (doctors only)
```

### Lab Endpoints
```
GET  /api/lab/tests/                - List available lab tests
GET  /api/lab/results/              - List test results (role-based)
```

### Billing Endpoints
```
GET  /api/billing/invoices/         - List invoices (patients see their own)
```

---

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test users
python manage.py test medical
python manage.py test ai_agent
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Security Monitor Tests
```bash
cd security_service
python security_monitor.py --test
```

---

## 🔐 Security Features

### 1. Security Monitor
The standalone security microservice provides:
- **Real-time threat detection** using SecLists payloads
- **Behavioral anomaly detection** (request rate, endpoint diversity)
- **Automatic IP banning** with configurable duration
- **Comprehensive logging** (accept, reject, and combined logs)

### 2. Django Security
- **Brute Force Protection**: Max 5 login attempts, 1-hour cooldown
- **Content Security Policy**: Strict CSP headers
- **XSS Protection**: Browser-level XSS filtering enabled
- **CSRF Protection**: Django's built-in CSRF middleware
- **Secure Headers**: X-Frame-Options, X-Content-Type-Options

### 3. AI Safety
- **Patient Agent**: Cannot diagnose, predict outcomes, or discuss serious conditions
- **Doctor Agent**: Analytical only, requires physician validation
- **Audit Trail**: All AI interactions logged

---

## 🎨 Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard widgets
│   │   ├── layout/            # Header, Footer, Navigation
│   │   └── ui/                # Shadcn UI components
│   ├── pages/
│   │   ├── admin/             # Admin dashboard
│   │   ├── doctor/            # Doctor dashboard
│   │   ├── nurse/             # Nurse dashboard
│   │   ├── patient/           # Patient dashboard
│   │   ├── Index.tsx          # Landing page
│   │   ├── Login.tsx          # Login page
│   │   └── Register.tsx       # Registration page
│   ├── services/
│   │   └── api.ts             # Axios API client
│   └── lib/
│       └── utils.ts           # Utility functions
```

---

## 🛠️ Configuration

### Environment Variables (.env)
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Optional - defaults to SQLite)
DATABASE_URL=postgresql://user:password@localhost:5432/aarogya

# AI
DEEPSEEK_API_KEY=sk-your-deepseek-api-key

# Redis (for Channels)
REDIS_URL=redis://localhost:6379/0

# Security Monitor
SECURITY_MONITOR_URL=http://localhost:8080
```

### Security Monitor Configuration (security_service/config.json)
```json
{
  "api": {
    "host": "0.0.0.0",
    "port": 8080
  },
  "detection": {
    "sql_injection": true,
    "xss": true,
    "command_injection": true
  },
  "ip_banning": {
    "enabled": true,
    "auto_ban_on_payload": true,
    "ban_duration_seconds": 86400
  }
}
```

---

## 📊 Database Schema

### Core Models
- **User**: Custom user model with role field (admin, doctor, nurse, patient)
- **Department**: Hospital departments
- **Doctor**: Doctor profile with specialization, fees, availability
- **Patient**: Patient profile with demographics and contact info
- **MedicalHistory**: Patient medical history (allergies, conditions, surgeries)
- **Vitals**: Patient vital signs (BP, heart rate, temperature, oxygen)
- **Appointment**: Doctor-patient appointments
- **AIAnalysis**: AI-generated clinical analysis results
- **Medicine**: Pharmacy inventory
- **Prescription**: Doctor prescriptions with items
- **LabTest**: Available lab tests
- **TestResult**: Lab test results with file attachments
- **Invoice**: Patient billing with line items

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **DeepSeek AI** for the language model API
- **Django** and **Django REST Framework** communities
- **React** and **Vite** teams
- **Shadcn UI** for the beautiful component library
- **SecLists** for security testing payloads

---

## 📞 Support

For support, email support@aarogya.health or open an issue on GitHub.

---

## 🗺️ Roadmap

- [ ] WebSocket real-time vitals monitoring
- [ ] Multi-language support (Nepali, Hindi)
- [ ] Voice-based AI assistance
- [ ] Wearable device integration
- [ ] Advanced analytics dashboard
- [ ] Mobile applications (iOS/Android)
- [ ] Telemedicine video consultations
- [ ] AI-powered triage system

---

**Built with ❤️ for better healthcare**
