// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @author SignalFriend Team
 * @notice Mock USDT (BEP-20) contract for testing and BNB testnet deployment
 * @dev This contract mimics Binance-Peg BSC-USD (BSC-USD) with 18 decimals
 * 
 * Key Features:
 * - 18 decimals (matching Binance-Peg BSC-USD on BNB Chain)
 * - Mintable by owner for testing purposes
 * - Can be deployed to BNB testnet for integration testing
 * - Faucet function for easy testnet distribution
 * 
 * Important Note:
 * - On BNB Chain, "USDT" is actually Binance-Peg BSC-USD with 18 decimals
 * - Real BSC-USD BNB mainnet address: 0x55d398326f99059fF775485246999027B3197955
 * - This is NOT the same as Tether USDT (which has 6 decimals on Ethereum)
 */
contract MockUSDT is ERC20, Ownable {
    /// @notice BSC-USD uses 18 decimals (standard ERC20, unlike Tether USDT which has 6)
    uint8 private constant DECIMALS = 18;

    /// @notice Maximum supply cap (optional, for safety in testing)
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**DECIMALS; // 1 billion USDT

    /// @notice Faucet amount per request (100 USDT for testing)
    uint256 public constant FAUCET_AMOUNT = 100 * 10**DECIMALS;

    /// @notice Cooldown period for faucet requests (1 hour)
    uint256 public constant FAUCET_COOLDOWN = 1 hours;

    /// @notice Tracks last faucet claim time per address
    mapping(address => uint256) public lastFaucetClaim;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when tokens are minted
    event Minted(address indexed to, uint256 amount);

    /// @notice Emitted when tokens are claimed from faucet
    event FaucetClaimed(address indexed claimer, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when minting would exceed max supply
    error ExceedsMaxSupply();

    /// @notice Thrown when faucet is claimed too soon
    error FaucetCooldownActive(uint256 timeRemaining);

    /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Initialize the Mock USDT contract
     * @dev Owner is set to msg.sender via Ownable constructor
     * @dev Name matches Binance-Peg BSC-USD for clarity
     */
    constructor() ERC20("Binance-Peg BSC-USD (Mock)", "USDT") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing (10,000 USDT)
        _mint(msg.sender, 10_000 * 10**DECIMALS);
    }

    /*//////////////////////////////////////////////////////////////
                            OVERRIDE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Override decimals to return 18 (BSC-USD standard on BNB Chain)
     * @return uint8 Number of decimals (18)
     */
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /*//////////////////////////////////////////////////////////////
                            MINTING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Mint tokens to a specific address (owner only)
     * @dev Used for setting up test scenarios
     * @param to Address to receive minted tokens
     * @param amount Amount of tokens to mint (in smallest unit, e.g., 1 USDT = 1_000_000)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        if (totalSupply() + amount > MAX_SUPPLY) {
            revert ExceedsMaxSupply();
        }
        _mint(to, amount);
        emit Minted(to, amount);
    }

    /**
     * @notice Batch mint tokens to multiple addresses (owner only)
     * @dev Useful for setting up multiple test accounts
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of amounts to mint (must match recipients length)
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            if (totalSupply() + amounts[i] > MAX_SUPPLY) {
                revert ExceedsMaxSupply();
            }
            _mint(recipients[i], amounts[i]);
            emit Minted(recipients[i], amounts[i]);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            FAUCET FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Public faucet for testnet users to claim test USDT
     * @dev Can be called once per FAUCET_COOLDOWN period per address
     * @dev Useful for BNB testnet deployment to allow users to get test USDT
     */
    function claimFaucet() external {
        uint256 lastClaim = lastFaucetClaim[msg.sender];
        
        if (block.timestamp < lastClaim + FAUCET_COOLDOWN) {
            uint256 timeRemaining = (lastClaim + FAUCET_COOLDOWN) - block.timestamp;
            revert FaucetCooldownActive(timeRemaining);
        }

        if (totalSupply() + FAUCET_AMOUNT > MAX_SUPPLY) {
            revert ExceedsMaxSupply();
        }

        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
        
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
    }

    /**
     * @notice Check if an address can claim from faucet
     * @param account Address to check
     * @return canClaim True if the address can claim
     * @return timeRemaining Seconds remaining until next claim (0 if can claim now)
     */
    function canClaimFaucet(address account) external view returns (bool canClaim, uint256 timeRemaining) {
        uint256 lastClaim = lastFaucetClaim[account];
        uint256 nextClaimTime = lastClaim + FAUCET_COOLDOWN;
        
        if (block.timestamp >= nextClaimTime) {
            return (true, 0);
        } else {
            return (false, nextClaimTime - block.timestamp);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            UTILITY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Convert human-readable USDT amount to smallest unit
     * @dev Helper function for tests and scripts
     * @param amount Amount in USDT (e.g., 100 for 100 USDT)
     * @return uint256 Amount in smallest unit (e.g., 100_000_000 for 100 USDT)
     */
    function toSmallestUnit(uint256 amount) external pure returns (uint256) {
        return amount * 10**DECIMALS;
    }

    /**
     * @notice Convert smallest unit to human-readable USDT amount
     * @dev Helper function for tests and scripts
     * @param amount Amount in smallest unit (e.g., 100_000_000)
     * @return uint256 Amount in USDT (e.g., 100)
     */
    function toUSDT(uint256 amount) external pure returns (uint256) {
        return amount / 10**DECIMALS;
    }
}
