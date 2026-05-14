#!/usr/bin/env python
"""
Test script for blockchain integration
Run this to verify blockchain connection and operations
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()

from blockchain.blockchain_operations import AttendanceBlockchainStorage
from blockchain.web3_connection import Web3ConnectionManager

def test_blockchain_connection():
    """Test basic blockchain connection"""
    print("🔗 Testing Blockchain Connection...")

    manager = Web3ConnectionManager()
    connected = manager.connect()

    if connected:
        print("✅ Connected to Ganache!")
        print(f"   Network ID: {manager.network_id}")
        print(f"   Web3 Version: {manager.w3.version}")

        # Test contract initialization
        contract = manager.initialize_contract()
        if contract:
            print("✅ Smart contract initialized!")
            print(f"   Contract Address: {manager.contract.address}")
        else:
            print("❌ Failed to initialize contract")
            return False
    else:
        print("❌ Failed to connect to Ganache")
        print("   Make sure Ganache is running on http://127.0.0.1:7545")
        return False

    return True

def test_blockchain_operations():
    """Test blockchain operations"""
    print("\n📝 Testing Blockchain Operations...")

    storage = AttendanceBlockchainStorage()

    # Test connection
    if not storage.verify_blockchain_connection():
        print("❌ Blockchain connection failed")
        return False

    # Test hash generation
    hash_value = storage.generate_attendance_hash(
        student_reg_id="TEST001",
        course_id="CS101",
        date_str="2024-01-01",
        time_str="10:00:00"
    )
    print(f"✅ Generated hash: {hash_value}")

    # Test store operation (commented out to avoid actual transactions)
    # result = storage.store_attendance_on_blockchain(
    #     student_reg_id="TEST001",
    #     course_id="CS101",
    #     date_str="2024-01-01",
    #     time_str="10:00:00"
    # )
    # print(f"Store result: {result}")

    return True

def main():
    """Main test function"""
    print("🚀 Smart Attendance System - Blockchain Test")
    print("=" * 50)

    # Test connection
    if not test_blockchain_connection():
        print("\n❌ Blockchain setup incomplete. Please check:")
        print("   1. Ganache is installed and running")
        print("   2. Contract is deployed at the specified address")
        print("   3. Environment variables are set correctly")
        return 1

    # Test operations
    if not test_blockchain_operations():
        print("\n❌ Blockchain operations failed")
        return 1

    print("\n🎉 All blockchain tests passed!")
    print("   Your blockchain integration is ready.")
    return 0

if __name__ == "__main__":
    sys.exit(main())