// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestHelper.sol";

/**
 * @title SignalFriendMarketTest
 * @notice Unit tests for SignalFriendMarket contract
 * @dev Tests core functionality: registration, signal purchase, fee calculations, access control
 */
contract SignalFriendMarketTest is TestHelper {
    // ============================================
    // TEST CONSTANTS
    // ============================================

    bytes32 constant CONTENT_ID_1 = keccak256("signal_content_1");
    bytes32 constant CONTENT_ID_2 = keccak256("signal_content_2");
    uint256 constant SIGNAL_PRICE = 10 * 10 ** 18; // 10 USDT

    // ============================================
    // SETUP VERIFICATION TESTS
    // ============================================

    function test_Setup_ContractsDeployed() public view {
        assertTrue(address(market) != address(0), "Market should be deployed");
        assertTrue(
            address(accessPass) != address(0),
            "AccessPass should be deployed"
        );
        assertTrue(
            address(signalKey) != address(0),
            "SignalKey should be deployed"
        );
        assertTrue(address(usdt) != address(0), "USDT should be deployed");
    }

    function test_Setup_MarketIsFullyInitialized() public view {
        assertTrue(
            market.isFullyInitialized(),
            "Market should be fully initialized"
        );
        assertEq(
            market.predictorAccessPass(),
            address(accessPass),
            "Wrong AccessPass address"
        );
        assertEq(
            market.signalKeyNFT(),
            address(signalKey),
            "Wrong SignalKey address"
        );
    }

    function test_Setup_DefaultParametersCorrect() public view {
        (
            uint256 minPrice,
            uint256 joinFee,
            uint256 refPayout,
            uint256 accessFee,
            uint256 commRate
        ) = market.getPlatformParameters();

        assertEq(minPrice, MIN_SIGNAL_PRICE, "Wrong min signal price");
        assertEq(joinFee, PREDICTOR_JOIN_FEE, "Wrong predictor join fee");
        assertEq(refPayout, REFERRAL_PAYOUT, "Wrong referral payout");
        assertEq(accessFee, BUYER_ACCESS_FEE, "Wrong buyer access fee");
        assertEq(commRate, COMMISSION_RATE, "Wrong commission rate");
    }

    function test_Setup_SignersCorrect() public view {
        address[3] memory signers = market.getSigners();
        assertEq(signers[0], signer1, "Wrong signer1");
        assertEq(signers[1], signer2, "Wrong signer2");
        assertEq(signers[2], signer3, "Wrong signer3");
    }

    // ============================================
    // JOIN AS PREDICTOR TESTS
    // ============================================

    function test_JoinAsPredictor_Success() public {
        // Fund predictor1 with USDT
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);

        // Record initial balances
        uint256 treasuryBefore = usdt.balanceOf(treasury);

        // Join as predictor
        vm.prank(predictor1);
        market.joinAsPredictor(address(0)); // No referrer

        // Verify NFT minted
        assertEq(
            accessPass.balanceOf(predictor1),
            1,
            "Should have 1 PredictorAccessPass"
        );
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active predictor"
        );

        // Verify treasury received full fee (no referrer)
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBefore + PREDICTOR_JOIN_FEE,
            "Treasury should receive full fee"
        );

        // Verify statistics updated
        assertEq(
            market.totalPredictorsJoined(),
            1,
            "Should have 1 predictor joined"
        );
    }

    function test_JoinAsPredictor_WithValidReferrer() public {
        // First register a referrer
        _registerPredictor(predictor1);

        // Fund predictor2
        _fundUserWithUSDT(predictor2, PREDICTOR_JOIN_FEE);

        // Record initial balances
        uint256 referrerBefore = usdt.balanceOf(predictor1);
        uint256 treasuryBefore = usdt.balanceOf(treasury);

        // Join with referrer
        vm.prank(predictor2);
        market.joinAsPredictor(predictor1);

        // Verify referrer received payout
        assertEq(
            usdt.balanceOf(predictor1),
            referrerBefore + REFERRAL_PAYOUT,
            "Referrer should receive payout"
        );

        // Verify treasury received remaining
        uint256 treasuryExpected = PREDICTOR_JOIN_FEE - REFERRAL_PAYOUT;
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBefore + treasuryExpected,
            "Treasury should receive remaining"
        );

        // Verify statistics
        assertEq(market.totalReferralsPaid(), 1, "Should have 1 referral paid");
    }

    function test_JoinAsPredictor_WithInvalidReferrer_NoReferralPaid() public {
        // Fund predictor1 with USDT
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);

        // Record initial balances
        uint256 treasuryBefore = usdt.balanceOf(treasury);
        uint256 randomUserBefore = usdt.balanceOf(randomUser); // randomUser is not a predictor

        // Join with invalid referrer (not a predictor)
        vm.prank(predictor1);
        market.joinAsPredictor(randomUser);

        // Verify NO referral paid (randomUser has no PredictorAccessPass)
        assertEq(
            usdt.balanceOf(randomUser),
            randomUserBefore,
            "Invalid referrer should not receive payout"
        );

        // Verify treasury received full amount
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBefore + PREDICTOR_JOIN_FEE,
            "Treasury should receive full fee"
        );

        // Verify referral counter NOT incremented
        assertEq(
            market.totalReferralsPaid(),
            0,
            "Should have 0 referrals paid"
        );
    }

    function test_JoinAsPredictor_RevertWhenAlreadyPredictor() public {
        // Register predictor1 first
        _registerPredictor(predictor1);

        // Fund again and try to join again
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);

        vm.prank(predictor1);
        vm.expectRevert(SignalFriendMarket.AlreadyHasPredictorNFT.selector);
        market.joinAsPredictor(address(0));
    }

    function test_JoinAsPredictor_RevertWhenPaused() public {
        // Pause the market
        _pauseMarket();

        // Fund predictor
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);

        vm.prank(predictor1);
        vm.expectRevert(SignalFriendMarket.ContractCurrentlyPaused.selector);
        market.joinAsPredictor(address(0));
    }

    function test_JoinAsPredictor_RevertWhenInsufficientAllowance() public {
        // Mint USDT but don't approve
        usdt.mint(predictor1, PREDICTOR_JOIN_FEE);

        vm.prank(predictor1);
        vm.expectRevert(SignalFriendMarket.InsufficientAllowance.selector);
        market.joinAsPredictor(address(0));
    }

    function test_JoinAsPredictor_SelfReferralIgnored() public {
        // Fund predictor1
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);

        uint256 treasuryBefore = usdt.balanceOf(treasury);

        // Try to refer yourself (should be ignored)
        vm.prank(predictor1);
        market.joinAsPredictor(predictor1);

        // Treasury should get full amount (self-referral ignored)
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBefore + PREDICTOR_JOIN_FEE,
            "Self-referral should be ignored"
        );
    }

    // ============================================
    // BUY SIGNAL TESTS
    // ============================================

    function test_BuySignal_Success() public {
        // Setup: Register a predictor
        _registerPredictor(predictor1);

        // Fund buyer
        uint256 totalCost = market.calculateBuyerCost(SIGNAL_PRICE);
        _fundUserWithUSDT(buyer1, totalCost);

        // Record balances before
        uint256 predictorBefore = usdt.balanceOf(predictor1);
        uint256 treasuryBefore = usdt.balanceOf(treasury);

        // Buy signal
        vm.prank(buyer1);
        market.buySignalNFT(
            predictor1,
            SIGNAL_PRICE,
            COMMISSION_RATE,
            CONTENT_ID_1
        );

        // Verify NFT minted
        assertEq(
            signalKey.balanceOf(buyer1),
            1,
            "Buyer should have 1 SignalKeyNFT"
        );
        assertEq(signalKey.ownerOf(1), buyer1, "Buyer should own token 1");

        // Verify content ID stored
        assertEq(
            signalKey.getContentIdentifier(1),
            CONTENT_ID_1,
            "Wrong content ID stored"
        );

        // Verify fee distribution
        uint256 commission = (SIGNAL_PRICE * COMMISSION_RATE) / BASIS_POINTS;
        uint256 predictorPayout = SIGNAL_PRICE - commission;
        uint256 platformEarnings = commission + BUYER_ACCESS_FEE;

        assertEq(
            usdt.balanceOf(predictor1),
            predictorBefore + predictorPayout,
            "Wrong predictor payout"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBefore + platformEarnings,
            "Wrong platform earnings"
        );

        // Verify statistics
        assertEq(
            market.totalSignalsPurchased(),
            1,
            "Should have 1 signal purchased"
        );
    }

    function test_BuySignal_MultiplePurchases() public {
        // Setup: Register predictor
        _registerPredictor(predictor1);

        // Buy multiple signals
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
        uint256 tokenId3 = _buySignal(
            buyer1,
            predictor1,
            SIGNAL_PRICE,
            keccak256("signal_3")
        );

        // Verify token IDs are sequential
        assertEq(tokenId1, 1, "First token ID should be 1");
        assertEq(tokenId2, 2, "Second token ID should be 2");
        assertEq(tokenId3, 3, "Third token ID should be 3");

        // Verify ownership tracking
        uint256[] memory buyer1Tokens = signalKey.tokensOfOwner(buyer1);
        assertEq(buyer1Tokens.length, 2, "Buyer1 should own 2 tokens");

        uint256[] memory buyer2Tokens = signalKey.tokensOfOwner(buyer2);
        assertEq(buyer2Tokens.length, 1, "Buyer2 should own 1 token");

        // Verify statistics
        assertEq(
            market.totalSignalsPurchased(),
            3,
            "Should have 3 signals purchased"
        );
    }

    function test_BuySignal_RevertWhenPriceTooLow() public {
        _registerPredictor(predictor1);

        uint256 lowPrice = MIN_SIGNAL_PRICE - 1;
        uint256 totalCost = market.calculateBuyerCost(lowPrice);
        _fundUserWithUSDT(buyer1, totalCost);

        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.SignalPriceTooLow.selector);
        market.buySignalNFT(
            predictor1,
            lowPrice,
            COMMISSION_RATE,
            CONTENT_ID_1
        );
    }

    function test_BuySignal_RevertWhenPredictorInvalid() public {
        // Don't register predictor1
        uint256 totalCost = market.calculateBuyerCost(SIGNAL_PRICE);
        _fundUserWithUSDT(buyer1, totalCost);

        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.InvalidPredictor.selector);
        market.buySignalNFT(
            predictor1,
            SIGNAL_PRICE,
            COMMISSION_RATE,
            CONTENT_ID_1
        );
    }

    function test_BuySignal_RevertWhenPredictorBlacklisted() public {
        // Register then blacklist
        _registerPredictor(predictor1);
        _blacklistPredictor(predictor1);

        uint256 totalCost = market.calculateBuyerCost(SIGNAL_PRICE);
        _fundUserWithUSDT(buyer1, totalCost);

        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.InvalidPredictor.selector);
        market.buySignalNFT(
            predictor1,
            SIGNAL_PRICE,
            COMMISSION_RATE,
            CONTENT_ID_1
        );
    }

    function test_BuySignal_RevertWhenPaused() public {
        _registerPredictor(predictor1);
        _pauseMarket();

        uint256 totalCost = market.calculateBuyerCost(SIGNAL_PRICE);
        _fundUserWithUSDT(buyer1, totalCost);

        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.ContractCurrentlyPaused.selector);
        market.buySignalNFT(
            predictor1,
            SIGNAL_PRICE,
            COMMISSION_RATE,
            CONTENT_ID_1
        );
    }

    function test_BuySignal_FrontRunningProtection() public {
        _registerPredictor(predictor1);

        uint256 totalCost = market.calculateBuyerCost(SIGNAL_PRICE);
        _fundUserWithUSDT(buyer1, totalCost);

        // Try to buy with lower max commission than actual
        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.InvalidCommissionRate.selector);
        market.buySignalNFT(
            predictor1,
            SIGNAL_PRICE,
            COMMISSION_RATE - 1,
            CONTENT_ID_1
        );
    }

    // ============================================
    // FEE CALCULATION TESTS
    // ============================================

    function test_CalculateBuyerCost() public view {
        uint256 price = 100 * 10 ** 18; // 100 USDT
        uint256 expected = price + BUYER_ACCESS_FEE; // 100.5 USDT
        assertEq(
            market.calculateBuyerCost(price),
            expected,
            "Wrong buyer cost calculation"
        );
    }

    function test_CalculatePredictorPayout() public view {
        uint256 price = 100 * 10 ** 18; // 100 USDT
        uint256 commission = (price * COMMISSION_RATE) / BASIS_POINTS; // 5 USDT
        uint256 expected = price - commission; // 95 USDT
        assertEq(
            market.calculatePredictorPayout(price),
            expected,
            "Wrong predictor payout calculation"
        );
    }

    function test_CalculatePlatformEarnings() public view {
        uint256 price = 100 * 10 ** 18; // 100 USDT
        uint256 commission = (price * COMMISSION_RATE) / BASIS_POINTS; // 5 USDT
        uint256 expected = commission + BUYER_ACCESS_FEE; // 5.5 USDT
        assertEq(
            market.calculatePlatformEarnings(price),
            expected,
            "Wrong platform earnings calculation"
        );
    }

    function test_FeeCalculations_SumToTotal() public view {
        uint256 price = 123 * 10 ** 18; // 123 USDT (non-round number)

        uint256 buyerCost = market.calculateBuyerCost(price);
        uint256 predictorPayout = market.calculatePredictorPayout(price);
        uint256 platformEarnings = market.calculatePlatformEarnings(price);

        // Buyer cost should equal predictor payout + platform earnings
        assertEq(
            buyerCost,
            predictorPayout + platformEarnings,
            "Fee calculations don't sum correctly"
        );
    }

    // ============================================
    // VIEW FUNCTION TESTS
    // ============================================

    function test_IsValidPredictor() public {
        // Not registered
        assertFalse(
            market.isValidPredictor(predictor1),
            "Should not be valid before registration"
        );

        // Register
        _registerPredictor(predictor1);
        assertTrue(
            market.isValidPredictor(predictor1),
            "Should be valid after registration"
        );

        // Blacklist
        _blacklistPredictor(predictor1);
        assertFalse(
            market.isValidPredictor(predictor1),
            "Should not be valid after blacklisting"
        );

        // Unblacklist
        _unblacklistPredictor(predictor1);
        assertTrue(
            market.isValidPredictor(predictor1),
            "Should be valid after unblacklisting"
        );
    }

    // ============================================
    // PAUSE/UNPAUSE TESTS
    // ============================================

    function test_Pause_BlocksOperations() public {
        _pauseMarket();
        assertTrue(market.paused(), "Contract should be paused");

        // Try to join
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);
        vm.prank(predictor1);
        vm.expectRevert(SignalFriendMarket.ContractCurrentlyPaused.selector);
        market.joinAsPredictor(address(0));
    }

    function test_Unpause_AllowsOperations() public {
        _pauseMarket();
        _unpauseMarket();

        assertFalse(market.paused(), "Contract should be unpaused");

        // Should be able to join now
        _registerPredictor(predictor1);
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be able to register after unpause"
        );
    }

    // ============================================
    // MULTISIG TESTS
    // ============================================

    function test_MultiSig_NonSignerCannotPropose() public {
        vm.prank(randomUser);
        vm.expectRevert(SignalFriendMarket.OnlyMultiSigSigner.selector);
        market.proposePauseContract();
    }

    function test_MultiSig_ActionExpiresAfterOneHour() public {
        // Propose action
        vm.prank(signer1);
        bytes32 actionId = market.proposePauseContract();

        // Approve with signer2
        vm.prank(signer2);
        market.approveAction(actionId);

        // Wait more than 1 hour
        vm.warp(block.timestamp + ACTION_EXPIRY_TIME + 1);

        // Signer3 should not be able to approve expired action
        vm.prank(signer3);
        vm.expectRevert(SignalFriendMarket.ActionExpired.selector);
        market.approveAction(actionId);
    }

    function test_MultiSig_CannotAproveTwice() public {
        vm.prank(signer1);
        bytes32 actionId = market.proposePauseContract();

        // Signer1 already approved via proposal, try again
        vm.prank(signer1);
        vm.expectRevert(SignalFriendMarket.AlreadyApproved.selector);
        market.approveAction(actionId);
    }
}
