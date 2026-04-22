#!/usr/bin/env python
"""
Check Ganache status and provide connection information
"""
import requests
import json

def check_ganache_status():
    print("🔍 Checking Ganache Status...")

    try:
        # Test basic connectivity
        response = requests.post(
            "http://127.0.0.1:7545",
            json={"jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1},
            timeout=5
        )

        if response.status_code == 200:
            result = response.json()
            block_number = int(result.get('result', '0x0'), 16)
            print(f"✅ Ganache is RUNNING!")
            print(f"📊 Latest Block: {block_number}")

            # Get more info
            response2 = requests.post(
                "http://127.0.0.1:7545",
                json={"jsonrpc": "2.0", "method": "eth_accounts", "params": [], "id": 2},
                timeout=5
            )

            if response2.status_code == 200:
                accounts = response2.json().get('result', [])
                print(f"👥 Available Accounts: {len(accounts)}")
                if accounts:
                    print(f"🏦 First Account: {accounts[0][:10]}...")

            return True
        else:
            print(f"❌ Ganache responded with status: {response.status_code}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ganache at http://127.0.0.1:7545")
        print("💡 Make sure Ganache Desktop is running")
        return False
    except Exception as e:
        print(f"❌ Error checking Ganache: {e}")
        return False

def show_connection_info():
    print("\n🔧 Blockchain Connection Configuration:")
    print("📍 URL: http://127.0.0.1:7545")
    print("🌐 Network ID: 5777")
    print("📄 Contract Address: 0xDa0c9a811f7851Deb38A66889D5510789DbBCd05")
    print("📁 ABI File: Backend/blockchain/abi.json")

def show_startup_instructions():
    print("\n🚀 How to Start Ganache:")
    print("1. Open Ganache Desktop application")
    print("2. Click 'Quickstart' or create a new workspace")
    print("3. Ensure RPC Server is running on http://127.0.0.1:7545")
    print("4. Note the Network ID (should be 5777)")
    print("5. Copy a Contract Address from the deployed contracts")

if __name__ == "__main__":
    is_running = check_ganache_status()
    show_connection_info()

    if not is_running:
        show_startup_instructions()
        print("\n🔄 After starting Ganache, run this script again to verify connection.")
    else:
        print("\n✅ Blockchain is properly connected to your project!")