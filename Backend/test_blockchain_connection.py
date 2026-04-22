#!/usr/bin/env python
"""
Test updated blockchain connection
"""
import os
import django
import sys

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from blockchain.web3_connection import get_connection_manager

def test_blockchain_connection():
    print("🔗 Testing updated blockchain connection...")

    manager = get_connection_manager()

    # Test health check
    print("\n📊 Health Check:")
    health = manager.health_check()
    print(f"Overall Status: {health['overall_status']}")

    if health['issues']:
        print("Issues Found:")
        for issue in health['issues']:
            print(f"  ❌ {issue}")

    if health['recommendations']:
        print("Recommendations:")
        for rec in health['recommendations']:
            print(f"  💡 {rec}")

    # Show connection details
    print("\n🔧 Connection Details:")
    details = health['details']
    for key, value in details.items():
        if key != 'diagnostics':
            print(f"  {key}: {value}")

    if 'diagnostics' in details and details['diagnostics']:
        print("  Diagnostics:")
        for key, value in details['diagnostics'].items():
            print(f"    {key}: {value}")

    # Test blockchain stats
    print("\n📈 Blockchain Statistics:")
    from blockchain.blockchain_operations import get_blockchain_storage
    storage = get_blockchain_storage()
    stats = storage.get_blockchain_stats()

    if stats:
        for key, value in stats.items():
            print(f"  {key}: {value}")
    else:
        print("  Unable to retrieve blockchain statistics")

    print("\n✅ Blockchain connection test completed!")

if __name__ == "__main__":
    test_blockchain_connection()