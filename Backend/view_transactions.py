#!/usr/bin/env python
"""
Get detailed transaction information from Ganache
"""
import requests
import json

def get_transaction_details(tx_hash):
    try:
        response = requests.post('http://127.0.0.1:7545', json={
            'jsonrpc': '2.0',
            'method': 'eth_getTransactionByHash',
            'params': [tx_hash],
            'id': 1
        }, timeout=5)

        if response.status_code == 200:
            tx_data = response.json()['result']
            if tx_data:
                print(f"\n📋 Transaction Details for {tx_hash}")
                print(f"Block Number: {int(tx_data['blockNumber'], 16)}")
                print(f"From: {tx_data['from']}")
                print(f"To: {tx_data['to']}")
                print(f"Value: {int(tx_data['value'], 16)} wei")
                print(f"Gas Price: {int(tx_data['gasPrice'], 16)} wei")
                print(f"Gas Limit: {int(tx_data['gas'], 16)}")
                print(f"Input Data: {tx_data['input'][:100]}..." if len(tx_data['input']) > 100 else f"Input Data: {tx_data['input']}")

                # Get transaction receipt
                receipt_response = requests.post('http://127.0.0.1:7545', json={
                    'jsonrpc': '2.0',
                    'method': 'eth_getTransactionReceipt',
                    'params': [tx_hash],
                    'id': 2
                }, timeout=5)

                if receipt_response.status_code == 200:
                    receipt = receipt_response.json()['result']
                    if receipt:
                        print(f"Gas Used: {int(receipt['gasUsed'], 16)}")
                        print(f"Status: {'✅ Success' if int(receipt['status'], 16) == 1 else '❌ Failed'}")
                        print(f"Logs: {len(receipt['logs'])} log entries")
            else:
                print(f"❌ Transaction {tx_hash} not found")
        else:
            print(f"❌ RPC error: {response.status_code}")

    except Exception as e:
        print(f"❌ Error getting transaction details: {e}")

def get_all_blocks():
    print("\n🔗 Blockchain Status:")
    print("=" * 50)

    # Get latest block number
    response = requests.post('http://127.0.0.1:7545', json={
        'jsonrpc': '2.0',
        'method': 'eth_blockNumber',
        'params': [],
        'id': 1
    }, timeout=5)

    if response.status_code == 200:
        latest_block = int(response.json()['result'], 16)
        print(f"Latest Block: {latest_block}")

        # Show last 5 blocks
        for block_num in range(max(0, latest_block - 4), latest_block + 1):
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
                    timestamp = int(block['timestamp'], 16)
                    print(f"Block {block_num}: {tx_count} transactions, Timestamp: {timestamp}")

if __name__ == '__main__':
    # Check our specific transaction
    tx_hash = "0x6f95f53108180b27dd713cefd4a3e1bfb8e173b71c3552eb507a76ca17f3e59f"
    get_transaction_details(tx_hash)

    # Show blockchain overview
    get_all_blocks()

    print("\n💡 To view in Ganache Desktop GUI:")
    print("1. Open Ganache Desktop application")
    print("2. Go to 'Transactions' tab")
    print("3. Look for the transaction hash above")
    print("4. Click on it to see detailed information")