"""
Web3 Connection Module for Ganache Blockchain Integration
Provides robust connection handling with error handling and configuration management
"""

from web3 import Web3
import json
import os
import logging
from pathlib import Path

# Configure logging
logger = logging.getLogger(__name__)

# Configuration
GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")  # Default to Desktop port
GANACHE_NETWORK_ID = int(os.getenv("GANACHE_NETWORK_ID", "5777"))
CONNECTION_TIMEOUT = int(os.getenv("CONNECTION_TIMEOUT", "10"))  # Increased timeout
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Get ABI file path (works from different working directories)
CURRENT_DIR = Path(__file__).resolve().parent
ABI_FILE_PATH = CURRENT_DIR / "abi.json"

# Smart contract configuration
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0xDa0c9a811f7851Deb38A66889D5510789DbBCd05")

# Get ABI file path (works from different working directories)
CURRENT_DIR = Path(__file__).resolve().parent
ABI_FILE_PATH = CURRENT_DIR / "abi.json"

# Smart contract configuration
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0xDa0c9a811f7851Deb38A66889D5510789DbBCd05")


class Web3ConnectionManager:
    """
    Manages Web3 connection to Ganache with error handling and retry logic
    """
    
    def __init__(self, ganache_url=GANACHE_URL, abi_path=ABI_FILE_PATH):
        self.ganache_url = ganache_url
        self.abi_path = abi_path
        self.w3 = None
        self.contract = None
        self.abi = None
        self.is_connected = False
        self.network_id = None
    
    def load_abi(self):
        """
        Load ABI from JSON file with error handling
        Returns: ABI dict or None
        """
        try:
            if not os.path.exists(self.abi_path):
                logger.error(f"ABI file not found at {self.abi_path}")
                return None
            
            with open(self.abi_path, 'r') as f:
                self.abi = json.load(f)
            logger.info(f"ABI loaded successfully from {self.abi_path}")
            return self.abi
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in ABI file: {e}")
            return None
        except Exception as e:
            logger.error(f"Error loading ABI file: {e}")
            return None
    
    def connect(self, retry_count=0):
        """
        Establish connection to Ganache with retry logic
        
        Args:
            retry_count: Current retry attempt
        
        Returns: 
            bool: True if connected, False otherwise
        """
        try:
            logger.info(f"Attempting to connect to Ganache at {self.ganache_url}")
            
            # Create Web3 instance with HTTPProvider
            self.w3 = Web3(Web3.HTTPProvider(
                self.ganache_url, 
                request_kwargs={'timeout': CONNECTION_TIMEOUT}
            ))
            
            # Test connection
            if not self.w3.is_connected():
                raise ConnectionError(f"Web3 provider not connected to {self.ganache_url}")
            
            # Get network info
            self.network_id = self.w3.net.version
            logger.info(f"Successfully connected to Ganache. Network ID: {self.network_id}")
            
            self.is_connected = True
            return True
            
        except ConnectionError as e:
            logger.warning(f"Connection attempt {retry_count + 1} failed: {e}")
            if retry_count < MAX_RETRIES:
                logger.info(f"Retrying... ({retry_count + 1}/{MAX_RETRIES})")
                return self.connect(retry_count + 1)
            else:
                logger.error(f"Failed to connect after {MAX_RETRIES} attempts")
                self.is_connected = False
                return False
        except Exception as e:
            logger.error(f"Unexpected error during connection: {e}")
            self.is_connected = False
            return False
    
    def initialize_contract(self, contract_address=CONTRACT_ADDRESS, abi=None):
        """
        Initialize contract instance with address and ABI
        
        Args:
            contract_address: Ethereum contract address
            abi: Contract ABI (uses loaded ABI if not provided)
        
        Returns:
            Contract instance or None
        """
        try:
            if not self.is_connected:
                logger.error("Not connected to Web3. Call connect() first.")
                return None
            
            if abi is None:
                if self.abi is None:
                    self.load_abi()
                abi = self.abi
            
            if abi is None:
                logger.error("ABI not available. Cannot initialize contract.")
                return None
            
            # Validate contract address format
            if not Web3.is_address(contract_address):
                logger.error(f"Invalid contract address: {contract_address}")
                return None
            
            # Ensure checksummed address
            contract_address = Web3.to_checksum_address(contract_address)
            
            self.contract = self.w3.eth.contract(
                address=contract_address,
                abi=abi
            )
            logger.info(f"Contract initialized at {contract_address}")
            return self.contract
        
        except Exception as e:
            logger.error(f"Error initializing contract: {e}")
            return None
    
    def get_contract(self):
        """Returns the initialized contract instance"""
        return self.contract
    
    def get_web3_instance(self):
        """Returns the Web3 instance"""
        return self.w3
    
    def verify_connection(self):
        """
        Verify connection status and contract availability
        
        Returns:
            dict: Status information with detailed diagnostics
        """
        status = {
            "is_connected": self.is_connected,
            "ganache_url": self.ganache_url,
            "network_id": self.network_id,
            "contract_initialized": self.contract is not None,
            "abi_loaded": self.abi is not None,
            "connection_healthy": False,
            "diagnostics": {}
        }
        
        if self.is_connected and self.w3:
            try:
                # Test basic connectivity
                latest_block = self.w3.eth.block_number
                status["diagnostics"]["latest_block"] = latest_block
                
                # Check accounts
                accounts = self.w3.eth.accounts
                status["diagnostics"]["accounts_count"] = len(accounts)
                
                # Check gas price
                gas_price = self.w3.eth.gas_price
                status["diagnostics"]["gas_price"] = gas_price
                
                # Check contract if initialized
                if self.contract:
                    try:
                        # Try to call a simple contract function (if available)
                        # Note: This might fail for some contracts, so we wrap it
                        status["diagnostics"]["contract_address"] = self.contract.address
                        status["connection_healthy"] = True
                    except Exception as e:
                        status["diagnostics"]["contract_error"] = str(e)
                        status["connection_healthy"] = False
                else:
                    status["connection_healthy"] = True  # Basic connection is healthy
                
            except Exception as e:
                status["diagnostics"]["error"] = str(e)
                status["connection_healthy"] = False
                self.is_connected = False
        
    def health_check(self):
        """
        Perform comprehensive health check of blockchain connection
        
        Returns:
            dict: Health status with recommendations
        """
        status = self.verify_connection()
        
        # Ensure status is a dict
        if status is None:
            status = {
                "is_connected": False,
                "ganache_url": self.ganache_url,
                "network_id": None,
                "contract_initialized": False,
                "abi_loaded": False,
                "connection_healthy": False,
                "diagnostics": {"error": "Connection verification failed"}
            }
        
        health_report = {
            "overall_status": "healthy" if status.get("connection_healthy", False) else "unhealthy",
            "issues": [],
            "recommendations": [],
            "details": status
        }
        
        # Check connection
        if not status["is_connected"]:
            health_report["issues"].append("No connection to Ganache")
            health_report["recommendations"].append("Ensure Ganache Desktop is running on " + self.ganache_url)
        
        # Check ABI
        if not status["abi_loaded"]:
            health_report["issues"].append("ABI file not loaded")
            health_report["recommendations"].append("Verify abi.json exists in blockchain directory")
        
        # Check contract
        if not status["contract_initialized"]:
            health_report["issues"].append("Smart contract not initialized")
            health_report["recommendations"].append("Check contract address and ABI compatibility")
        
        # Check network
        if status.get("diagnostics", {}).get("error"):
            health_report["issues"].append("Network connectivity issue")
            health_report["recommendations"].append("Check Ganache network configuration")
        
        # Update overall status
        if health_report["issues"]:
            health_report["overall_status"] = "unhealthy"
        
        return health_report
    
    def reconnect(self):
        """
        Force reconnection to blockchain network
        
        Returns:
            bool: True if reconnected successfully
        """
        logger.info("Attempting to reconnect to blockchain...")
        
        # Reset connection state
        self.is_connected = False
        self.contract = None
        self.w3 = None
        
        # Attempt new connection
        if self.connect():
            if self.initialize_contract():
                logger.info("Successfully reconnected to blockchain")
                return True
        
        logger.error("Failed to reconnect to blockchain")
        return False


