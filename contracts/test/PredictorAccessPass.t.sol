// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestHelper.sol";

/**
 * @title PredictorAccessPassTest
 * @notice Unit tests for PredictorAccessPass contract
 * @dev Tests: soulbound enforcement, one-per-wallet, blacklisting, MultiSig, owner mint
 */
contract PredictorAccessPassTest is TestHelper {
    // ============================================
    // SETUP VERIFICATION TESTS
    // ============================================

    function test_Setup_ContractDeployed() public view {
        assertTrue(
            address(accessPass) != address(0),
            "AccessPass should be deployed"
        );
        assertEq(
            accessPass.signalFriendMarket(),
            address(market),
            "Market address should be set"
        );
    }

    function test_Setup_SignersCorrect() public view {
        address[3] memory signers = accessPass.getSigners();
        assertEq(signers[0], signer1, "Wrong signer1");
        assertEq(signers[1], signer2, "Wrong signer2");
        assertEq(signers[2], signer3, "Wrong signer3");
    }

    function test_Setup_InitialStateCorrect() public view {
        assertEq(accessPass.totalMinted(), 0, "Should have 0 NFTs initially");
        assertEq(accessPass.getBaseTokenURI(), "", "BaseURI should be empty");
    }

    // ============================================
    // SOULBOUND (NON-TRANSFERABLE) TESTS
    // ============================================

    function test_Soulbound_TransferBlocked() public {
        // Register predictor to get NFT
        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        // Try to transfer - should revert
        vm.prank(predictor1);
        vm.expectRevert(PredictorAccessPass.TransfersNotAllowed.selector);
        accessPass.transferFrom(predictor1, predictor2, tokenId);
    }

    function test_Soulbound_SafeTransferBlocked() public {
        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        vm.prank(predictor1);
        vm.expectRevert(PredictorAccessPass.TransfersNotAllowed.selector);
        accessPass.safeTransferFrom(predictor1, predictor2, tokenId);
    }

    function test_Soulbound_SafeTransferWithDataBlocked() public {
        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        vm.prank(predictor1);
        vm.expectRevert(PredictorAccessPass.TransfersNotAllowed.selector);
        accessPass.safeTransferFrom(predictor1, predictor2, tokenId, "");
    }

    function test_Soulbound_ApproveBlocked() public {
        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        // Approve should work but transfer should still fail
        vm.prank(predictor1);
        accessPass.approve(predictor2, tokenId);

        // Try to transfer using approval
        vm.prank(predictor2);
        vm.expectRevert(PredictorAccessPass.TransfersNotAllowed.selector);
        accessPass.transferFrom(predictor1, predictor2, tokenId);
    }

    // ============================================
    // ONE-PER-WALLET ENFORCEMENT TESTS
    // ============================================

    function test_OnePerWallet_CannotMintTwice() public {
        // Register predictor once
        _registerPredictor(predictor1);

        // Try to register again via market (should fail in market)
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);
        vm.prank(predictor1);
        vm.expectRevert(SignalFriendMarket.AlreadyHasPredictorNFT.selector);
        market.joinAsPredictor(address(0));
    }

    function test_OnePerWallet_CannotOwnerMintTwice() public {
        // Owner mint first
        _ownerMintPredictor(predictor1);

        // Warp time to ensure different action ID (action ID includes block.timestamp)
        vm.warp(block.timestamp + 1);

        // Try to owner mint again - should fail when executing
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        vm.prank(signer2);
        accessPass.approveAction(actionId);

        // Third approval triggers execution, which should fail
        vm.prank(signer3);
        vm.expectRevert(
            abi.encodeWithSelector(
                PredictorAccessPass.AlreadyHasNFT.selector,
                predictor1
            )
        );
        accessPass.approveAction(actionId);
    }

    function test_OnePerWallet_DifferentWalletsCanMint() public {
        _registerPredictor(predictor1);
        _registerPredictor(predictor2);

        assertEq(
            accessPass.balanceOf(predictor1),
            1,
            "Predictor1 should have 1 NFT"
        );
        assertEq(
            accessPass.balanceOf(predictor2),
            1,
            "Predictor2 should have 1 NFT"
        );
        assertEq(accessPass.totalMinted(), 2, "Should have 2 NFTs total");
    }

    // ============================================
    // MINTING TESTS
    // ============================================

    function test_MintForLogicContract_OnlyMarketCanCall() public {
        vm.prank(randomUser);
        vm.expectRevert(PredictorAccessPass.OnlySignalFriendMarket.selector);
        accessPass.mintForLogicContract(predictor1);
    }

    function test_MintForLogicContract_Success() public {
        _registerPredictor(predictor1);

        assertEq(accessPass.balanceOf(predictor1), 1, "Should have 1 NFT");
        assertEq(accessPass.totalMinted(), 1, "Total minted should be 1");
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active"
        );
    }

    function test_MintForLogicContract_TokenIdIncremental() public {
        _registerPredictor(predictor1);
        _registerPredictor(predictor2);

        uint256 tokenId1 = accessPass.getPredictorTokenId(predictor1);
        uint256 tokenId2 = accessPass.getPredictorTokenId(predictor2);

        assertEq(tokenId1, 1, "First token should be ID 1");
        assertEq(tokenId2, 2, "Second token should be ID 2");
    }

    function test_MintForLogicContract_CannotMintToBlacklisted() public {
        // Blacklist predictor1 first (before they have NFT)
        _blacklistPredictor(predictor1);

        // Try to join - should fail at AccessPass level
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);
        vm.prank(predictor1);
        vm.expectRevert(
            abi.encodeWithSelector(
                PredictorAccessPass.AddressBlacklisted.selector,
                predictor1
            )
        );
        market.joinAsPredictor(address(0));
    }

    // ============================================
    // OWNER MINT TESTS
    // ============================================

    function test_OwnerMint_Success() public {
        _ownerMintPredictor(predictor1);

        assertEq(accessPass.balanceOf(predictor1), 1, "Should have 1 NFT");
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active"
        );
    }

    function test_OwnerMint_OnlySignersCanPropose() public {
        vm.prank(randomUser);
        vm.expectRevert(PredictorAccessPass.OnlyMultiSigSigner.selector);
        accessPass.proposeOwnerMint(predictor1);
    }

    function test_OwnerMint_RequiresThreeApprovals() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        // After proposal, only 1 approval (auto-approved by proposer)
        assertEq(
            accessPass.getActionApprovals(actionId),
            1,
            "Should have 1 approval"
        );
        assertFalse(
            accessPass.isActionExecuted(actionId),
            "Should not be executed"
        );

        // After signer2
        vm.prank(signer2);
        accessPass.approveAction(actionId);
        assertEq(
            accessPass.getActionApprovals(actionId),
            2,
            "Should have 2 approvals"
        );
        assertFalse(
            accessPass.isActionExecuted(actionId),
            "Should not be executed yet"
        );

        // After signer3 - auto executes
        vm.prank(signer3);
        accessPass.approveAction(actionId);
        assertTrue(accessPass.isActionExecuted(actionId), "Should be executed");
        assertEq(accessPass.balanceOf(predictor1), 1, "Should have NFT now");
    }

    // ============================================
    // BLACKLIST TESTS
    // ============================================

    function test_Blacklist_Success() public {
        _registerPredictor(predictor1);
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active"
        );

        _blacklistPredictor(predictor1);

        assertTrue(
            accessPass.isBlacklisted(predictor1),
            "Should be blacklisted"
        );
        assertFalse(
            accessPass.isPredictorActive(predictor1),
            "Should not be active"
        );
    }

    function test_Blacklist_StillOwnsNFT() public {
        _registerPredictor(predictor1);
        _blacklistPredictor(predictor1);

        // Still owns NFT, just blacklisted
        assertEq(accessPass.balanceOf(predictor1), 1, "Should still own NFT");
    }

    function test_Blacklist_OnlySignersCanPropose() public {
        vm.prank(randomUser);
        vm.expectRevert(PredictorAccessPass.OnlyMultiSigSigner.selector);
        accessPass.proposeBlacklist(predictor1, true);
    }

    function test_Unblacklist_Success() public {
        _registerPredictor(predictor1);
        _blacklistPredictor(predictor1);
        assertFalse(
            accessPass.isPredictorActive(predictor1),
            "Should not be active"
        );

        _unblacklistPredictor(predictor1);

        assertFalse(
            accessPass.isBlacklisted(predictor1),
            "Should not be blacklisted"
        );
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active again"
        );
    }

    // ============================================
    // VIEW FUNCTIONS TESTS
    // ============================================

    function test_IsPredictorActive_ChecksNFTAndBlacklist() public {
        // No NFT
        assertFalse(
            accessPass.isPredictorActive(predictor1),
            "No NFT = not active"
        );

        // Has NFT
        _registerPredictor(predictor1);
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Has NFT = active"
        );

        // Blacklisted
        _blacklistPredictor(predictor1);
        assertFalse(
            accessPass.isPredictorActive(predictor1),
            "Blacklisted = not active"
        );
    }

    function test_GetPredictorTokenId_ReturnsCorrectId() public {
        _registerPredictor(predictor1);
        _registerPredictor(predictor2);

        assertEq(
            accessPass.getPredictorTokenId(predictor1),
            1,
            "Wrong token ID for predictor1"
        );
        assertEq(
            accessPass.getPredictorTokenId(predictor2),
            2,
            "Wrong token ID for predictor2"
        );
    }

    function test_GetPredictorTokenId_RevertsIfNoNFT() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                PredictorAccessPass.NoPredictorNFT.selector,
                predictor1
            )
        );
        accessPass.getPredictorTokenId(predictor1);
    }

    function test_TokenURI_ReturnsBaseURI() public {
        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        // Since baseURI is empty in tests, tokenURI returns empty
        assertEq(accessPass.tokenURI(tokenId), "", "Should return base URI");
    }

    function test_TokenURI_RevertsForNonexistentToken() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                PredictorAccessPass.TokenDoesNotExist.selector,
                999
            )
        );
        accessPass.tokenURI(999);
    }

    // ============================================
    // METADATA UPDATE TESTS
    // ============================================

    function test_UpdateMetadataURI_Success() public {
        string memory newURI = "ipfs://QmNewHash/";

        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeUpdateMetadataURI(newURI);
        _executeMultiSigActionOnAccessPass(actionId);

        assertEq(accessPass.getBaseTokenURI(), newURI, "URI should be updated");
    }

    function test_UpdateMetadataURI_OnlySigners() public {
        vm.prank(randomUser);
        vm.expectRevert(PredictorAccessPass.OnlyMultiSigSigner.selector);
        accessPass.proposeUpdateMetadataURI("ipfs://test/");
    }

    // ============================================
    // MULTISIG ACTION TESTS
    // ============================================

    function test_MultiSig_ActionExpiresAfterOneHour() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        vm.prank(signer2);
        accessPass.approveAction(actionId);

        // Warp past expiry
        vm.warp(block.timestamp + ACTION_EXPIRY_TIME + 1);

        vm.prank(signer3);
        vm.expectRevert(PredictorAccessPass.ActionExpired.selector);
        accessPass.approveAction(actionId);
    }

    function test_MultiSig_CannotApproveTwice() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        vm.prank(signer1);
        vm.expectRevert(PredictorAccessPass.AlreadyApproved.selector);
        accessPass.approveAction(actionId);
    }

    function test_MultiSig_NonSignerCannotApprove() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        vm.prank(randomUser);
        vm.expectRevert(PredictorAccessPass.OnlyMultiSigSigner.selector);
        accessPass.approveAction(actionId);
    }

    function test_MultiSig_CleanAction() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);
        _executeMultiSigActionOnAccessPass(actionId);

        // Action is executed, can be cleaned
        accessPass.cleanAction(actionId);

        // Action should be deleted (proposalTime becomes 0)
        vm.expectRevert(PredictorAccessPass.ActionDoesNotExist.selector);
        accessPass.cleanAction(actionId);
    }

    function test_MultiSig_GetActionDetails() public {
        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        (
            PredictorAccessPass.ActionType actionType,
            address targetAddress,
            bool blacklistStatus,
            uint256 proposalTime,
            uint8 approvalCount,
            bool executed
        ) = accessPass.getActionDetails(actionId);

        assertEq(
            uint8(actionType),
            uint8(PredictorAccessPass.ActionType.OWNER_MINT),
            "Wrong action type"
        );
        assertEq(targetAddress, predictor1, "Wrong target address");
        assertFalse(blacklistStatus, "Blacklist status should be false");
        assertTrue(proposalTime > 0, "Proposal time should be set");
        assertEq(approvalCount, 1, "Should have 1 approval");
        assertFalse(executed, "Should not be executed");
    }

    function test_MultiSig_GetAllActionIds() public {
        vm.prank(signer1);
        accessPass.proposeOwnerMint(predictor1);

        vm.prank(signer1);
        accessPass.proposeBlacklist(predictor2, true);

        bytes32[] memory actionIds = accessPass.getAllActionIds();

        // Should have at least 2 actions (plus setup actions)
        assertTrue(actionIds.length >= 2, "Should have at least 2 actions");
    }

    function test_MultiSig_GetActionExpirationTime() public {
        uint256 startTime = block.timestamp;

        vm.prank(signer1);
        bytes32 actionId = accessPass.proposeOwnerMint(predictor1);

        uint256 expirationTime = accessPass.getActionExpirationTime(actionId);
        assertEq(
            expirationTime,
            startTime + ACTION_EXPIRY_TIME,
            "Wrong expiration time"
        );
    }
}
