// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SignalKeyNFT
 * @notice Transferable ERC-721 NFT representing a Trader's receipt/key to unlock signal content
 * @dev This contract implements:
 *      - Standard transferable ERC-721 functionality
 *      - Storage of non-unique contentIdentifier (links to signal content)
 *      - Minting only via SignalFriendMarket (Logic) contract
 *      - 3-of-3 MultiSig governance for administrative actions
 *      - Fixed metadata URI for all tokens
 *      - ReentrancyGuard protection on minting functions
 */
contract SignalKeyNFT is ERC721, ReentrancyGuard {
    // ============================================
    // STATE VARIABLES
    // ============================================

    /// @notice Counter for token IDs, starting from 1
    uint256 private _nextTokenId;

    /// @notice Address of the SignalFriendMarket (Logic/Orchestrator) contract
    address public immutable signalFriendMarket;

    /// @notice Array of 3 MultiSig signer addresses
    address[3] public multiSigSigners;

    /// @notice Fixed URI for all token metadata
    string private _baseTokenURI;

    /// @notice Mapping from tokenId to non-unique content identifier
    mapping(uint256 => bytes32) private _contentIdentifiers;

    /// @notice Mapping from owner address to array of owned token IDs
    mapping(address => uint256[]) private _ownedTokens;

    /// @notice Mapping from tokenId to index in owner's token array
    mapping(uint256 => uint256) private _ownedTokensIndex;

    // ============================================
    // MULTISIG ACTION STRUCTURES
    // ============================================

    /// @notice Enum defining types of administrative actions
    enum ActionType {
        UPDATE_METADATA_URI
    }

    /// @notice Structure representing a proposed action
    struct Action {
        ActionType actionType;
        string newMetadataURI; // Used for UPDATE_METADATA_URI
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

    // ============================================
    // CUSTOM ERRORS
    // ============================================

    error OnlySignalFriendMarket();
    error OnlyMultiSigSigner();
    error TokenDoesNotExist(uint256 tokenId);
    error CannotMintToZeroAddress();
    error InvalidSignerAddress();
    error DuplicateSignerAddress();
    error ActionAlreadyExecuted();
    error ActionExpired();
    error AlreadyApproved();
    error ActionDoesNotExist();

    // ============================================
    // EVENTS
    // ============================================

    event SignalReceiptMinted(
        address indexed buyer,
        uint256 indexed tokenId,
        bytes32 indexed contentIdentifier
    );
    event MetadataURIUpdated(string oldURI, string newURI);
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

    /// @notice Restricts function access to the SignalFriendMarket contract only
    modifier onlyLogicContract() {
        if (msg.sender != signalFriendMarket) {
            revert OnlySignalFriendMarket();
        }
        _;
    }

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

    // ============================================
    // CONSTRUCTOR
    // ============================================

    /**
     * @notice Initializes the SignalKeyNFT contract
     * @param _signalFriendMarketAddress Address of the SignalFriendMarket (Logic) contract
     * @param _multiSigSigners Array of 3 MultiSig signer addresses
     * @param _initialBaseTokenURI Fixed metadata URI for all tokens
     */
    constructor(
        address _signalFriendMarketAddress,
        address[3] memory _multiSigSigners,
        string memory _initialBaseTokenURI
    ) ERC721("SignalFriend Signal Key", "SFSK") {
        if (_signalFriendMarketAddress == address(0)) {
            revert CannotMintToZeroAddress();
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

        signalFriendMarket = _signalFriendMarketAddress;
        multiSigSigners = _multiSigSigners;
        _baseTokenURI = _initialBaseTokenURI;

        // Initialize token counter to start from 1
        _nextTokenId = 1;
    }

    // ============================================
    // MINTING FUNCTIONS
    // ============================================

    /**
     * @notice Mints a Signal Key NFT receipt through the Logic contract (after payment)
     * @dev Only callable by the SignalFriendMarket contract after payment verification
     * @param _to Address receiving the NFT receipt
     * @param _contentIdentifier Non-unique content ID linking to signal data
     * @return tokenId The newly minted token ID
     */
    function mintForLogicContract(
        address _to,
        bytes32 _contentIdentifier
    ) external onlyLogicContract nonReentrant returns (uint256) {
        if (_to == address(0)) {
            revert CannotMintToZeroAddress();
        }

        uint256 newTokenId = _nextTokenId;
        _mint(_to, newTokenId);

        _contentIdentifiers[newTokenId] = _contentIdentifier;
        _nextTokenId++;

        emit SignalReceiptMinted(_to, newTokenId, _contentIdentifier);

        return newTokenId;
    }

    // ============================================
    // METADATA FUNCTIONS
    // ============================================

    /**
     * @notice Proposes to update the base token URI for all NFTs
     * @dev Requires 3-of-3 MultiSig approval to execute
     * @param _newURI New metadata URI
     * @return actionId The unique identifier for this proposed action
     */
    function proposeUpdateMetadataURI(
        string memory _newURI
    ) external onlyMultiSigSigner returns (bytes32) {
        bytes32 actionId = keccak256(
            abi.encodePacked(
                ActionType.UPDATE_METADATA_URI,
                _newURI,
                block.timestamp
            )
        );

        Action storage action = actions[actionId];
        action.actionType = ActionType.UPDATE_METADATA_URI;
        action.newMetadataURI = _newURI;
        action.proposalTime = block.timestamp;
        action.approvalCount = 0;
        action.executed = false;

        _actionIds.push(actionId);

        emit ActionProposed(
            actionId,
            ActionType.UPDATE_METADATA_URI,
            msg.sender,
            block.timestamp + ACTION_EXPIRY_TIME
        );

        // Auto-approve for the proposer
        _approveAction(actionId);

        return actionId;
    }

    /**
     * @notice Internal function to update metadata URI
     * @param _newURI New metadata URI
     */
    function _updateMetadataURI(string memory _newURI) internal {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = _newURI;
        emit MetadataURIUpdated(oldURI, _newURI);
    }

    /**
     * @notice Returns the token URI for a given token ID
     * @param tokenId The token ID to query
     * @return The token URI
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) {
            revert TokenDoesNotExist(tokenId);
        }
        return _baseTokenURI;
    }

    // ============================================
    // MULTISIG APPROVAL FUNCTIONS
    // ============================================

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

        if (action.actionType == ActionType.UPDATE_METADATA_URI) {
            _updateMetadataURI(action.newMetadataURI);
        }

        emit ActionExecuted(_actionId, action.actionType);
    }

    /**
     * @notice Cleans up expired or executed actions to save gas
     * @dev Can be called by anyone to help maintain contract state
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
    // TOKEN OWNERSHIP TRACKING (OVERRIDE _update)
    // ============================================

    /**
     * @notice Overrides ERC721 _update to maintain token ownership arrays
     * @dev Tracks owned tokens per address for tokensOfOwner() function
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);

        // Remove token from previous owner's array
        if (from != address(0)) {
            _removeTokenFromOwnerEnumeration(from, tokenId);
        }

        // Add token to new owner's array
        if (to != address(0)) {
            _addTokenToOwnerEnumeration(to, tokenId);
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Adds a token to an owner's token array
     * @param to Owner address
     * @param tokenId Token ID to add
     */
    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        _ownedTokensIndex[tokenId] = _ownedTokens[to].length;
        _ownedTokens[to].push(tokenId);
    }

    /**
     * @notice Removes a token from an owner's token array
     * @param from Owner address
     * @param tokenId Token ID to remove
     */
    function _removeTokenFromOwnerEnumeration(
        address from,
        uint256 tokenId
    ) private {
        uint256 lastTokenIndex = _ownedTokens[from].length - 1;
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        // Move the last token to the slot of the token to delete
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];
            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        // Remove the last token
        _ownedTokens[from].pop();
        delete _ownedTokensIndex[tokenId];
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Returns the total number of NFTs minted
     * @return Total minted count
     */
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    /**
     * @notice Gets the content identifier for a specific token
     * @dev Critical function for Express backend to retrieve signal contentId
     * @param _tokenId Token ID to query
     * @return Content identifier linked to this token
     */
    function getContentIdentifier(
        uint256 _tokenId
    ) external view returns (bytes32) {
        if (_ownerOf(_tokenId) == address(0)) {
            revert TokenDoesNotExist(_tokenId);
        }
        return _contentIdentifiers[_tokenId];
    }

    /**
     * @notice Gets all token IDs owned by an address
     * @dev Used by frontend for "My Signals" page
     * @param _owner Address to query
     * @return Array of token IDs owned by the address
     */
    function tokensOfOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return _ownedTokens[_owner];
    }

    /**
     * @notice Checks if a token exists
     * @param _tokenId Token ID to check
     * @return True if token exists
     */
    function exists(uint256 _tokenId) external view returns (bool) {
        return _ownerOf(_tokenId) != address(0);
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
     * @notice Gets the current base token URI
     * @return The base token URI
     */
    function getBaseTokenURI() external view returns (string memory) {
        return _baseTokenURI;
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
            uint256 proposalTime,
            uint8 approvalCount,
            bool executed
        )
    {
        Action storage action = actions[_actionId];
        return (
            action.actionType,
            action.proposalTime,
            action.approvalCount,
            action.executed
        );
    }
}
