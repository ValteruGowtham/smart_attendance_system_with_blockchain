#!/usr/bin/env python
"""
Test blockchain operations
"""
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from blockchain.blockchain_operations import AttendanceBlockchainStorage

def test_blockchain_operations():
    print('🧪 Testing blockchain operations...')

    storage = AttendanceBlockchainStorage()

    # Test storing a simple attendance record
    result = storage.store_attendance_async_safe(
        student_reg_id='TEST001',
        course_id='CS101',
        date_str='2026-04-22',
        time_str='10:00:00'
    )

    print(f'Result: {result}')

    if result['success']:
        print('✅ Blockchain operations working correctly!')
        print(f'   Transaction: {result["transaction_hash"][:20]}...')
        print(f'   Block: {result["block_number"]}')
        print(f'   Gas Used: {result["gas_used"]}')
    else:
        print('❌ Blockchain operations failed')
        print(f'   Error: {result["error"]}')

if __name__ == "__main__":
    test_blockchain_operations()