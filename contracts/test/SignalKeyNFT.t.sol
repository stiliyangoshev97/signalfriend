// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestHelper.sol";

/**
 * @title SignalKeyNFTTest
 * @notice Unit tests for SignalKeyNFT contract
 * @dev Tests: minting, transfers, ownership tracking, content identifiers, MultiSig
 */
contract SignalKeyNFTTest is TestHelper {
    // ============================================
    // TEST CONSTANTS
    // ============================================

    bytes32 constant CONTENT_ID_1 = keccak256("signal_content_1");
    bytes32 constant CONTENT_ID_2 = keccak256("signal_content_2");
    bytes32 constant CONTENT_ID_3 = keccak256("signal_content_3");
    uint256 constant SIGNAL_PRICE = 10 * 10 ** 18; // 10 USDT

    // ============================================
    // SETUP VERIFICATION TESTS
    // ============================================

    function test_Setup_ContractDeployed() public view {
        assertTrue(
            address(signalKey) != address(0),
            "SignalKey should be deployed"
        );
        assertEq(
            signalKey.signalFriendMarket(),
            address(market),
            "Market address should be set"
        );
    }

    function test_Setup_SignersCorrect() public view {
        address[3] memory signers = signalKey.getSigners();
        assertEq(signers[0], signer1, "Wrong signer1");
        assertEq(signers[1], signer2, "Wrong signer2");
        assertEq(signers[2], signer3, "Wrong signer3");
    }

    function test_Setup_InitialStateCorrect() public view {
        assertEq(signalKey.totalMinted(), 0, "Should have 0 NFTs initially");
        assertEq(signalKey.getBaseTokenURI(), "", "BaseURI should be empty");
    }

    // ============================================
    // MINTING TESTS
    // ============================================

    function test_MintForLogicContract_OnlyMarketCanCall() public {
        vm.prank(randomUser);
        vm.expectRevert(SignalKeyNFT.OnlySignalFriendMarket.selector);
        signalKey.mintForLogicContract(buyer1, CONTENT_ID_1);
    }

    function test_MintForLogicContract_Success() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        assertEq(signalKey.balanceOf(buyer1), 1, "Should have 1 NFT");
        assertEq(signalKey.ownerOf(tokenId), buyer1, "Wrong owner");
        assertEq(signalKey.totalMinted(), 1, "Total minted should be 1");
    }

    function test_MintForLogicContract_TokenIdIncremental() public {
        _registerPredictor(predictor1);

        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );
        uint256 tokenId2 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_2
        );
        uint256 tokenId3 = _buySignal(
            buyer2,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_3
        );

        assertEq(tokenId1, 1, "First token should be ID 1");
        assertEq(tokenId2, 2, "Second token should be ID 2");
        assertEq(tokenId3, 3, "Third token should be ID 3");
    }

    function test_MintForLogicContract_StoresContentIdentifier() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        assertEq(
            signalKey.getContentIdentifier(tokenId),
            CONTENT_ID_1,
            "Wrong content ID"
        );
    }

    function test_MintForLogicContract_MultipleWithSameContentId() public {
        // Multiple buyers can buy the same signal (same content ID)
        _registerPredictor(predictor1);

        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );
        uint256 tokenId2 = _buySignal(
            buyer2,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        // Both should have the same content identifier
        assertEq(
            signalKey.getContentIdentifier(tokenId1),
            CONTENT_ID_1,
            "Wrong content ID for token1"
        );
        assertEq(
            signalKey.getContentIdentifier(tokenId2),
            CONTENT_ID_1,
            "Wrong content ID for token2"
        );

        // But different token IDs
        assertEq(tokenId1, 1, "Token1 should be ID 1");
        assertEq(tokenId2, 2, "Token2 should be ID 2");
    }

    // ============================================
    // TRANSFER TESTS (SignalKeyNFT IS TRANSFERABLE)
    // ============================================

    function test_Transfer_Success() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        // Transfer from buyer1 to buyer2
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId);

        assertEq(
            signalKey.ownerOf(tokenId),
            buyer2,
            "Buyer2 should own the token"
        );
        assertEq(signalKey.balanceOf(buyer1), 0, "Buyer1 should have 0 tokens");
        assertEq(signalKey.balanceOf(buyer2), 1, "Buyer2 should have 1 token");
    }

    function test_Transfer_SafeTransferSuccess() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        vm.prank(buyer1);
        signalKey.safeTransferFrom(buyer1, buyer2, tokenId);

        assertEq(
            signalKey.ownerOf(tokenId),
            buyer2,
            "Buyer2 should own the token"
        );
    }

    function test_Transfer_WithApproval() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        // Approve buyer2
        vm.prank(buyer1);
        signalKey.approve(buyer2, tokenId);

        // Buyer2 can transfer
        vm.prank(buyer2);
        signalKey.transferFrom(buyer1, randomUser, tokenId);

        assertEq(
            signalKey.ownerOf(tokenId),
            randomUser,
            "RandomUser should own the token"
        );
    }

    function test_Transfer_ContentIdPreserved() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId);

        // Content ID should be preserved after transfer
        assertEq(
            signalKey.getContentIdentifier(tokenId),
            CONTENT_ID_1,
            "Content ID should be preserved"
        );
    }

    // ============================================
    // TOKENS OF OWNER TRACKING TESTS
    // ============================================

    function test_TokensOfOwner_UpdatesOnMint() public {
        _registerPredictor(predictor1);

        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );
        uint256 tokenId2 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_2
        );

        uint256[] memory tokens = signalKey.tokensOfOwner(buyer1);
        assertEq(tokens.length, 2, "Should own 2 tokens");
        assertEq(tokens[0], tokenId1, "First token should be tokenId1");
        assertEq(tokens[1], tokenId2, "Second token should be tokenId2");
    }

    function test_TokensOfOwner_UpdatesOnTransfer() public {
        _registerPredictor(predictor1);

        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );
        uint256 tokenId2 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_2
        );

        // Transfer tokenId1 to buyer2
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId1);

        // Buyer1 should only have tokenId2
        uint256[] memory buyer1Tokens = signalKey.tokensOfOwner(buyer1);
        assertEq(buyer1Tokens.length, 1, "Buyer1 should have 1 token");
        assertEq(buyer1Tokens[0], tokenId2, "Buyer1 should have tokenId2");

        // Buyer2 should have tokenId1
        uint256[] memory buyer2Tokens = signalKey.tokensOfOwner(buyer2);
        assertEq(buyer2Tokens.length, 1, "Buyer2 should have 1 token");
        assertEq(buyer2Tokens[0], tokenId1, "Buyer2 should have tokenId1");
    }

    function test_TokensOfOwner_EmptyForNewAddress() public view {
        uint256[] memory tokens = signalKey.tokensOfOwner(randomUser);
        assertEq(tokens.length, 0, "Should have 0 tokens");
    }

    function test_TokensOfOwner_HandlesMultipleTransfers() public {
        _registerPredictor(predictor1);

        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        // Transfer: buyer1 -> buyer2 -> randomUser
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId);

        vm.prank(buyer2);
        signalKey.transferFrom(buyer2, randomUser, tokenId);

        assertEq(
            signalKey.tokensOfOwner(buyer1).length,
            0,
            "Buyer1 should have 0 tokens"
        );
        assertEq(
            signalKey.tokensOfOwner(buyer2).length,
            0,
            "Buyer2 should have 0 tokens"
        );
        assertEq(
            signalKey.tokensOfOwner(randomUser).length,
            1,
            "RandomUser should have 1 token"
        );
        assertEq(
            signalKey.tokensOfOwner(randomUser)[0],
            tokenId,
            "RandomUser should have the token"
        );
    }

    // ============================================
    // VIEW FUNCTIONS TESTS
    // ============================================

    function test_Exists_ReturnsTrueForMintedToken() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        assertTrue(signalKey.exists(tokenId), "Token should exist");
    }

    function test_Exists_ReturnsFalseForUnmintedToken() public view {
        assertFalse(signalKey.exists(999), "Token 999 should not exist");
    }

    function test_GetContentIdentifier_RevertsForNonexistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(SignalKeyNFT.TokenDoesNotExist.selector, 999)
        );
        signalKey.getContentIdentifier(999);
    }

    function test_TotalMinted_TracksCorrectly() public {
        _registerPredictor(predictor1);

        assertEq(signalKey.totalMinted(), 0, "Should start at 0");

        _buySignal(buyer1, predictor1, SIGNAL_PRICE, CONTENT_ID_1);
        assertEq(signalKey.totalMinted(), 1, "Should be 1 after first mint");

        _buySignal(buyer2, predictor1, SIGNAL_PRICE, CONTENT_ID_2);
        assertEq(signalKey.totalMinted(), 2, "Should be 2 after second mint");
    }

    function test_TokenURI_ReturnsBaseURI() public {
        _registerPredictor(predictor1);
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );

        // Since baseURI is empty in tests, tokenURI returns empty
        assertEq(signalKey.tokenURI(tokenId), "", "Should return base URI");
    }

    function test_TokenURI_RevertsForNonexistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(SignalKeyNFT.TokenDoesNotExist.selector, 999)
        );
        signalKey.tokenURI(999);
    }

    // ============================================
    // METADATA UPDATE TESTS
    // ============================================

    function test_UpdateMetadataURI_Success() public {
        string memory newURI = "ipfs://QmNewHash/";

        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI(newURI);
        _executeMultiSigActionOnSignalKey(actionId);

        assertEq(signalKey.getBaseTokenURI(), newURI, "URI should be updated");
    }

    function test_UpdateMetadataURI_OnlySigners() public {
        vm.prank(randomUser);
        vm.expectRevert(SignalKeyNFT.OnlyMultiSigSigner.selector);
        signalKey.proposeUpdateMetadataURI("ipfs://test/");
    }

    function test_UpdateMetadataURI_AffectsAllTokens() public {
        _registerPredictor(predictor1);
        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_1
        );
        uint256 tokenId2 = _buySignal(
            buyer2,
            predictor1,
            SIGNAL_PRICE,
            CONTENT_ID_2
        );

        string memory newURI = "ipfs://QmUpdated/";
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI(newURI);
        _executeMultiSigActionOnSignalKey(actionId);

        // Both tokens should have same new URI
        assertEq(
            signalKey.tokenURI(tokenId1),
            newURI,
            "Token1 should have new URI"
        );
        assertEq(
            signalKey.tokenURI(tokenId2),
            newURI,
            "Token2 should have new URI"
        );
    }

    // ============================================
    // MULTISIG ACTION TESTS
    // ============================================

    function test_MultiSig_ActionExpiresAfterOneHour() public {
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");

        vm.prank(signer2);
        signalKey.approveAction(actionId);

        // Warp past expiry
        vm.warp(block.timestamp + ACTION_EXPIRY_TIME + 1);

        vm.prank(signer3);
        vm.expectRevert(SignalKeyNFT.ActionExpired.selector);
        signalKey.approveAction(actionId);
    }

    function test_MultiSig_CannotApproveTwice() public {
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");

        vm.prank(signer1);
        vm.expectRevert(SignalKeyNFT.AlreadyApproved.selector);
        signalKey.approveAction(actionId);
    }

    function test_MultiSig_NonSignerCannotApprove() public {
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");

        vm.prank(randomUser);
        vm.expectRevert(SignalKeyNFT.OnlyMultiSigSigner.selector);
        signalKey.approveAction(actionId);
    }

    function test_MultiSig_CleanAction() public {
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");
        _executeMultiSigActionOnSignalKey(actionId);

        // Action is executed, can be cleaned
        signalKey.cleanAction(actionId);

        // Action should be deleted
        vm.expectRevert(SignalKeyNFT.ActionDoesNotExist.selector);
        signalKey.cleanAction(actionId);
    }

    function test_MultiSig_GetActionDetails() public {
        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");

        (
            SignalKeyNFT.ActionType actionType,
            uint256 proposalTime,
            uint8 approvalCount,
            bool executed
        ) = signalKey.getActionDetails(actionId);

        assertEq(
            uint8(actionType),
            uint8(SignalKeyNFT.ActionType.UPDATE_METADATA_URI),
            "Wrong action type"
        );
        assertTrue(proposalTime > 0, "Proposal time should be set");
        assertEq(approvalCount, 1, "Should have 1 approval");
        assertFalse(executed, "Should not be executed");
    }

    function test_MultiSig_GetAllActionIds() public {
        vm.prank(signer1);
        bytes32 actionId1 = signalKey.proposeUpdateMetadataURI("ipfs://test1/");

        vm.prank(signer1);
        bytes32 actionId2 = signalKey.proposeUpdateMetadataURI("ipfs://test2/");

        bytes32[] memory actionIds = signalKey.getAllActionIds();
        assertTrue(actionIds.length >= 2, "Should have at least 2 actions");
    }

    function test_MultiSig_GetActionExpirationTime() public {
        uint256 startTime = block.timestamp;

        vm.prank(signer1);
        bytes32 actionId = signalKey.proposeUpdateMetadataURI("ipfs://test/");

        uint256 expirationTime = signalKey.getActionExpirationTime(actionId);
        assertEq(
            expirationTime,
            startTime + ACTION_EXPIRY_TIME,
            "Wrong expiration time"
        );
    }

    // ============================================
    // IMMUTABLE MARKET ADDRESS TEST
    // ============================================

    function test_SignalFriendMarket_IsImmutable() public view {
        // The signalFriendMarket is immutable, set at deployment
        // Just verify it's correctly set
        assertEq(
            signalKey.signalFriendMarket(),
            address(market),
            "Market should be immutable"
        );
    }
}
