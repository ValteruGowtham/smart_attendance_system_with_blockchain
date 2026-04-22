#!/usr/bin/env python
"""
Debug blockchain connection step by step
"""
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from web3 import Web3
import json
from pathlib import Path

def debug_connection():
    print("🔧 Debugging Blockchain Connection Step by Step...")

    # Step 1: Check if we can connect to Ganache directly
    print("\n1️⃣ Testing direct Web3 connection to Ganache...")
    try:
        w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:7545", request_kwargs={'timeout': 10}))
        is_connected = w3.is_connected()
        print(f"   Web3.is_connected(): {is_connected}")

        if is_connected:
            network_id = w3.net.version
            block_number = w3.eth.block_number
            accounts = w3.eth.accounts
            print(f"   ✅ Network ID: {network_id}")
            print(f"   ✅ Latest Block: {block_number}")
            print(f"   ✅ Accounts: {len(accounts)}")
        else:
            print("   ❌ Web3 connection failed")
            return False
    except Exception as e:
        print(f"   ❌ Direct Web3 connection error: {e}")
        return False

    # Step 2: Check ABI file
    print("\n2️⃣ Checking ABI file...")
    abi_path = Path(__file__).parent / "blockchain" / "abi.json"
    print(f"   ABI Path: {abi_path}")

    if not abi_path.exists():
        print("   ❌ ABI file not found")
        return False

    try:
        with open(abi_path, 'r') as f:
            abi = json.load(f)
        print(f"   ✅ ABI loaded successfully ({len(abi)} entries)")
    except Exception as e:
        print(f"   ❌ ABI loading error: {e}")
        return False

    # Step 3: Test contract initialization
    print("\n3️⃣ Testing contract initialization...")
    contract_address = "0xDa0c9a811f7851Deb38A66889D5510789DbBCd05"

    try:
        checksum_address = Web3.to_checksum_address(contract_address)
        print(f"   Contract Address: {checksum_address}")

        contract = w3.eth.contract(address=checksum_address, abi=abi)
        print("   ✅ Contract initialized successfully")

        # Try to call a simple function if available
        try:
            # Check if contract has getTotalRecords function
            if hasattr(contract.functions, 'getTotalRecords'):
                print("   📊 Contract has getTotalRecords function")
            else:
                print("   ⚠️ Contract may not have expected functions")
        except:
            print("   ⚠️ Could not verify contract functions")

    except Exception as e:
        print(f"   ❌ Contract initialization error: {e}")
        return False

    # Step 4: Test our connection manager
    print("\n4️⃣ Testing our Web3ConnectionManager...")
    try:
        from blockchain.web3_connection import get_connection_manager
        manager = get_connection_manager()

        # Load ABI
        abi_loaded = manager.load_abi()
        print(f"   ABI loaded: {abi_loaded}")

        # Connect
        connected = manager.connect()
        print(f"   Connected: {connected}")

        if connected:
            # Initialize contract
            contract_init = manager.initialize_contract()
            print(f"   Contract initialized: {contract_init is not None}")

            # Health check
            health = manager.health_check()
            print(f"   Health Status: {health['overall_status']}")

            if health['issues']:
                print("   Issues:")
                for issue in health['issues']:
                    print(f"     ❌ {issue}")

        return connected

    except Exception as e:
        print(f"   ❌ Connection manager error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = debug_connection()
    if success:
        print("\n🎉 Blockchain connection is working correctly!")
    else:
        print("\n❌ Blockchain connection has issues that need to be resolved.")