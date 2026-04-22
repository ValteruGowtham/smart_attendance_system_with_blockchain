"""
Blockchain Operations Module for Attendance Storage
Handles smart contract interactions for storing attendance records on-chain
"""

import hashlib
import json
import logging
from datetime import datetime
from web3 import Web3
from tenacity import retry, stop_after_attempt, wait_exponential

from .web3_connection import get_connection_manager

logger = logging.getLogger(__name__)


class BlockchainOperationError(Exception):
    """Custom exception for blockchain operation failures"""
    pass


class AttendanceBlockchainStorage:
    """
    Handles storage of attendance records on blockchain
    """
    
    def __init__(self):
        self.manager = get_connection_manager()
        self.transaction_timeout = 15  # seconds
        self.max_retries = 3
    
    def generate_attendance_hash(self, student_reg_id, course_id, date_str, time_str):
        """
        Generate a unique hash for attendance record
        
        Args:
            student_reg_id: Student registration ID
            course_id: Course ID
            date_str: Date (YYYY-MM-DD format)
            time_str: Time (HH:MM:SS format)
        
        Returns:
            str: SHA256 hash of attendance data
        """
        try:
            attendance_data = {
                'student_id': student_reg_id,
                'course_id': course_id,
                'date': date_str,
                'time': time_str,
                'timestamp': datetime.now().isoformat()
            }
            
            # Create JSON string and hash it
            json_str = json.dumps(attendance_data, sort_keys=True)
            hash_obj = hashlib.sha256(json_str.encode('utf-8'))
            hash_value = hash_obj.hexdigest()
            
            logger.debug(f"Generated hash for {student_reg_id}: {hash_value}")
            return hash_value
        
        except Exception as e:
            logger.error(f"Error generating attendance hash: {e}")
            raise BlockchainOperationError(f"Failed to generate attendance hash: {str(e)}")
    
    def verify_blockchain_connection(self):
        """
        Verify blockchain connection is available with health check
        
        Returns:
            bool: True if connected and healthy, False otherwise
        """
        try:
            # First check basic connection
            if not self.manager.is_connected:
                logger.warning("Blockchain manager not connected, attempting connection...")
                self.manager.load_abi()
                self.manager.connect()
            
            if not self.manager.contract:
                logger.warning("Contract not initialized, initializing...")
                self.manager.initialize_contract()
            
            # Perform health check
            health = self.manager.health_check()
            if health["overall_status"] != "healthy":
                logger.warning(f"Blockchain health check failed: {health['issues']}")
                # Try to reconnect once
                if self.manager.reconnect():
                    health = self.manager.health_check()
            
            return health["overall_status"] == "healthy"
        
        except Exception as e:
            logger.error(f"Error verifying blockchain connection: {e}")
            return False
    
    def get_blockchain_stats(self):
        """
        Get blockchain network statistics
        
        Returns:
            dict: Blockchain statistics or None if unavailable
        """
        try:
            if not self.verify_blockchain_connection():
                return None
            
            w3 = self.manager.w3
            stats = {
                "network_id": self.manager.network_id,
                "latest_block": w3.eth.block_number,
                "gas_price": w3.eth.gas_price,
                "accounts_count": len(w3.eth.accounts),
                "contract_address": self.manager.contract.address if self.manager.contract else None,
                "connection_url": self.manager.ganache_url
            }
            
            return stats
        
        except Exception as e:
            logger.error(f"Error getting blockchain stats: {e}")
            return None
        
        except Exception as e:
            logger.error(f"Error verifying blockchain connection: {e}")
            return False
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    def store_attendance_on_blockchain(self, student_reg_id, course_id, date_str, time_str):
        """
        Store attendance record on blockchain
        
        Args:
            student_reg_id: Student registration ID
            course_id: Course ID
            date_str: Date (YYYY-MM-DD format)
            time_str: Time (HH:MM:SS format)
        
        Returns:
            dict: Transaction info with hash and receipt details
                {
                    'success': bool,
                    'transaction_hash': str (hex),
                    'message': str,
                    'block_number': int,
                    'gas_used': int
                }
        
        Raises:
            BlockchainOperationError: If operation fails
        """
        try:
            # Verify connection first
            if not self.verify_blockchain_connection():
                raise BlockchainOperationError(
                    "Blockchain connection unavailable. Ensure Ganache is running on http://127.0.0.1:7545"
                )
            
            # Generate attendance hash
            hash_value = self.generate_attendance_hash(
                student_reg_id, course_id, date_str, time_str
            )
            
            logger.info(f"Storing attendance on blockchain for {student_reg_id}")
            
            # Get Web3 instance and accounts
            w3 = self.manager.w3
            contract = self.manager.contract
            
            try:
                # Get sender account (first Ganache account)
                sender_account = w3.eth.accounts[0]
                logger.debug(f"Using account: {sender_account}")
            except (IndexError, Exception) as e:
                raise BlockchainOperationError(f"Cannot get sender account: {str(e)}")
            
            # Build transaction
            try:
                # Call storeRecord function
                tx_function = contract.functions.storeRecord(
                    student_reg_id,  # _regNumber (string)
                    hash_value        # _hashValue (string)
                )
                
                # Build transaction dict
                tx_dict = tx_function.build_transaction({
                    'from': sender_account,
                    'gas': 3000000,
                    'gasPrice': w3.eth.gas_price,
                    'nonce': w3.eth.get_transaction_count(sender_account),
                })
                
                logger.debug(f"Transaction built. Gas estimate: {tx_dict['gas']}")
                
            except Exception as e:
                raise BlockchainOperationError(f"Error building transaction: {str(e)}")
            
            # Send transaction (in Ganache, signing is automatic for default accounts)
            try:
                tx_hash = w3.eth.send_transaction(tx_dict)
                logger.info(f"Transaction sent: {tx_hash.hex()}")
            except Exception as e:
                raise BlockchainOperationError(f"Error sending transaction: {str(e)}")
            
            # Wait for receipt
            try:
                receipt = w3.eth.wait_for_transaction_receipt(
                    tx_hash, 
                    timeout=self.transaction_timeout
                )
                
                if receipt['status'] == 1:
                    logger.info(
                        f"Attendance stored successfully. "
                        f"TxHash: {tx_hash.hex()}, "
                        f"Block: {receipt['blockNumber']}, "
                        f"Gas Used: {receipt['gasUsed']}"
                    )
                    
                    return {
                        'success': True,
                        'transaction_hash': tx_hash.hex(),
                        'block_number': receipt['blockNumber'],
                        'gas_used': receipt['gasUsed'],
                        'from': receipt['from'],
                        'to': receipt['to'],
                        'message': 'Attendance successfully stored on blockchain'
                    }
                else:
                    raise BlockchainOperationError(
                        f"Transaction failed. Status: {receipt['status']}"
                    )
            
            except Exception as e:
                if 'timeout' in str(e).lower():
                    raise BlockchainOperationError(
                        f"Transaction receipt timeout. TxHash: {tx_hash.hex() if tx_hash else 'N/A'}"
                    )
                raise BlockchainOperationError(f"Error waiting for receipt: {str(e)}")
        
        except BlockchainOperationError:
            raise
        except Exception as e:
            logger.error(f"Unexpected error storing attendance on blockchain: {e}", exc_info=True)
            raise BlockchainOperationError(f"Unexpected error: {str(e)}")
    
    def store_attendance_async_safe(self, student_reg_id, course_id, date_str, time_str):
        """
        Safely store attendance on blockchain without blocking API
        
        Args:
            student_reg_id: Student registration ID
            course_id: Course ID
            date_str: Date (YYYY-MM-DD format)
            time_str: Time (HH:MM:SS format)
        
        Returns:
            dict: Operation result (always returns dict, never raises exception)
                {
                    'success': bool,
                    'transaction_hash': str or None,
                    'message': str,
                    'error': str or None
                }
        """
        try:
            result = self.store_attendance_on_blockchain(
                student_reg_id, course_id, date_str, time_str
            )
            return {
                'success': True,
                'transaction_hash': result['transaction_hash'],
                'message': result['message'],
                'error': None,
                'block_number': result.get('block_number'),
                'gas_used': result.get('gas_used')
            }
        
        except BlockchainOperationError as e:
            logger.warning(f"Blockchain operation failed (non-critical): {str(e)}")
            return {
                'success': False,
                'transaction_hash': None,
                'message': 'Attendance saved to database but blockchain storage failed',
                'error': str(e),
                'block_number': None,
                'gas_used': None
            }
        
        except Exception as e:
            logger.error(f"Unexpected error in async blockchain storage: {e}", exc_info=True)
            return {
                'success': False,
                'transaction_hash': None,
                'message': 'Attendance saved to database but blockchain storage encountered an error',
                'error': str(e),
                'block_number': None,
                'gas_used': None
            }


# Global instance
_blockchain_storage = None


def get_blockchain_storage():
    """Factory function to get or create blockchain storage instance"""
    global _blockchain_storage
    if _blockchain_storage is None:
        _blockchain_storage = AttendanceBlockchainStorage()
    return _blockchain_storage
