// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ============================================
// INTERFACES
// ============================================

interface IPredictorAccessPass {
    function mintForLogicContract(address _to) external returns (uint256);

    function balanceOf(address _owner) external view returns (uint256);

    function isBlacklisted(address _predictor) external view returns (bool);

    function isPredictorActive(address _predictor) external view returns (bool);
}

interface ISignalKeyNFT {
    function mintForLogicContract(
        address _to,
        bytes32 _contentIdentifier
    ) external returns (uint256);
}

/**
 * @title SignalFriendMarket
 * @notice Logic/Orchestrator contract for the SignalFriend platform
 * @dev This contract implements:
 *      - Predictor registration with referral system
 *      - Signal purchase flow with fee splitting
 *      - USDT payment processing (BEP-20)
 *      - NFT minting orchestration for both PredictorAccessPass and SignalKeyNFT
 *      - 3-of-3 MultiSig governance for all parameters
 *      - Emergency pause mechanism
 *      - Comprehensive view functions for frontend/backend
 *      - ReentrancyGuard protection on all state-changing functions
 */
contract SignalFriendMarket is ReentrancyGuard {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice USDT (BEP-20) token contract address
    address public usdtToken;

    /// @notice PredictorAccessPass NFT contract address
    address public predictorAccessPass;

    /// @notice SignalKeyNFT contract address
    address public signalKeyNFT;

    /// @notice Platform treasury address (Ledger-backed EOA)
    address public platformTreasury;

    /// @notice Array of 3 MultiSig signer addresses
    address[3] public multiSigSigners;

    /// @notice Commission rate in basis points (500 = 5%)
    uint256 public commissionRate;

    /// @notice Minimum signal price in USDT (5 USDT with 18 decimals)
    uint256 public minSignalPrice;

    /// @notice Predictor join fee in USDT (20 USDT with 18 decimals)
    uint256 public predictorJoinFee;

    /// @notice Referral payout in USDT (5 USDT with 18 decimals)
    uint256 public referralPayout;

    /// @notice Buyer access fee in USDT (0.5 USDT with 18 decimals)
    uint256 public buyerAccessFee;

    /// @notice Contract pause status
    bool public paused;

    /// @notice Statistics tracking
    uint256 public totalPredictorsJoined;
    uint256 public totalSignalsPurchased;
    uint256 public totalReferralsPaid;

    // ============================================
    // MULTISIG ACTION STRUCTURES
    // ============================================

    /// @notice Enum defining types of administrative actions
    enum ActionType {
        UPDATE_USDT,
        UPDATE_PREDICTOR_ACCESS_PASS,
        UPDATE_SIGNAL_KEY_NFT,
        UPDATE_TREASURY,
        UPDATE_COMMISSION_RATE,
        UPDATE_MIN_SIGNAL_PRICE,
        UPDATE_PREDICTOR_JOIN_FEE,
        UPDATE_REFERRAL_PAYOUT,
        UPDATE_BUYER_ACCESS_FEE,
        PAUSE_CONTRACT,
        UNPAUSE_CONTRACT
    }

    /// @notice Structure representing a proposed action
    struct Action {
        ActionType actionType;
        address newAddress; // Used for address updates
        uint256 newValue; // Used for uint256 updates
        uint256 proposalTime; // Timestamp when action was proposed
        uint8 approvalCount; // Number of approvals received
        bool executed; // Whether action has been executed
        mapping(address => bool) hasApproved; // Tracks which signers have approved
    }

    /// @notice Mapping from action ID to Action struct
    mapping(bytes32 => Action) public actions;

    /// @notice Array to track all action IDs for cleanup
    bytes32[] private _actionIds;

    /// @notice Time limit for action approvals (1 hour)
    uint256 public constant ACTION_EXPIRY_TIME = 1 hours;

    /// @notice Basis points divisor (10000 = 100%)
    uint256 public constant BASIS_POINTS = 10000;

    // ============================================
    // CUSTOM ERRORS
    // ============================================

    error OnlyMultiSigSigner();
    error ContractNotInitialized();
    error ContractCurrentlyPaused();
    error InvalidUSDTAddress();
    error InvalidPredictorAccessPassAddress();
    error InvalidSignalKeyNFTAddress();
    error InvalidTreasuryAddress();
    error InvalidCommissionRate();
    error InvalidSignerAddress();
    error DuplicateSignerAddress();
    error ActionAlreadyExecuted();
    error ActionExpired();
    error AlreadyApproved();
    error ActionDoesNotExist();
    error AlreadyHasPredictorNFT();
    error PredictorBlacklisted();
    error SignalPriceTooLow();
    error InsufficientAllowance();
    error USDTTransferFailed();
    error InvalidPredictor();

    // ============================================
    // EVENTS
    // ============================================

    event PredictorJoined(
        address indexed predictor,
        address indexed referrer,
        uint256 nftTokenId,
        bool referralPaid
    );
    event SignalPurchased(
        address indexed buyer,
        address indexed predictor,
        uint256 indexed receiptTokenId,
        bytes32 contentIdentifier,
        uint256 signalPrice,
        uint256 totalCost
    );
    event USDTAddressUpdated(address oldAddress, address newAddress);
    event PredictorAccessPassUpdated(address oldAddress, address newAddress);
    event SignalKeyNFTUpdated(address oldAddress, address newAddress);
    event TreasuryUpdated(address oldAddress, address newAddress);
    event CommissionRateUpdated(uint256 oldRate, uint256 newRate);
    event MinSignalPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event PredictorJoinFeeUpdated(uint256 oldFee, uint256 newFee);
    event ReferralPayoutUpdated(uint256 oldPayout, uint256 newPayout);
    event BuyerAccessFeeUpdated(uint256 oldFee, uint256 newFee);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);
    event ActionProposed(
        bytes32 indexed actionId,
        ActionType actionType,
        address indexed proposer,
        uint256 expiryTime
    );
    event ActionApproved(
        bytes32 indexed actionId,
        address indexed approver,
        uint8 approvalCount
    );
    event ActionExecuted(bytes32 indexed actionId, ActionType actionType);
    event ActionCleaned(bytes32 indexed actionId, ActionType actionType);

    // ============================================
    // MODIFIERS
    // ============================================

    /// @notice Restricts function access to MultiSig signers only
    modifier onlyMultiSigSigner() {
        bool isSigner = false;
        for (uint256 i = 0; i < 3; i++) {
            if (msg.sender == multiSigSigners[i]) {
                isSigner = true;
                break;
            }
        }
        if (!isSigner) {
            revert OnlyMultiSigSigner();
        }
        _;
    }

    /// @notice Ensures all contract addresses are initialized
    modifier contractsInitialized() {
        if (usdtToken == address(0)) revert ContractNotInitialized();
        if (predictorAccessPass == address(0)) revert ContractNotInitialized();
        if (signalKeyNFT == address(0)) revert ContractNotInitialized();
        _;
    }

    /// @notice Ensures contract is not paused
    modifier whenNotPaused() {
        if (paused) revert ContractCurrentlyPaused();
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initializes the SignalFriendMarket contract
     * @param _usdt Address of USDT (BEP-20) token (can be address(0) initially for testing)
     * @param _multiSigSigners Array of 3 MultiSig signer addresses
     * @param _platformTreasury Platform treasury address
     * @param _predictorAccessPass Address of PredictorAccessPass contract (can be address(0) initially)
     * @param _signalKeyNFT Address of SignalKeyNFT contract (can be address(0) initially)
     */
    constructor(
        address _usdt,
        address[3] memory _multiSigSigners,
        address _platformTreasury,
        address _predictorAccessPass,
        address _signalKeyNFT
    ) {
        if (_platformTreasury == address(0)) {
            revert InvalidTreasuryAddress();
        }

        // Validate MultiSig signers
        for (uint256 i = 0; i < 3; i++) {
            if (_multiSigSigners[i] == address(0)) {
                revert InvalidSignerAddress();
            }
            // Check for duplicates
            for (uint256 j = i + 1; j < 3; j++) {
                if (_multiSigSigners[i] == _multiSigSigners[j]) {
                    revert DuplicateSignerAddress();
                }
            }
        }

        // Set addresses (can be address(0) for NFT contracts initially)
        usdtToken = _usdt;
        predictorAccessPass = _predictorAccessPass;
        signalKeyNFT = _signalKeyNFT;
        platformTreasury = _platformTreasury;
        multiSigSigners = _multiSigSigners;

        // Initialize default parameters (18 decimals for USDT amounts)
        commissionRate = 500; // 5%
        minSignalPrice = 5 * 10 ** 18; // 5 USDT
        predictorJoinFee = 20 * 10 ** 18; // 20 USDT
        referralPayout = 5 * 10 ** 18; // 5 USDT
        buyerAccessFee = 5 * 10 ** 17; // 0.5 USDT

        paused = false;
    }

    // ============================================
    // CORE BUSINESS FUNCTIONS
    // ============================================

    /**
     * @notice Register as a Predictor by paying join fee
     * @dev Mints PredictorAccessPass NFT and handles referral payout
     * @param _referrer Address of referring predictor (can be address(0) if no referrer)
     */
    function joinAsPredictor(
        address _referrer
    ) external contractsInitialized whenNotPaused nonReentrant {
        // Check if caller already has Predictor NFT
        if (
            IPredictorAccessPass(predictorAccessPass).balanceOf(msg.sender) > 0
        ) {
            revert AlreadyHasPredictorNFT();
        }

        // Check USDT allowance
        uint256 allowance = IERC20(usdtToken).allowance(
            msg.sender,
            address(this)
        );
        if (allowance < predictorJoinFee) {
            revert InsufficientAllowance();
        }

        // CEI Pattern: Update state BEFORE external calls (CEI stands for Checks-Effects-Interactions)
        totalPredictorsJoined++;

        bool referralPaid = false;
        uint256 treasuryAmount = predictorJoinFee;

        // Transfer USDT from caller to this contract first
        bool transferSuccess = IERC20(usdtToken).transferFrom(
            msg.sender,
            address(this),
            predictorJoinFee
        );
        if (!transferSuccess) revert USDTTransferFailed();

        // Handle referral logic
        if (_referrer != address(0) && _referrer != msg.sender) {
            // Check if referrer has valid Predictor NFT
            if (
                IPredictorAccessPass(predictorAccessPass).balanceOf(_referrer) >
                0 &&
                !IPredictorAccessPass(predictorAccessPass).isBlacklisted(
                    _referrer
                )
            ) {
                // CEI Pattern: Update state BEFORE external call
                totalReferralsPaid++;

                // Pay referrer
                bool referrerPaymentSuccess = IERC20(usdtToken).transfer(
                    _referrer,
                    referralPayout
                );
                if (!referrerPaymentSuccess) revert USDTTransferFailed();

                treasuryAmount = predictorJoinFee - referralPayout;
                referralPaid = true;
            }
            // If referrer is invalid, full amount goes to treasury (no change to treasuryAmount)
        }

        // Send remaining amount to treasury
        bool treasuryPaymentSuccess = IERC20(usdtToken).transfer(
            platformTreasury,
            treasuryAmount
        );
        if (!treasuryPaymentSuccess) revert USDTTransferFailed();

        // Mint Predictor Access Pass NFT
        uint256 nftTokenId = IPredictorAccessPass(predictorAccessPass)
            .mintForLogicContract(msg.sender);

        emit PredictorJoined(msg.sender, _referrer, nftTokenId, referralPaid);
    }

    /**
     * @notice Purchase a signal by paying predictor and platform fees
     * @dev Mints SignalKeyNFT receipt and handles fee splitting
     * @param _predictor Address of the predictor selling the signal
     * @param _priceUSDT Price of the signal in USDT (must match frontend quote)
     * @param _maxCommissionRate Maximum acceptable commission rate (front-running protection)
     * @param _contentIdentifier Non-unique content ID linking to signal data
     */
    function buySignalNFT(
        address _predictor,
        uint256 _priceUSDT,
        uint256 _maxCommissionRate,
        bytes32 _contentIdentifier
    ) external contractsInitialized whenNotPaused nonReentrant {
        // Validate signal price
        if (_priceUSDT < minSignalPrice) {
            revert SignalPriceTooLow();
        }

        // Front-running protection: Ensure commission rate hasn't increased beyond user's expectation
        if (commissionRate > _maxCommissionRate) {
            revert InvalidCommissionRate();
        }

        // Validate predictor
        if (
            !IPredictorAccessPass(predictorAccessPass).isPredictorActive(
                _predictor
            )
        ) {
            revert InvalidPredictor();
        }

        // Calculate commission (5% of signal price by default)
        uint256 commission = (_priceUSDT * commissionRate) / BASIS_POINTS;
        uint256 predictorPayout = _priceUSDT - commission;
        uint256 platformEarnings = commission + buyerAccessFee;
        uint256 totalCost = _priceUSDT + buyerAccessFee;

        // Check USDT allowance
        uint256 allowance = IERC20(usdtToken).allowance(
            msg.sender,
            address(this)
        );
        if (allowance < totalCost) {
            revert InsufficientAllowance();
        }

        // CEI Pattern: Update state BEFORE external calls
        totalSignalsPurchased++;

        // Transfer total USDT from buyer to this contract
        bool success = IERC20(usdtToken).transferFrom(
            msg.sender,
            address(this),
            totalCost
        );
        if (!success) revert USDTTransferFailed();

        // Transfer to predictor
        success = IERC20(usdtToken).transfer(_predictor, predictorPayout);
        if (!success) revert USDTTransferFailed();

        // Transfer to platform treasury
        success = IERC20(usdtToken).transfer(
            platformTreasury,
            platformEarnings
        );
        if (!success) revert USDTTransferFailed();

        // Mint Signal Key NFT receipt
        uint256 receiptTokenId = ISignalKeyNFT(signalKeyNFT)
            .mintForLogicContract(msg.sender, _contentIdentifier);

        emit SignalPurchased(
            msg.sender,
            _predictor,
            receiptTokenId,
            _contentIdentifier,
            _priceUSDT,
            totalCost
        );
    }

    // ============================================
    // MULTISIG ADMINISTRATIVE FUNCTIONS
    // ============================================

    /**
     * @notice Proposes to update USDT token address
     * @param _newUSDT New USDT token address
     */
    function proposeUpdateUSDT(
        address _newUSDT
    ) external onlyMultiSigSigner returns (bytes32) {
        if (_newUSDT == address(0)) revert InvalidUSDTAddress();

        bytes32 actionId = keccak256(
            abi.encodePacked(ActionType.UPDATE_USDT, _newUSDT, block.timestamp)
        );

        _createAction(actionId, ActionType.UPDATE_USDT, _newUSDT, 0);
        return actionId;
    }

    /**
     * @notice Proposes to update PredictorAccessPass contract address
     * @param _newAddress New PredictorAccessPass address
     */
    function proposeUpdatePredictorAccessPass(
        address _newAddress
    ) external onlyMultiSigSigner returns (bytes32) {
        if (_newAddress == address(0))
            revert InvalidPredictorAccessPassAddress();

        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_PREDICTOR_ACCESS_PASS,
                _newAddress,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_PREDICTOR_ACCESS_PASS,
            _newAddress,
            0
        );
        return actionId;
    }

    /**
     * @notice Proposes to update SignalKeyNFT contract address
     * @param _newAddress New SignalKeyNFT address
     */
    function proposeUpdateSignalKeyNFT(
        address _newAddress
    ) external onlyMultiSigSigner returns (bytes32) {
        if (_newAddress == address(0)) revert InvalidSignalKeyNFTAddress();

        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_SIGNAL_KEY_NFT,
                _newAddress,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_SIGNAL_KEY_NFT,
            _newAddress,
            0
        );
        return actionId;
    }

    /**
     * @notice Proposes to update platform treasury address
     * @param _newTreasury New treasury address
     */
    function proposeUpdateTreasury(
        address _newTreasury
    ) external onlyMultiSigSigner returns (bytes32) {
        if (_newTreasury == address(0)) revert InvalidTreasuryAddress();

        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_TREASURY,
                _newTreasury,
                block.timestamp
            )
        );

        _createAction(actionId, ActionType.UPDATE_TREASURY, _newTreasury, 0);
        return actionId;
    }

    /**
     * @notice Proposes to update commission rate
     * @param _newRate New commission rate in basis points (e.g., 500 = 5%)
     */
    function proposeUpdateCommissionRate(
        uint256 _newRate
    ) external onlyMultiSigSigner returns (bytes32) {
        if (_newRate > BASIS_POINTS) revert InvalidCommissionRate();

        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_COMMISSION_RATE,
                _newRate,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_COMMISSION_RATE,
            address(0),
            _newRate
        );
        return actionId;
    }

    /**
     * @notice Proposes to update minimum signal price
     * @param _newPrice New minimum signal price in USDT
     */
    function proposeUpdateMinSignalPrice(
        uint256 _newPrice
    ) external onlyMultiSigSigner returns (bytes32) {
        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_MIN_SIGNAL_PRICE,
                _newPrice,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_MIN_SIGNAL_PRICE,
            address(0),
            _newPrice
        );
        return actionId;
    }

    /**
     * @notice Proposes to update predictor join fee
     * @param _newFee New join fee in USDT
     */
    function proposeUpdatePredictorJoinFee(
        uint256 _newFee
    ) external onlyMultiSigSigner returns (bytes32) {
        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_PREDICTOR_JOIN_FEE,
                _newFee,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_PREDICTOR_JOIN_FEE,
            address(0),
            _newFee
        );
        return actionId;
    }

    /**
     * @notice Proposes to update referral payout amount
     * @param _newPayout New referral payout in USDT
     */
    function proposeUpdateReferralPayout(
        uint256 _newPayout
    ) external onlyMultiSigSigner returns (bytes32) {
        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_REFERRAL_PAYOUT,
                _newPayout,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_REFERRAL_PAYOUT,
            address(0),
            _newPayout
        );
        return actionId;
    }

    /**
     * @notice Proposes to update buyer access fee
     * @param _newFee New buyer access fee in USDT
     */
    function proposeUpdateBuyerAccessFee(
        uint256 _newFee
    ) external onlyMultiSigSigner returns (bytes32) {
        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_BUYER_ACCESS_FEE,
                _newFee,
                block.timestamp
            )
        );

        _createAction(
            actionId,
            ActionType.UPDATE_BUYER_ACCESS_FEE,
            address(0),
            _newFee
        );
        return actionId;
    }

    /**
     * @notice Proposes to pause the contract
     */
    function proposePauseContract()
        external
        onlyMultiSigSigner
        returns (bytes32)
    {
        bytes32 actionId = keccak256(
            abi.encodePacked(ActionType.PAUSE_CONTRACT, block.timestamp)
        );

        _createAction(actionId, ActionType.PAUSE_CONTRACT, address(0), 0);
        return actionId;
    }

    /**
     * @notice Proposes to unpause the contract
     */
    function proposeUnpauseContract()
        external
        onlyMultiSigSigner
        returns (bytes32)
    {
        bytes32 actionId = keccak256(
            abi.encodePacked(ActionType.UNPAUSE_CONTRACT, block.timestamp)
        );

        _createAction(actionId, ActionType.UNPAUSE_CONTRACT, address(0), 0);
        return actionId;
    }

    // ============================================
    // MULTISIG APPROVAL FUNCTIONS
    // ============================================

    /**
     * @notice Internal function to create a new action
     */
    function _createAction(
        bytes32 _actionId,
        ActionType _actionType,
        address _newAddress,
        uint256 _newValue
    ) internal {
        Action storage action = actions[_actionId];
        action.actionType = _actionType;
        action.newAddress = _newAddress;
        action.newValue = _newValue;
        action.proposalTime = block.timestamp;
        action.approvalCount = 0;
        action.executed = false;

        _actionIds.push(_actionId);

        emit ActionProposed(
            _actionId,
            _actionType,
            msg.sender,
            block.timestamp + ACTION_EXPIRY_TIME
        );

        // Auto-approve for the proposer
        _approveAction(_actionId);
    }

    /**
     * @notice Approves a proposed action
     * @dev When 3rd approval is received, action auto-executes
     * @param _actionId The unique identifier of the action to approve
     */
    function approveAction(bytes32 _actionId) external onlyMultiSigSigner {
        _approveAction(_actionId);
    }

    /**
     * @notice Internal function to handle action approval and execution
     * @param _actionId The unique identifier of the action to approve
     */
    function _approveAction(bytes32 _actionId) internal {
        Action storage action = actions[_actionId];

        if (action.proposalTime == 0) {
            revert ActionDoesNotExist();
        }
        if (action.executed) {
            revert ActionAlreadyExecuted();
        }
        if (block.timestamp > action.proposalTime + ACTION_EXPIRY_TIME) {
            revert ActionExpired();
        }
        if (action.hasApproved[msg.sender]) {
            revert AlreadyApproved();
        }

        action.hasApproved[msg.sender] = true;
        action.approvalCount++;

        emit ActionApproved(_actionId, msg.sender, action.approvalCount);

        // Execute if we have 3 approvals
        if (action.approvalCount == 3) {
            _executeAction(_actionId);
        }
    }

    /**
     * @notice Internal function to execute an approved action
     * @param _actionId The unique identifier of the action to execute
     */
    function _executeAction(bytes32 _actionId) internal {
        Action storage action = actions[_actionId];
        action.executed = true;

        if (action.actionType == ActionType.UPDATE_USDT) {
            address oldAddress = usdtToken;
            usdtToken = action.newAddress;
            emit USDTAddressUpdated(oldAddress, action.newAddress);
        } else if (
            action.actionType == ActionType.UPDATE_PREDICTOR_ACCESS_PASS
        ) {
            address oldAddress = predictorAccessPass;
            predictorAccessPass = action.newAddress;
            emit PredictorAccessPassUpdated(oldAddress, action.newAddress);
        } else if (action.actionType == ActionType.UPDATE_SIGNAL_KEY_NFT) {
            address oldAddress = signalKeyNFT;
            signalKeyNFT = action.newAddress;
            emit SignalKeyNFTUpdated(oldAddress, action.newAddress);
        } else if (action.actionType == ActionType.UPDATE_TREASURY) {
            address oldAddress = platformTreasury;
            platformTreasury = action.newAddress;
            emit TreasuryUpdated(oldAddress, action.newAddress);
        } else if (action.actionType == ActionType.UPDATE_COMMISSION_RATE) {
            uint256 oldRate = commissionRate;
            commissionRate = action.newValue;
            emit CommissionRateUpdated(oldRate, action.newValue);
        } else if (action.actionType == ActionType.UPDATE_MIN_SIGNAL_PRICE) {
            uint256 oldPrice = minSignalPrice;
            minSignalPrice = action.newValue;
            emit MinSignalPriceUpdated(oldPrice, action.newValue);
        } else if (action.actionType == ActionType.UPDATE_PREDICTOR_JOIN_FEE) {
            uint256 oldFee = predictorJoinFee;
            predictorJoinFee = action.newValue;
            emit PredictorJoinFeeUpdated(oldFee, action.newValue);
        } else if (action.actionType == ActionType.UPDATE_REFERRAL_PAYOUT) {
            uint256 oldPayout = referralPayout;
            referralPayout = action.newValue;
            emit ReferralPayoutUpdated(oldPayout, action.newValue);
        } else if (action.actionType == ActionType.UPDATE_BUYER_ACCESS_FEE) {
            uint256 oldFee = buyerAccessFee;
            buyerAccessFee = action.newValue;
            emit BuyerAccessFeeUpdated(oldFee, action.newValue);
        } else if (action.actionType == ActionType.PAUSE_CONTRACT) {
            paused = true;
            emit ContractPaused(msg.sender);
        } else if (action.actionType == ActionType.UNPAUSE_CONTRACT) {
            paused = false;
            emit ContractUnpaused(msg.sender);
        }

        emit ActionExecuted(_actionId, action.actionType);
    }

    /**
     * @notice Cleans up expired or executed actions to save gas
     * @param _actionId The unique identifier of the action to clean
     */
    function cleanAction(bytes32 _actionId) external {
        Action storage action = actions[_actionId];

        if (action.proposalTime == 0) {
            revert ActionDoesNotExist();
        }

        bool shouldClean = action.executed ||
            (block.timestamp > action.proposalTime + ACTION_EXPIRY_TIME);

        if (shouldClean) {
            emit ActionCleaned(_actionId, action.actionType);
            delete actions[_actionId];

            // Remove from action IDs array
            for (uint256 i = 0; i < _actionIds.length; i++) {
                if (_actionIds[i] == _actionId) {
                    _actionIds[i] = _actionIds[_actionIds.length - 1];
                    _actionIds.pop();
                    break;
                }
            }
        }
    }

    /**
     * @notice Batch clean multiple actions
     * @param _actionIdsToClear Array of action IDs to clean
     */
    function batchCleanActions(bytes32[] calldata _actionIdsToClear) external {
        for (uint256 i = 0; i < _actionIdsToClear.length; i++) {
            bytes32 actionId = _actionIdsToClear[i];
            Action storage action = actions[actionId];

            if (action.proposalTime == 0) continue;

            bool shouldClean = action.executed ||
                (block.timestamp > action.proposalTime + ACTION_EXPIRY_TIME);

            if (shouldClean) {
                emit ActionCleaned(actionId, action.actionType);
                delete actions[actionId];

                // Remove from action IDs array
                for (uint256 j = 0; j < _actionIds.length; j++) {
                    if (_actionIds[j] == actionId) {
                        _actionIds[j] = _actionIds[_actionIds.length - 1];
                        _actionIds.pop();
                        break;
                    }
                }
            }
        }
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Returns all platform parameters
     * @return _minSignalPrice Minimum signal price
     * @return _predictorJoinFee Predictor join fee
     * @return _referralPayout Referral payout amount
     * @return _buyerAccessFee Buyer access fee
     * @return _commissionRate Commission rate in basis points
     */
    function getPlatformParameters()
        external
        view
        returns (
            uint256 _minSignalPrice,
            uint256 _predictorJoinFee,
            uint256 _referralPayout,
            uint256 _buyerAccessFee,
            uint256 _commissionRate
        )
    {
        return (
            minSignalPrice,
            predictorJoinFee,
            referralPayout,
            buyerAccessFee,
            commissionRate
        );
    }

    /**
     * @notice Checks if an address is a valid predictor
     * @param _predictor Address to check
     * @return True if predictor is valid (has NFT and not blacklisted)
     */
    function isValidPredictor(address _predictor) external view returns (bool) {
        if (predictorAccessPass == address(0)) return false;
        return
            IPredictorAccessPass(predictorAccessPass).isPredictorActive(
                _predictor
            );
    }

    /**
     * @notice Calculates total cost for buyer (signal price + access fee)
     * @param _signalPrice Signal price in USDT
     * @return Total cost including access fee
     */
    function calculateBuyerCost(
        uint256 _signalPrice
    ) external view returns (uint256) {
        return _signalPrice + buyerAccessFee;
    }

    /**
     * @notice Calculates predictor payout (signal price - commission)
     * @param _signalPrice Signal price in USDT
     * @return Predictor's payout amount
     */
    function calculatePredictorPayout(
        uint256 _signalPrice
    ) external view returns (uint256) {
        uint256 commission = (_signalPrice * commissionRate) / BASIS_POINTS;
        return _signalPrice - commission;
    }

    /**
     * @notice Calculates platform earnings (commission + access fee)
     * @param _signalPrice Signal price in USDT
     * @return Platform's earnings
     */
    function calculatePlatformEarnings(
        uint256 _signalPrice
    ) external view returns (uint256) {
        uint256 commission = (_signalPrice * commissionRate) / BASIS_POINTS;
        return commission + buyerAccessFee;
    }

    /**
     * @notice Checks if contract is fully initialized
     * @return True if all required addresses are set
     */
    function isFullyInitialized() external view returns (bool) {
        return
            usdtToken != address(0) &&
            predictorAccessPass != address(0) &&
            signalKeyNFT != address(0);
    }

    /**
     * @notice Gets approval count for a specific action
     * @param _actionId Action ID to query
     * @return Number of approvals received
     */
    function getActionApprovals(
        bytes32 _actionId
    ) external view returns (uint8) {
        return actions[_actionId].approvalCount;
    }

    /**
     * @notice Checks if an action has been executed
     * @param _actionId Action ID to query
     * @return True if executed
     */
    function isActionExecuted(bytes32 _actionId) external view returns (bool) {
        return actions[_actionId].executed;
    }

    /**
     * @notice Checks if an action has expired
     * @param _actionId Action ID to query
     * @return True if expired
     */
    function isActionExpired(bytes32 _actionId) external view returns (bool) {
        Action storage action = actions[_actionId];
        if (action.proposalTime == 0) return false;
        return block.timestamp > action.proposalTime + ACTION_EXPIRY_TIME;
    }

    /**
     * @notice Checks if a signer has approved a specific action
     * @param _actionId Action ID to query
     * @param _signer Signer address to check
     * @return True if the signer has approved
     */
    function hasSignerApproved(
        bytes32 _actionId,
        address _signer
    ) external view returns (bool) {
        return actions[_actionId].hasApproved[_signer];
    }

    /**
     * @notice Gets all tracked action IDs (pending, executed, and expired)
     * @dev Includes all actions until they are manually cleaned via cleanAction()
     * @dev To filter for only pending actions, check each action's executed status and expiry time
     * @return Array of action IDs
     */
    function getAllActionIds() external view returns (bytes32[] memory) {
        return _actionIds;
    }

    /**
     * @notice Gets action details
     * @param _actionId Action ID to query
     * @return actionType Type of action
     * @return newAddress New address (for address updates)
     * @return newValue New value (for uint256 updates)
     * @return proposalTime When action was proposed
     * @return approvalCount Number of approvals
     * @return executed Whether action was executed
     */
    function getActionDetails(
        bytes32 _actionId
    )
        external
        view
        returns (
            ActionType actionType,
            address newAddress,
            uint256 newValue,
            uint256 proposalTime,
            uint8 approvalCount,
            bool executed
        )
    {
        Action storage action = actions[_actionId];
        return (
            action.actionType,
            action.newAddress,
            action.newValue,
            action.proposalTime,
            action.approvalCount,
            action.executed
        );
    }

    /**
     * @notice Gets all MultiSig signer addresses
     * @return Array of 3 signer addresses
     */
    function getSigners() external view returns (address[3] memory) {
        return multiSigSigners;
    }

    /**
     * @notice Gets the expiration timestamp for an action
     * @param _actionId Action ID to query
     * @return Expiration timestamp (proposalTime + ACTION_EXPIRY_TIME)
     */
    function getActionExpirationTime(
        bytes32 _actionId
    ) external view returns (uint256) {
        return actions[_actionId].proposalTime + ACTION_EXPIRY_TIME;
    }
}
