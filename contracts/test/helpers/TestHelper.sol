// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../../src/SignalFriendMarket.sol";
import "../../src/PredictorAccessPass.sol";
import "../../src/SignalKeyNFT.sol";
import "../../src/MockUSDT.sol";

/**
 * @title TestHelper
 * @notice Base contract for all SignalFriend tests
 * @dev Deploys all real contracts following the two-phase deployment process:
 *      Phase 1: Deploy Market with address(0) for NFTs, then deploy NFTs with Market address
 *      Phase 2: Update NFT addresses in Market via MultiSig
 *      Only MockUSDT is a mock (external dependency we don't control)
 */
contract TestHelper is Test {
    // ============================================
    // CONTRACTS
    // ============================================
    SignalFriendMarket public market;
    PredictorAccessPass public accessPass;
    SignalKeyNFT public signalKey;
    MockUSDT public usdt;

    // ============================================
    // TEST ACCOUNTS
    // ============================================

    /// @notice MultiSig signers (3-of-3)
    address public signer1;
    address public signer2;
    address public signer3;

    /// @notice Platform treasury address
    address public treasury;

    /// @notice Test users
    address public predictor1;
    address public predictor2;
    address public buyer1;
    address public buyer2;
    address public randomUser;

    // ============================================
    // CONSTANTS (matching contract defaults)
    // ============================================

    /// @notice Commission rate: 5% (500 basis points)
    uint256 public constant COMMISSION_RATE = 500;

    /// @notice Basis points denominator
    uint256 public constant BASIS_POINTS = 10000;

    /// @notice Minimum signal price: 5 USDT
    uint256 public constant MIN_SIGNAL_PRICE = 5 * 10 ** 18;

    /// @notice Predictor join fee: 20 USDT
    uint256 public constant PREDICTOR_JOIN_FEE = 20 * 10 ** 18;

    /// @notice Referral payout: 5 USDT
    uint256 public constant REFERRAL_PAYOUT = 5 * 10 ** 18;

    /// @notice Buyer access fee: 0.5 USDT
    uint256 public constant BUYER_ACCESS_FEE = 5 * 10 ** 17;

    /// @notice Action expiry time: 1 hour
    uint256 public constant ACTION_EXPIRY_TIME = 1 hours;

    // ============================================
    // SETUP
    // ============================================

    /**
     * @notice Base setup - creates accounts and deploys all contracts
     * @dev Called automatically before each test. Implements two-phase deployment:
     *      1. Deploy Market with address(0) for NFT contracts
     *      2. Deploy NFT contracts with Market address (immutable)
     *      3. Update Market's NFT addresses via MultiSig
     */
    function setUp() public virtual {
        // Create test accounts with labels for easier debugging
        signer1 = makeAddr("signer1");
        signer2 = makeAddr("signer2");
        signer3 = makeAddr("signer3");
        treasury = makeAddr("treasury");
        predictor1 = makeAddr("predictor1");
        predictor2 = makeAddr("predictor2");
        buyer1 = makeAddr("buyer1");
        buyer2 = makeAddr("buyer2");
        randomUser = makeAddr("randomUser");

        // ============================================
        // PHASE 1: Initial Deployment
        // ============================================

        // Deploy MockUSDT (only mock - external dependency)
        usdt = new MockUSDT();

        // Deploy SignalFriendMarket FIRST with address(0) for NFT contracts
        // This is required because NFT contracts need Market address (immutable)
        market = new SignalFriendMarket(
            address(usdt),
            [signer1, signer2, signer3],
            treasury,
            address(0), // PredictorAccessPass - will be set via MultiSig
            address(0) // SignalKeyNFT - will be set via MultiSig
        );

        // Deploy PredictorAccessPass with Market address (immutable)
        // Note: _initialBaseTokenURI is for NFT metadata (IPFS/Arweave), empty for testing
        accessPass = new PredictorAccessPass(
            address(market),
            [signer1, signer2, signer3],
            "" // Empty for testing - metadata URI not needed
        );

        // Deploy SignalKeyNFT with Market address (immutable)
        // Note: _initialBaseTokenURI is for NFT metadata (IPFS/Arweave), empty for testing
        signalKey = new SignalKeyNFT(
            address(market),
            [signer1, signer2, signer3],
            "" // Empty for testing - metadata URI not needed
        );

        // ============================================
        // PHASE 2: MultiSig Setup (Connect Contracts)
        // ============================================
        _initializeContractsViaMultiSig();
    }

    /**
     * @notice Completes the two-phase deployment by updating NFT addresses in Market
     * @dev Uses MultiSig (3-of-3) to update PredictorAccessPass and SignalKeyNFT addresses
     */
    function _initializeContractsViaMultiSig() internal {
        // Update PredictorAccessPass address in Market (requires 3/3 MultiSig)
        vm.prank(signer1);
        bytes32 actionId1 = market.proposeUpdatePredictorAccessPass(
            address(accessPass)
        );
        vm.prank(signer2);
        market.approveAction(actionId1);
        vm.prank(signer3);
        market.approveAction(actionId1); // Auto-executes on 3rd approval

        // Update SignalKeyNFT address in Market (requires 3/3 MultiSig)
        vm.prank(signer1);
        bytes32 actionId2 = market.proposeUpdateSignalKeyNFT(
            address(signalKey)
        );
        vm.prank(signer2);
        market.approveAction(actionId2);
        vm.prank(signer3);
        market.approveAction(actionId2); // Auto-executes on 3rd approval

        // Verify initialization is complete
        assertTrue(
            market.isFullyInitialized(),
            "Market should be fully initialized"
        );
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * @notice Mints USDT to an address and approves market to spend it
     * @param _to Address to receive USDT
     * @param _amount Amount of USDT to mint
     */
    function _fundUserWithUSDT(address _to, uint256 _amount) internal {
        usdt.mint(_to, _amount);
        vm.prank(_to);
        usdt.approve(address(market), _amount);
    }

    /**
     * @notice Funds user with USDT and gives unlimited approval to market
     * @param _to Address to receive USDT
     * @param _amount Amount of USDT to mint
     */
    function _fundUserWithUSDTAndApproveMax(
        address _to,
        uint256 _amount
    ) internal {
        usdt.mint(_to, _amount);
        vm.prank(_to);
        usdt.approve(address(market), type(uint256).max);
    }

    /**
     * @notice Registers a predictor by funding them and calling joinAsPredictor
     * @param _predictor Address to register as predictor
     */
    function _registerPredictor(address _predictor) internal {
        _fundUserWithUSDT(_predictor, PREDICTOR_JOIN_FEE);
        vm.prank(_predictor);
        market.joinAsPredictor(address(0)); // No referrer
    }

    /**
     * @notice Registers a predictor with a referrer
     * @param _predictor Address to register as predictor
     * @param _referrer Address of the referrer (must be active predictor)
     */
    function _registerPredictorWithReferrer(
        address _predictor,
        address _referrer
    ) internal {
        _fundUserWithUSDT(_predictor, PREDICTOR_JOIN_FEE);
        vm.prank(_predictor);
        market.joinAsPredictor(_referrer);
    }

    /**
     * @notice Buys a signal from a predictor
     * @param _buyer Address buying the signal
     * @param _predictor Address of the predictor
     * @param _price Signal price in USDT (before fees)
     * @param _contentId Content identifier for the signal
     * @return tokenId The minted SignalKeyNFT token ID
     */
    function _buySignal(
        address _buyer,
        address _predictor,
        uint256 _price,
        bytes32 _contentId
    ) internal returns (uint256 tokenId) {
        uint256 totalCost = market.calculateBuyerCost(_price);
        _fundUserWithUSDT(_buyer, totalCost);

        // Get the next token ID before purchase
        uint256 nextTokenId = signalKey.totalMinted() + 1;

        vm.prank(_buyer);
        market.buySignalNFT(_predictor, _price, COMMISSION_RATE, _contentId);

        // Return the minted token ID
        return nextTokenId;
    }

    /**
     * @notice Helper to execute a 3/3 MultiSig action on SignalFriendMarket
     * @dev Assumes signer1 already proposed (auto-approved), so only needs signer2 and signer3
     * @param _actionId The action ID to approve
     */
    function _executeMultiSigAction(bytes32 _actionId) internal {
        vm.prank(signer2);
        market.approveAction(_actionId);
        vm.prank(signer3);
        market.approveAction(_actionId); // Auto-executes on 3rd approval
    }

    /**
     * @notice Helper to execute a 3/3 MultiSig action on PredictorAccessPass
     * @dev Assumes signer1 already proposed (auto-approved), so only needs signer2 and signer3
     * @param _actionId The action ID to approve
     */
    function _executeMultiSigActionOnAccessPass(bytes32 _actionId) internal {
        vm.prank(signer2);
        accessPass.approveAction(_actionId);
        vm.prank(signer3);
        accessPass.approveAction(_actionId); // Auto-executes on 3rd approval
    }

    /**
     * @notice Helper to execute a 3/3 MultiSig action on SignalKeyNFT
     * @dev Assumes signer1 already proposed (auto-approved), so only needs signer2 and signer3
     * @param _actionId The action ID to approve
     */
    function _executeMultiSigActionOnSignalKey(bytes32 _actionId) internal {
        vm.prank(signer2);
        signalKey.approveAction(_actionId);
        vm.prank(signer3);
        signalKey.approveAction(_actionId); // Auto-executes on 3rd approval
    }

    /**
     * @notice Blacklists a predictor via MultiSig
     * @param _predictor Address to blacklist
     */
    function _blacklistPredictor(address _predictor) internal {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeBlacklist(_predictor, true);
        _executeMultiSigActionOnAccessPass(actionId);
    }

    /**
     * @notice Removes a predictor from blacklist via MultiSig
     * @param _predictor Address to unblacklist
     */
    function _unblacklistPredictor(address _predictor) internal {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeBlacklist(_predictor, false);
        _executeMultiSigActionOnAccessPass(actionId);
    }

    /**
     * @notice Pauses the market contract via MultiSig
     */
    function _pauseMarket() internal {
        vm.prank(signer1);
        bytes32 actionId = market.proposePauseContract();
        _executeMultiSigAction(actionId);
    }

    /**
     * @notice Unpauses the market contract via MultiSig
     */
    function _unpauseMarket() internal {
        vm.prank(signer1);
        bytes32 actionId = market.proposeUnpauseContract();
        _executeMultiSigAction(actionId);
    }

    /**
     * @notice Mints a free predictor NFT via MultiSig owner mint
     * @param _to Address to receive the free NFT
     */
    function _ownerMintPredictor(address _to) internal {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(_to);
        _executeMultiSigActionOnAccessPass(actionId);
    }
}
