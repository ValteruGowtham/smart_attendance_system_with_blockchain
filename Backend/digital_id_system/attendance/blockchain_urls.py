"""
blockchain_urls.py
URL configuration for blockchain API endpoints
Add this to your Django URL routing
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from attendance.blockchain_api_views import BlockchainTransactionViewSet

# Create router and register viewset
router = DefaultRouter()
router.register(r'transactions', BlockchainTransactionViewSet, basename='blockchain-transactions')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

"""
INTEGRATION INSTRUCTIONS:
=============================

1. Add to your main urls.py (e.g., digital_id_system/urls.py):

    from django.urls import path, include
    
    urlpatterns = [
        # ... existing patterns ...
        path('api/blockchain/', include('attendance.blockchain_urls')),
    ]

2. Import the ViewSet and Router at the top of blockchain_urls.py:

    from rest_framework.routers import DefaultRouter
    from attendance.blockchain_api_views import BlockchainTransactionViewSet

3. Ensure DRF is installed:
    
    pip install djangorestframework

4. Add to INSTALLED_APPS in settings.py:
    
    INSTALLED_APPS = [
        # ...
        'rest_framework',
    ]

AVAILABLE ENDPOINTS:
====================================

GET  /api/blockchain/transactions/
     - List all blockchain transactions (paginated)
     - Returns 100 most recent transactions
     - Query params: ?page=1, ?page_size=20

GET  /api/blockchain/transactions/{id}/
     - Get a specific transaction by ID

GET  /api/blockchain/transactions/by_status/?status=confirmed
     - Filter by status: confirmed, pending, failed, all
     - Returns matching transactions

GET  /api/blockchain/transactions/by_student/?student_id=CSE001
     - Get all transactions for a specific student

GET  /api/blockchain/transactions/by_course/?course_id=5
     - Get all transactions for a specific course

GET  /api/blockchain/transactions/by_date_range/
     - Query params: ?start_date=2024-01-01&end_date=2024-01-31
     - Return transactions within date range

GET  /api/blockchain/transactions/stats/
     - Get transaction statistics
     - Returns: { total, confirmed, pending, failed, timestamp }

DATA STRUCTURE:
===============

{
  "tx_hash": "0x1a2b3c...",
  "transaction_hash": "0x1a2b3c...",
  "block_number": 15847,
  "status": "confirmed",
  "timestamp": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:30:05Z",
  
  "student_name": "John Doe",
  "student_id": "CSE001",
  "student_email": "john@example.com",
  
  "course_name": "Database Systems",
  "course_id": "DB101",
  "subject": "Database Systems",
  
  "date": "2024-01-15",
  "time": "10:30:00",
  "attendance_status": "present",
  
  "from_address": "0x742d35Cc6634C0532925a3b844Bc3e4d0eec2C85",
  "to_address": "0x1234567890123456789012345678901234567890",
  "gas_used": 127450,
  "gas_price": "20000000000",
  "value": "0",
  "confirmations": 42
}

EXAMPLE REQUESTS:
=================

# Get all transactions
curl -H "Authorization: Bearer YOUR_TOKEN" 
  'http://localhost:8000/api/blockchain/transactions/'

# Get confirmed transactions
curl -H "Authorization: Bearer YOUR_TOKEN" 
  'http://localhost:8000/api/blockchain/transactions/by_status/?status=confirmed'

# Get transactions for a student
curl -H "Authorization: Bearer YOUR_TOKEN" 
  'http://localhost:8000/api/blockchain/transactions/by_student/?student_id=CSE001'

# Get transactions in date range
curl -H "Authorization: Bearer YOUR_TOKEN" 
  'http://localhost:8000/api/blockchain/transactions/by_date_range/?start_date=2024-01-01&end_date=2024-01-31'

# Get statistics
curl -H "Authorization: Bearer YOUR_TOKEN" 
  'http://localhost:8000/api/blockchain/transactions/stats/'

PERMISSIONS:
============

- All endpoints require authentication (IsAuthenticated)
- Faculty users see only their own courses' transactions
- Admin/Staff users see all transactions
"""
