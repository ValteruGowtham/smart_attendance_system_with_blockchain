# 🎓 Smart Attendance System with Blockchain

A modern, AI-powered attendance management system that uses facial recognition and blockchain technology to provide secure, efficient, and tamper-proof attendance tracking for educational institutions.

[![Django](https://img.shields.io/badge/Django-5.1.2-green.svg)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🌟 Features

### 🤖 AI-Powered Face Recognition
- **Pre-computed Embeddings**: Lightning-fast recognition using FaceNet-based embeddings
- **High Accuracy**: 512-dimensional face embeddings for precise identification
- **Real-time Processing**: Recognition in under 0.5 seconds
- **Automatic Generation**: Embeddings auto-generated on student registration

### 🔐 Blockchain Integration
- **Tamper-proof Records**: Attendance records secured with blockchain technology
- **Audit Trail**: Complete transparency and traceability
- **Transaction Hashing**: Each attendance entry linked to blockchain transaction

### 👥 Role-Based Access Control
- **Management**: Full system access, analytics, and user management
- **Faculty**: Class-specific attendance management and reporting
- **Students**: Personal attendance tracking and profile management

### 📊 Advanced Features
- **Real-time Dashboard**: Live attendance statistics and insights
- **Filtering & Search**: Advanced filtering by branch, year, section, and period
- **Export Capabilities**: Download attendance reports in multiple formats
- **Profile Management**: Easy photo upload and profile updates
- **Demo Data Seeding**: Quick setup with sample data for testing

## 🏗️ Architecture

### System Components
```
┌─────────────────┐
│   Frontend      │
│  (React/Vue)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Django Backend │
│   REST API      │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│SQLite/ │ │  FaceNet AI  │
│Postgres│ │  Recognition │
└────────┘ └──────────────┘
         │
         ▼
┌─────────────────┐
│   Blockchain    │
│   Integration   │
└─────────────────┘
```

### Technology Stack

**Backend:**
- Django 5.1.2
- Django REST Framework
- SQLite (Development) / PostgreSQL (Production)
- Django CORS Headers

**AI/ML:**
- PyTorch
- TorchVision
- FaceNet-PyTorch
- OpenCV

**Additional:**
- Pillow (Image Processing)
- Django Filters
- Python 3.8+

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ValteruGowtham/smart_attendance_system_with_blockchain.git
cd smart_attendance_system_with_blockchain
```

2. **Create and activate virtual environment**
```bash
python -m venv venv

# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

3. **Install dependencies**
```bash
cd Backend
pip install -r requirements.txt
```

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create superuser (admin)**
```bash
python manage.py createsuperuser
```

6. **Generate demo data (optional)**
```bash
python manage.py seed_demo_data
```

7. **Generate face embeddings**
```bash
python manage.py generate_embeddings
```

8. **Run the development server**
```bash
python manage.py runserver
```

The application will be available at `http://127.0.0.1:8000/`

## 📖 Usage

### For Management/Admin

1. Access admin panel at `http://127.0.0.1:8000/admin/`
2. Manage students, faculty, and courses
3. View system-wide attendance reports
4. Export data and analytics

### For Faculty

1. Login with faculty credentials
2. Select class (Branch, Year, Section, Period)
3. Turn on camera for face recognition
4. Capture student faces to mark attendance
5. View and manage class attendance records

### For Students

1. Login with student credentials
2. View personal attendance history
3. Update profile and photo
4. Track attendance across all courses

## 🔧 Configuration

### Face Recognition Settings

Adjust similarity threshold in `attendance/embedding_utils.py`:
```python
def compare_embeddings(embedding1, embedding2, threshold=0.6):
```
- **Lower (0.4-0.5)**: More lenient matching
- **Higher (0.7-0.8)**: Stricter matching
- **Default (0.6)**: Balanced accuracy

### CORS Configuration

Update allowed origins in `digital_id_system/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]
```

### Database Configuration

For production, switch to PostgreSQL in `settings.py`:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 📁 Project Structure

```
smart_attendance_system_with_blockchain/
├── Backend/
│   ├── attendance/              # Main attendance app
│   │   ├── models.py           # Database models
│   │   ├── api_views.py        # REST API endpoints
│   │   ├── recognizer.py       # Face recognition logic
│   │   ├── embedding_utils.py  # Embedding utilities
│   │   ├── management/
│   │   │   └── commands/
│   │   │       ├── generate_embeddings.py
│   │   │       └── seed_demo_data.py
│   │   └── migrations/
│   ├── digital_id_system/      # Django project settings
│   ├── media/                  # User uploaded files
│   ├── static/                 # Static files
│   ├── docs/                   # Documentation
│   └── requirements.txt
└── README.md
```

## 🧪 Management Commands

### Generate Face Embeddings
```bash
# Generate for all students
python manage.py generate_embeddings

# Force regenerate existing embeddings
python manage.py generate_embeddings --force

# Generate for specific student
python manage.py generate_embeddings --reg-id 12212302
```

### Seed Demo Data
```bash
python manage.py seed_demo_data
```

## 📊 API Endpoints

### Authentication
- `POST /api/login/` - User login
- `POST /api/logout/` - User logout

### Students
- `GET /api/students/` - List all students
- `POST /api/students/` - Create new student
- `GET /api/students/{id}/` - Get student details
- `PUT /api/students/{id}/` - Update student
- `DELETE /api/students/{id}/` - Delete student

### Attendance
- `GET /api/attendance/` - List attendance records
- `POST /api/attendance/mark/` - Mark attendance (with face recognition)
- `GET /api/attendance/filter/` - Filter attendance by parameters

### Faculty
- `GET /api/faculty/` - List all faculty
- `GET /api/faculty/classes/` - Get assigned classes

## 🎯 Performance

### Face Recognition Speed
- **Image-based (old)**: 2-5 seconds per student
- **Embedding-based (new)**: 0.1-0.5 seconds total

### Storage Efficiency
- **Image**: ~500KB per student
- **Embedding**: ~2KB per student
- **1000 students**: ~2MB total for embeddings

## 🐛 Troubleshooting

### "No embedding stored for student"
```bash
python manage.py generate_embeddings
```

### "No face detected in image"
- Ensure clear frontal face photo
- Good lighting conditions
- One person per image
- Face clearly visible

### FaceNet Model Download
- First run downloads ~107MB model automatically
- Subsequent runs use cached model

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Gowtham Valteru** - [ValteruGowtham](https://github.com/ValteruGowtham)

## 🙏 Acknowledgments

- FaceNet-PyTorch for face recognition capabilities
- Django community for excellent documentation
- All contributors and testers

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the maintainers.

---

**⭐ If you find this project useful, please consider giving it a star!**
