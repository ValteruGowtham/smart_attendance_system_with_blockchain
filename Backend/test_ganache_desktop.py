#!/usr/bin/env python
"""
Test connection to Ganache Desktop on port 7545
"""
import requests
import json

def test_ganache_connection():
    try:
        # Test connection to port 7545
        response = requests.post('http://127.0.0.1:7545', json={
            'jsonrpc': '2.0',
            'method': 'eth_blockNumber',
            'params': [],
            'id': 1
        }, timeout=5)

        if response.status_code == 200:
            result = response.json()
            block_number = int(result['result'], 16)
            print(f"✅ Connected to Ganache Desktop on port 7545!")
            print(f"Latest block: {block_number}")

            # Get accounts
            accounts_response = requests.post('http://127.0.0.1:7545', json={
                'jsonrpc': '2.0',
                'method': 'eth_accounts',
                'params': [],
                'id': 2
            }, timeout=5)

            if accounts_response.status_code == 200:
                accounts = accounts_response.json()['result']
                print(f"Available accounts: {len(accounts)}")
                for i, account in enumerate(accounts[:3]):  # Show first 3
                    print(f"  Account {i+1}: {account}")

            return True
        else:
            print(f"❌ Connection failed: {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Ganache Desktop on port 7545: {e}")
        print("Make sure Ganache Desktop is running and set to port 7545")
        return False

if __name__ == '__main__':
    test_ganache_connection()