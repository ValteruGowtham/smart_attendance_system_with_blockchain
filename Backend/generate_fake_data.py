#!/usr/bin/env python
"""
Generate multiple fake attendance records and store them on blockchain
"""
import os
import django
import sys
from datetime import date, time, timedelta
import random

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from attendance.models import Attendance, Faculty, Student, Course
from blockchain.blockchain_operations import AttendanceBlockchainStorage

def generate_fake_attendance_data():
    print("🎯 Generating fake attendance data for existing student and storing on blockchain...")

    # Get existing data
    faculty = Faculty.objects.get(uid='FAC001')
    course = Course.objects.get(course_code='CS101')
    student = Student.objects.get(registration_id='STU001')

    print(f"Using student: {student}")
    print(f"Faculty: {faculty}")
    print(f"Course: {course}")

    # Generate attendance for the past 10 days with different periods
    base_date = date.today()
    attendance_records = []

    periods = ['1', '2', '3', '4', '5', '6', '7', '8']
    period_times = {
        '1': time(9, 0), '2': time(10, 0), '3': time(11, 0), '4': time(12, 0),
        '5': time(13, 0), '6': time(14, 0), '7': time(15, 0), '8': time(16, 0)
    }

    for days_ago in range(10):  # Last 10 days
        attendance_date = base_date - timedelta(days=days_ago)

        # Create attendance for 2-4 random periods per day
        num_periods = random.randint(2, 4)
        selected_periods = random.sample(periods, num_periods)

        for period in selected_periods:
            # Create attendance record
            attendance = Attendance.objects.create(
                faculty=faculty,
                student=student,
                course=course,
                date=attendance_date,
                time=period_times[period],
                branch='CSE',
                year='3',
                section='A',
                period=period,
                status='Present'
            )

            attendance_records.append(attendance)
            print(f"✅ Created attendance: {student.registration_id} - {attendance_date} - Period {period} ({period_times[period].strftime('%I:%M %p')})")

    print(f"\n📊 Generated {len(attendance_records)} attendance records")

    # Now store them on blockchain
    storage = AttendanceBlockchainStorage()
    successful_stores = 0

    print("\n⛓️ Storing attendance records on blockchain...")

    for i, attendance in enumerate(attendance_records, 1):
        try:
            print(f"[{i}/{len(attendance_records)}] Storing {attendance.student.registration_id} for {attendance.date} Period {attendance.period}...")

            tx_result = storage.store_attendance_on_blockchain(
                student_reg_id=attendance.student.registration_id,
                course_id=course.course_code,
                date_str=str(attendance.date),
                time_str=str(attendance.time)
            )

            if tx_result['success']:
                attendance.blockchain_tx = tx_result['transaction_hash']
                attendance.save()
                successful_stores += 1
                print(f"   ✅ Stored - Tx: {tx_result['transaction_hash'][:20]}... Block: {tx_result['block_number']}")
            else:
                print(f"   ❌ Failed to store")

        except Exception as e:
            print(f"   ❌ Error: {e}")

    print(f"\n🎉 Successfully stored {successful_stores}/{len(attendance_records)} records on blockchain!")

    return attendance_records

def show_blockchain_summary():
    print("\n🔗 Blockchain Summary:")
    print("=" * 50)

    # Get blockchain info via direct RPC calls
    import requests

    try:
        # Get latest block
        response = requests.post('http://127.0.0.1:7545', json={
            'jsonrpc': '2.0',
            'method': 'eth_blockNumber',
            'params': [],
            'id': 1
        }, timeout=5)

        if response.status_code == 200:
            latest_block = int(response.json()['result'], 16)
            print(f"Latest Block: {latest_block}")

            # Count transactions in recent blocks
            total_txs = 0
            for block_num in range(max(0, latest_block - 10), latest_block + 1):
                block_response = requests.post('http://127.0.0.1:7545', json={
                    'jsonrpc': '2.0',
                    'method': 'eth_getBlockByNumber',
                    'params': [hex(block_num), False],
                    'id': 2
                }, timeout=5)

                if block_response.status_code == 200:
                    block = block_response.json()['result']
                    if block:
                        tx_count = len(block['transactions'])
                        total_txs += tx_count
                        if tx_count > 0:
                            print(f"Block {block_num}: {tx_count} transactions")

            print(f"Total Transactions: {total_txs}")

    except Exception as e:
        print(f"Error getting blockchain info: {e}")

if __name__ == '__main__':
    records = generate_fake_attendance_data()
    show_blockchain_summary()

    print("\n🎯 Now check Ganache Desktop to see all the transactions!")
    print("You should see multiple blocks with attendance transactions.")