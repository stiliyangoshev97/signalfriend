// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestHelper.sol";

/**
 * @title Integration Tests for SignalFriend Platform
 * @notice End-to-end tests covering full user journeys and multi-user scenarios
 * @dev These tests verify cross-contract interactions and complex workflows
 */
contract IntegrationTest is TestHelper {
    // ============================================
    // ADDITIONAL TEST ACCOUNTS (for multi-user tests)
    // ============================================
    address public predictor3;
    address public predictor4;
    address public predictor5;
    address public buyer3;
    address public buyer4;
    address public buyer5;
    address public buyer6;
    address public buyer7;
    address public buyer8;
    address public buyer9;
    address public buyer10;

    function setUp() public override {
        super.setUp();

        // Create additional test accounts for large-scale tests
        predictor3 = makeAddr("predictor3");
        predictor4 = makeAddr("predictor4");
        predictor5 = makeAddr("predictor5");
        buyer3 = makeAddr("buyer3");
        buyer4 = makeAddr("buyer4");
        buyer5 = makeAddr("buyer5");
        buyer6 = makeAddr("buyer6");
        buyer7 = makeAddr("buyer7");
        buyer8 = makeAddr("buyer8");
        buyer9 = makeAddr("buyer9");
        buyer10 = makeAddr("buyer10");
    }

    // ============================================
    // FULL USER JOURNEY TESTS
    // ============================================

    /**
     * @notice Test complete predictor journey: register → receive purchases → check earnings
     */
    function test_Integration_FullPredictorJourney() public {
        // Step 1: Register as predictor
        uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);
        _registerPredictor(predictor1);

        // Verify predictor registration
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Should be active predictor"
        );
        assertEq(accessPass.balanceOf(predictor1), 1, "Should have 1 NFT");
        assertEq(
            market.totalPredictorsJoined(),
            1,
            "Total predictors should be 1"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceBefore + PREDICTOR_JOIN_FEE,
            "Treasury should receive join fee"
        );

        // Step 2: Receive signal purchases from multiple buyers
        bytes32 contentId1 = keccak256("signal-content-1");
        bytes32 contentId2 = keccak256("signal-content-2");
        uint256 signalPrice = 10 * 10 ** 18; // 10 USDT

        uint256 predictorBalanceBefore = usdt.balanceOf(predictor1);

        // Buyer 1 purchases signal 1
        _buySignal(buyer1, predictor1, signalPrice, contentId1);
        // Buyer 2 purchases signal 1 (same content, different receipt)
        _buySignal(buyer2, predictor1, signalPrice, contentId1);
        // Buyer 3 purchases signal 2 (different content)
        _buySignal(buyer3, predictor1, signalPrice, contentId2);

        // Step 3: Verify earnings
        uint256 expectedPredictorEarnings = ((signalPrice *
            (BASIS_POINTS - COMMISSION_RATE)) / BASIS_POINTS) * 3;
        assertEq(
            usdt.balanceOf(predictor1),
            predictorBalanceBefore + expectedPredictorEarnings,
            "Predictor should receive correct earnings"
        );

        // Verify platform stats
        assertEq(
            market.totalSignalsPurchased(),
            3,
            "Total signals should be 3"
        );
    }

    /**
     * @notice Test complete trader journey: buy signals → transfer NFT → verify access
     */
    function test_Integration_FullTraderJourney() public {
        // Setup: Register a predictor
        _registerPredictor(predictor1);

        bytes32 contentId1 = keccak256("premium-signal-1");
        bytes32 contentId2 = keccak256("premium-signal-2");
        uint256 signalPrice = 5 * 10 ** 18; // 5 USDT (minimum)

        // Step 1: Buy multiple signals
        uint256 tokenId1 = _buySignal(
            buyer1,
            predictor1,
            signalPrice,
            contentId1
        );
        uint256 tokenId2 = _buySignal(
            buyer1,
            predictor1,
            signalPrice,
            contentId2
        );

        // Verify ownership
        assertEq(
            signalKey.ownerOf(tokenId1),
            buyer1,
            "Buyer1 should own token 1"
        );
        assertEq(
            signalKey.ownerOf(tokenId2),
            buyer1,
            "Buyer1 should own token 2"
        );
        assertEq(signalKey.balanceOf(buyer1), 2, "Buyer1 should have 2 NFTs");

        // Verify content identifiers
        assertEq(
            signalKey.getContentIdentifier(tokenId1),
            contentId1,
            "Token 1 content ID mismatch"
        );
        assertEq(
            signalKey.getContentIdentifier(tokenId2),
            contentId2,
            "Token 2 content ID mismatch"
        );

        // Step 2: Transfer one NFT to another address
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId1);

        // Verify transfer
        assertEq(
            signalKey.ownerOf(tokenId1),
            buyer2,
            "Buyer2 should now own token 1"
        );
        assertEq(signalKey.balanceOf(buyer1), 1, "Buyer1 should have 1 NFT");
        assertEq(signalKey.balanceOf(buyer2), 1, "Buyer2 should have 1 NFT");

        // Step 3: Verify content identifier preserved after transfer
        assertEq(
            signalKey.getContentIdentifier(tokenId1),
            contentId1,
            "Content ID should be preserved after transfer"
        );

        // Step 4: Verify tokensOfOwner updates correctly
        uint256[] memory buyer1Tokens = signalKey.tokensOfOwner(buyer1);
        uint256[] memory buyer2Tokens = signalKey.tokensOfOwner(buyer2);

        assertEq(buyer1Tokens.length, 1, "Buyer1 should have 1 token in array");
        assertEq(buyer2Tokens.length, 1, "Buyer2 should have 1 token in array");
        assertEq(buyer1Tokens[0], tokenId2, "Buyer1 should have token 2");
        assertEq(buyer2Tokens[0], tokenId1, "Buyer2 should have token 1");
    }

    /**
     * @notice Test referral chain: A refers B, B refers C, verify all payouts
     */
    function test_Integration_ReferralChain() public {
        // Step 1: Predictor A joins (no referrer)
        uint256 treasuryBalanceStart = usdt.balanceOf(treasury);
        _registerPredictor(predictor1);
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceStart + PREDICTOR_JOIN_FEE,
            "Treasury gets full fee"
        );
        assertEq(market.totalReferralsPaid(), 0, "No referrals yet");

        // Step 2: Predictor B joins with A as referrer
        uint256 predictor1BalanceBefore = usdt.balanceOf(predictor1);
        uint256 treasuryBeforeB = usdt.balanceOf(treasury);

        _registerPredictorWithReferrer(predictor2, predictor1);

        assertEq(
            usdt.balanceOf(predictor1),
            predictor1BalanceBefore + REFERRAL_PAYOUT,
            "Predictor A should receive referral payout"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBeforeB + (PREDICTOR_JOIN_FEE - REFERRAL_PAYOUT),
            "Treasury gets fee minus referral"
        );
        assertEq(market.totalReferralsPaid(), 1, "One referral paid");

        // Step 3: Predictor C joins with B as referrer
        uint256 predictor2BalanceBefore = usdt.balanceOf(predictor2);
        uint256 treasuryBeforeC = usdt.balanceOf(treasury);

        _registerPredictorWithReferrer(predictor3, predictor2);

        assertEq(
            usdt.balanceOf(predictor2),
            predictor2BalanceBefore + REFERRAL_PAYOUT,
            "Predictor B should receive referral payout"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBeforeC + (PREDICTOR_JOIN_FEE - REFERRAL_PAYOUT),
            "Treasury gets fee minus referral"
        );
        assertEq(market.totalReferralsPaid(), 2, "Two referrals paid");

        // Step 4: Predictor D tries to use blacklisted referrer
        _blacklistPredictor(predictor3);
        uint256 treasuryBeforeD = usdt.balanceOf(treasury);
        uint256 predictor3BalanceBefore = usdt.balanceOf(predictor3);

        _registerPredictorWithReferrer(predictor4, predictor3); // Blacklisted referrer

        // Blacklisted referrer should NOT receive payout
        assertEq(
            usdt.balanceOf(predictor3),
            predictor3BalanceBefore,
            "Blacklisted referrer should NOT receive payout"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBeforeD + PREDICTOR_JOIN_FEE,
            "Treasury gets full fee when referrer is blacklisted"
        );
        assertEq(
            market.totalReferralsPaid(),
            2,
            "Referral count unchanged (blacklisted referrer)"
        );
    }

    /**
     * @notice Test multi-user marketplace: 5 predictors, 10 traders, many purchases
     */
    function test_Integration_MultiUserMarketplace() public {
        // Setup: Register 5 predictors
        address[5] memory predictors = [
            predictor1,
            predictor2,
            predictor3,
            predictor4,
            predictor5
        ];
        for (uint256 i = 0; i < 5; i++) {
            _registerPredictor(predictors[i]);
        }
        assertEq(market.totalPredictorsJoined(), 5, "Should have 5 predictors");

        // Setup: 10 buyers
        address[10] memory buyers = [
            buyer1,
            buyer2,
            buyer3,
            buyer4,
            buyer5,
            buyer6,
            buyer7,
            buyer8,
            buyer9,
            buyer10
        ];

        // Each buyer purchases from each predictor (50 total purchases)
        uint256 signalPrice = 5 * 10 ** 18;
        uint256 purchaseCount = 0;

        for (uint256 i = 0; i < 10; i++) {
            for (uint256 j = 0; j < 5; j++) {
                bytes32 contentId = keccak256(abi.encodePacked("signal", i, j));
                _buySignal(buyers[i], predictors[j], signalPrice, contentId);
                purchaseCount++;
            }
        }

        // Verify totals
        assertEq(
            market.totalSignalsPurchased(),
            50,
            "Should have 50 purchases"
        );
        assertEq(signalKey.totalMinted(), 50, "Should have minted 50 NFTs");

        // Verify each buyer has 5 NFTs
        for (uint256 i = 0; i < 10; i++) {
            assertEq(
                signalKey.balanceOf(buyers[i]),
                5,
                "Each buyer should have 5 NFTs"
            );
        }

        // Verify predictor earnings (each predictor received 10 purchases)
        uint256 expectedEarningsPerPredictor = ((signalPrice *
            (BASIS_POINTS - COMMISSION_RATE)) / BASIS_POINTS) * 10;
        for (uint256 i = 0; i < 5; i++) {
            assertEq(
                usdt.balanceOf(predictors[i]),
                expectedEarningsPerPredictor,
                "Each predictor should have correct earnings"
            );
        }
    }

    /**
     * @notice Test blacklist during active trading
     */
    function test_Integration_BlacklistMidTransaction() public {
        // Setup: Register predictor and make some sales
        _registerPredictor(predictor1);

        bytes32 contentId = keccak256("signal-before-blacklist");
        uint256 signalPrice = 5 * 10 ** 18;

        // Successful purchase before blacklist
        _buySignal(buyer1, predictor1, signalPrice, contentId);
        assertEq(market.totalSignalsPurchased(), 1, "Should have 1 purchase");

        // Blacklist the predictor
        _blacklistPredictor(predictor1);
        assertFalse(
            accessPass.isPredictorActive(predictor1),
            "Predictor should be inactive"
        );

        // Verify predictor still owns their NFT
        assertEq(
            accessPass.balanceOf(predictor1),
            1,
            "Blacklisted predictor still owns NFT"
        );

        // Attempt purchase from blacklisted predictor should fail
        uint256 totalCost = market.calculateBuyerCost(signalPrice);
        _fundUserWithUSDT(buyer2, totalCost);

        vm.prank(buyer2);
        vm.expectRevert(SignalFriendMarket.InvalidPredictor.selector);
        market.buySignalNFT(
            predictor1,
            signalPrice,
            COMMISSION_RATE,
            keccak256("new-signal")
        );

        // Unblacklist and verify trading resumes
        _unblacklistPredictor(predictor1);
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Predictor should be active again"
        );

        // Purchase should now succeed
        _buySignal(
            buyer2,
            predictor1,
            signalPrice,
            keccak256("signal-after-unblacklist")
        );
        assertEq(market.totalSignalsPurchased(), 2, "Should have 2 purchases");
    }

    /**
     * @notice Test pause during marketplace activity
     */
    function test_Integration_PauseDuringActivity() public {
        // Setup: Register predictors and perform initial purchases
        _registerPredictor(predictor1);
        _registerPredictor(predictor2);

        bytes32 contentId = keccak256("signal-before-pause");
        uint256 signalPrice = 5 * 10 ** 18;

        // Successful purchases before pause
        _buySignal(buyer1, predictor1, signalPrice, contentId);
        _buySignal(buyer2, predictor2, signalPrice, contentId);
        assertEq(market.totalSignalsPurchased(), 2, "Should have 2 purchases");

        // Pause the market
        _pauseMarket();
        assertTrue(market.paused(), "Market should be paused");

        // All operations should fail while paused
        uint256 totalCost = market.calculateBuyerCost(signalPrice);
        _fundUserWithUSDT(buyer3, totalCost);

        vm.prank(buyer3);
        vm.expectRevert(SignalFriendMarket.ContractCurrentlyPaused.selector);
        market.buySignalNFT(
            predictor1,
            signalPrice,
            COMMISSION_RATE,
            keccak256("paused-signal")
        );

        // New predictor registration should also fail
        _fundUserWithUSDT(predictor3, PREDICTOR_JOIN_FEE);
        vm.prank(predictor3);
        vm.expectRevert(SignalFriendMarket.ContractCurrentlyPaused.selector);
        market.joinAsPredictor(address(0));

        // Unpause
        _unpauseMarket();
        assertFalse(market.paused(), "Market should be unpaused");

        // Operations should resume
        _buySignal(
            buyer3,
            predictor1,
            signalPrice,
            keccak256("after-unpause-signal")
        );
        assertEq(market.totalSignalsPurchased(), 3, "Should have 3 purchases");

        _registerPredictor(predictor3);
        assertEq(market.totalPredictorsJoined(), 3, "Should have 3 predictors");
    }

    /**
     * @notice Test owner mint and subsequent activities
     */
    function test_Integration_OwnerMintJourney() public {
        // Owner mint a free predictor pass
        _ownerMintPredictor(predictor1);

        // Verify predictor status
        assertTrue(
            accessPass.isPredictorActive(predictor1),
            "Owner-minted predictor should be active"
        );
        assertEq(accessPass.balanceOf(predictor1), 1, "Should have 1 NFT");

        // Predictor should NOT be counted in totalPredictorsJoined (owner mint bypasses market)
        assertEq(
            market.totalPredictorsJoined(),
            0,
            "Owner mint doesn't increment market counter"
        );

        // But predictor can still receive purchases
        bytes32 contentId = keccak256("owner-mint-predictor-signal");
        uint256 signalPrice = 5 * 10 ** 18;

        _buySignal(buyer1, predictor1, signalPrice, contentId);

        assertEq(market.totalSignalsPurchased(), 1, "Should have 1 purchase");
        assertEq(signalKey.balanceOf(buyer1), 1, "Buyer should have 1 NFT");
    }

    /**
     * @notice Test same content ID purchased by multiple buyers
     */
    function test_Integration_SameContentMultipleBuyers() public {
        _registerPredictor(predictor1);

        bytes32 sharedContentId = keccak256("shared-premium-signal");
        uint256 signalPrice = 20 * 10 ** 18; // 20 USDT

        // 5 different buyers purchase the same signal content
        address[5] memory buyers = [buyer1, buyer2, buyer3, buyer4, buyer5];
        uint256[] memory tokenIds = new uint256[](5);

        for (uint256 i = 0; i < 5; i++) {
            tokenIds[i] = _buySignal(
                buyers[i],
                predictor1,
                signalPrice,
                sharedContentId
            );
        }

        // Verify all tokens have the same content ID but unique token IDs
        for (uint256 i = 0; i < 5; i++) {
            assertEq(
                signalKey.getContentIdentifier(tokenIds[i]),
                sharedContentId,
                "All tokens should have same content ID"
            );
            assertEq(
                signalKey.ownerOf(tokenIds[i]),
                buyers[i],
                "Each buyer owns their token"
            );

            // Verify unique token IDs
            for (uint256 j = i + 1; j < 5; j++) {
                assertTrue(
                    tokenIds[i] != tokenIds[j],
                    "Token IDs should be unique"
                );
            }
        }

        // Total minted should be 5
        assertEq(
            signalKey.totalMinted(),
            5,
            "Should have minted 5 unique tokens"
        );
    }

    /**
     * @notice Test predictor buying their own signal (allowed but economically dumb)
     */
    function test_Integration_PredictorBuysOwnSignal() public {
        _registerPredictor(predictor1);

        bytes32 contentId = keccak256("self-purchase-signal");
        uint256 signalPrice = 5 * 10 ** 18;

        // Fund predictor to buy their own signal
        uint256 totalCost = market.calculateBuyerCost(signalPrice);
        _fundUserWithUSDT(predictor1, totalCost);

        uint256 predictorBalanceBefore = usdt.balanceOf(predictor1);
        uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);

        // Predictor buys their own signal
        vm.prank(predictor1);
        market.buySignalNFT(
            predictor1,
            signalPrice,
            COMMISSION_RATE,
            contentId
        );

        // Predictor should own the SignalKeyNFT
        assertEq(
            signalKey.balanceOf(predictor1),
            1,
            "Predictor should have SignalKeyNFT"
        );

        // Net effect: predictor loses the commission + buyer access fee
        uint256 commission = (signalPrice * COMMISSION_RATE) / BASIS_POINTS;
        uint256 netLoss = commission + BUYER_ACCESS_FEE;

        assertEq(
            usdt.balanceOf(predictor1),
            predictorBalanceBefore - netLoss,
            "Predictor should have net loss"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceBefore + commission + BUYER_ACCESS_FEE,
            "Treasury should receive commission + access fee"
        );
    }

    /**
     * @notice Test multiple NFT transfers in a chain
     */
    function test_Integration_NFTTransferChain() public {
        _registerPredictor(predictor1);

        bytes32 contentId = keccak256("transferable-signal");
        uint256 signalPrice = 5 * 10 ** 18;

        // Buyer1 purchases
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            signalPrice,
            contentId
        );

        // Transfer chain: buyer1 → buyer2 → buyer3 → buyer4
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, buyer2, tokenId);
        assertEq(signalKey.ownerOf(tokenId), buyer2, "Buyer2 should own token");

        vm.prank(buyer2);
        signalKey.transferFrom(buyer2, buyer3, tokenId);
        assertEq(signalKey.ownerOf(tokenId), buyer3, "Buyer3 should own token");

        vm.prank(buyer3);
        signalKey.transferFrom(buyer3, buyer4, tokenId);
        assertEq(signalKey.ownerOf(tokenId), buyer4, "Buyer4 should own token");

        // Content ID should be preserved through all transfers
        assertEq(
            signalKey.getContentIdentifier(tokenId),
            contentId,
            "Content ID preserved after multiple transfers"
        );

        // Verify tokensOfOwner is correct for all parties
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
            signalKey.tokensOfOwner(buyer3).length,
            0,
            "Buyer3 should have 0 tokens"
        );
        assertEq(
            signalKey.tokensOfOwner(buyer4).length,
            1,
            "Buyer4 should have 1 token"
        );
    }

    /**
     * @notice Test fee calculation accuracy across various price points
     */
    function test_Integration_FeeCalculationAccuracy() public {
        _registerPredictor(predictor1);

        // Test various price points
        uint256[5] memory prices;
        prices[0] = 5 * 10 ** 18; // 5 USDT (minimum)
        prices[1] = 10 * 10 ** 18; // 10 USDT
        prices[2] = 50 * 10 ** 18; // 50 USDT
        prices[3] = 100 * 10 ** 18; // 100 USDT
        prices[4] = 1000 * 10 ** 18; // 1000 USDT

        for (uint256 i = 0; i < 5; i++) {
            uint256 price = prices[i];
            bytes32 contentId = keccak256(abi.encodePacked("price-test-", i));

            uint256 predictorBalanceBefore = usdt.balanceOf(predictor1);
            uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);

            address buyer = makeAddr(
                string(abi.encodePacked("price-test-buyer-", i))
            );
            _buySignal(buyer, predictor1, price, contentId);

            // Calculate expected amounts
            uint256 expectedCommission = (price * COMMISSION_RATE) /
                BASIS_POINTS;
            uint256 expectedPredictorPayout = price - expectedCommission;
            uint256 expectedTreasuryIncome = expectedCommission +
                BUYER_ACCESS_FEE;

            assertEq(
                usdt.balanceOf(predictor1),
                predictorBalanceBefore + expectedPredictorPayout,
                string(
                    abi.encodePacked("Predictor payout incorrect for price ", i)
                )
            );
            assertEq(
                usdt.balanceOf(treasury),
                treasuryBalanceBefore + expectedTreasuryIncome,
                string(
                    abi.encodePacked("Treasury income incorrect for price ", i)
                )
            );
        }
    }
}