# Global instance for easy access
_connection_manager = None


def get_connection_manager():
    """Factory function to get or create connection manager"""
    global _connection_manager
    if _connection_manager is None:
        _connection_manager = Web3ConnectionManager()
    return _connection_manager


def initialize_web3():
    """
    Initialize Web3 connection globally
    Call this in Django apps.py or settings
    """
    manager = get_connection_manager()
    manager.load_abi()
    if manager.connect():
        manager.initialize_contract()
        logger.info("Web3 globally initialized successfully")
        return True
    else:
        logger.warning("Web3 initialization incomplete - Ganache may not be running")
        return False


# Backward compatibility - direct access
def get_w3():
    """Get Web3 instance (legacy)"""
    manager = get_connection_manager()
    if not manager.is_connected:
        manager.connect()
    return manager.w3


def get_contract():
    """Get contract instance (legacy)"""
    manager = get_connection_manager()
    if not manager.is_connected:
        manager.connect()
    if manager.contract is None:
        manager.load_abi()
        manager.initialize_contract()
    return manager.contract


# For direct imports (backward compatibility)
try:
    manager = get_connection_manager()
    manager.load_abi()
    manager.connect()
    if manager.is_connected:
        manager.initialize_contract()
    
    w3 = manager.w3
    abi = manager.abi
    contract_address = Web3.to_checksum_address(CONTRACT_ADDRESS) if manager.is_connected else CONTRACT_ADDRESS
    contract = manager.contract or None
    
    logger.info("Web3 connection module loaded successfully")
except Exception as e:
    logger.warning(f"Error during module initialization: {e}")
    w3 = None
    abi = None
    contract = None