#!/usr/bin/env python3
"""
Test script to check Ganache connection and blockchain operations
"""

import sys
import os
sys.path.append('.')

from blockchain.web3_connection import get_connection_manager

def test_ganache_connection():
    """Test connection to Ganache"""
    print("🔍 Testing connection to Ganache...")

    manager = get_connection_manager()
    
    # Set to port 8545 since Ganache is running there
    manager.ganache_url = "http://127.0.0.1:8545"
    
    if manager.connect():
        print("✅ Connected successfully!")
        status = manager.verify_connection()
        print(f"   Network ID: {status.get('network_id')}")
        print(f"   Accounts available: {status.get('ganache_accounts')}")
        print(f"   Latest block: {status.get('latest_block')}")

        # Try to initialize contract
        if manager.initialize_contract():
            print("✅ Contract initialized successfully!")
            return True
        else:
            print("❌ Contract initialization failed")
            return False
    else:
        print("❌ Connection failed. Make sure Ganache is running on http://127.0.0.1:8545")
        return False

def test_blockchain_operations():
    """Test blockchain operations"""
    print("\n🔍 Testing blockchain operations...")

    from blockchain.blockchain_operations import get_blockchain_storage

    storage = get_blockchain_storage()

    # Test storing attendance
    try:
        result = storage.store_attendance_async_safe(
            student_reg_id="TEST001",
            course_id="CS101",
            date_str="2024-01-15",
            time_str="09:00:00"
        )

        if result['success']:
            print("✅ Attendance stored successfully!")
            print(f"   Transaction Hash: {result['transaction_hash']}")
            print(f"   Block Number: {result['block_number']}")
            print(f"   Gas Used: {result['gas_used']}")
        else:
            print("❌ Attendance storage failed")
            print(f"   Error: {result['error']}")

    except Exception as e:
        print(f"❌ Error during blockchain operation: {e}")

if __name__ == "__main__":
    print("🚀 Smart Attendance System - Blockchain Connection Test")
    print("=" * 60)

    if test_ganache_connection():
        test_blockchain_operations()
    else:
        print("\n💡 To fix connection issues:")
        print("   1. Start Ganache (GUI or CLI)")
        print("   2. Ensure it's running on http://127.0.0.1:7545")
        print("   3. Check if the smart contract is deployed")
        print("   4. Update CONTRACT_ADDRESS in web3_connection.py if needed")