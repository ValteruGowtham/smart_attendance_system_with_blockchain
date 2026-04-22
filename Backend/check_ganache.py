#!/usr/bin/env python
"""
Check Ganache status and get blockchain information
"""
import requests
import json

def check_ganache():
    try:
        # Check latest block
        response = requests.post('http://127.0.0.1:7545', json={
            'jsonrpc': '2.0',
            'method': 'eth_blockNumber',
            'params': [],
            'id': 1
        }, timeout=5)

        if response.status_code == 200:
            result = response.json()
            block_number = int(result['result'], 16)
            print(f"✅ Ganache is running!")
            print(f"Latest block: {block_number}")

            # Get block details
            block_response = requests.post('http://127.0.0.1:7545', json={
                'jsonrpc': '2.0',
                'method': 'eth_getBlockByNumber',
                'params': [hex(block_number), True],
                'id': 2
            }, timeout=5)

            if block_response.status_code == 200:
                block_data = block_response.json()['result']
                tx_count = len(block_data['transactions'])
                print(f"Transactions in latest block: {tx_count}")

                if tx_count > 0:
                    print("\nRecent transactions:")
                    for i, tx in enumerate(block_data['transactions'][:5]):  # Show first 5
                        print(f"  {i+1}. {tx['hash']} - From: {tx['from']} -> To: {tx['to']}")

            return True
        else:
            print(f"❌ Ganache RPC error: {response.status_code}")
            return False

    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Ganache: {e}")
        print("Make sure Ganache is running on http://127.0.0.1:7545")
        return False

if __name__ == '__main__':
    check_ganache()