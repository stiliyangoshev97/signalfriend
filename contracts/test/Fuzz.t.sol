// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./helpers/TestHelper.sol";

/**
 * @title Fuzz Tests for SignalFriend Platform
 * @notice Property-based tests using random inputs to find edge cases
 * @dev Uses Foundry's built-in fuzzing with bounded inputs
 */
contract FuzzTest is TestHelper {
    // ============================================
    // CONSTANTS FOR FUZZ BOUNDS
    // ============================================

    /// @notice Maximum reasonable signal price for testing (10,000 USDT)
    uint256 constant MAX_SIGNAL_PRICE = 10_000 * 10 ** 18;

    /// @notice Maximum number of users to fuzz with
    uint256 constant MAX_USERS = 50;

    /// @notice Maximum number of purchases per user
    uint256 constant MAX_PURCHASES_PER_USER = 20;

    // ============================================
    // PAYMENT CALCULATION FUZZ TESTS
    // ============================================

    /**
     * @notice Fuzz test: Verify commission calculation is always correct
     * @param _signalPrice Random signal price (bounded to valid range)
     */
    function testFuzz_CommissionCalculation(uint256 _signalPrice) public view {
        // Bound to valid range: min 5 USDT, max 10,000 USDT
        _signalPrice = bound(_signalPrice, MIN_SIGNAL_PRICE, MAX_SIGNAL_PRICE);

        // Calculate commission manually (same formula as contract)
        uint256 expectedCommission = (_signalPrice * COMMISSION_RATE) /
            BASIS_POINTS;

        // Verify via predictor payout: commission = signalPrice - predictorPayout
        uint256 predictorPayout = market.calculatePredictorPayout(_signalPrice);
        uint256 actualCommission = _signalPrice - predictorPayout;

        assertEq(
            actualCommission,
            expectedCommission,
            "Commission calculation mismatch"
        );

        // Verify commission is always less than signal price
        assertTrue(
            actualCommission < _signalPrice,
            "Commission should be less than price"
        );

        // Verify commission is approximately 5% (allow for rounding at small values)
        // For prices >= 100 wei, commission should be 4-5% due to integer division
        if (_signalPrice >= 100) {
            uint256 actualPercentage = (actualCommission * 100) / _signalPrice;
            assertTrue(
                actualPercentage >= 4 && actualPercentage <= 5,
                "Commission percentage should be ~5%"
            );
        }
    }

    /**
     * @notice Fuzz test: Verify predictor payout calculation
     * @param _signalPrice Random signal price
     */
    function testFuzz_PredictorPayoutCalculation(
        uint256 _signalPrice
    ) public view {
        _signalPrice = bound(_signalPrice, MIN_SIGNAL_PRICE, MAX_SIGNAL_PRICE);

        // Calculate expected payout manually
        uint256 commission = (_signalPrice * COMMISSION_RATE) / BASIS_POINTS;
        uint256 expectedPayout = _signalPrice - commission;
        uint256 actualPayout = market.calculatePredictorPayout(_signalPrice);

        assertEq(
            actualPayout,
            expectedPayout,
            "Predictor payout calculation mismatch"
        );

        // Verify payout is approximately 95% of signal price (with rounding tolerance)
        // Due to integer division, payout could be 94-95%
        assertTrue(actualPayout >= (_signalPrice * 94) / 100, "Payout too low");
        assertTrue(
            actualPayout <= _signalPrice,
            "Payout should not exceed signal price"
        );

        // Verify commission + payout = signal price (no value lost)
        assertEq(
            actualPayout + commission,
            _signalPrice,
            "Payout + commission should equal signal price"
        );
    }

    /**
     * @notice Fuzz test: Verify buyer cost calculation
     * @param _signalPrice Random signal price
     */
    function testFuzz_BuyerCostCalculation(uint256 _signalPrice) public view {
        _signalPrice = bound(_signalPrice, MIN_SIGNAL_PRICE, MAX_SIGNAL_PRICE);

        uint256 expectedCost = _signalPrice + BUYER_ACCESS_FEE;
        uint256 actualCost = market.calculateBuyerCost(_signalPrice);

        assertEq(actualCost, expectedCost, "Buyer cost calculation mismatch");

        // Verify buyer cost is always more than signal price
        assertTrue(
            actualCost > _signalPrice,
            "Buyer cost should include access fee"
        );

        // Verify the difference is exactly the buyer access fee
        assertEq(
            actualCost - _signalPrice,
            BUYER_ACCESS_FEE,
            "Access fee not applied correctly"
        );
    }

    /**
     * @notice Fuzz test: Verify total fees add up correctly (conservation of value)
     * @param _signalPrice Random signal price
     */
    function testFuzz_FeeConservation(uint256 _signalPrice) public view {
        _signalPrice = bound(_signalPrice, MIN_SIGNAL_PRICE, MAX_SIGNAL_PRICE);

        uint256 buyerCost = market.calculateBuyerCost(_signalPrice);
        uint256 predictorPayout = market.calculatePredictorPayout(_signalPrice);
        // Calculate commission manually
        uint256 commission = _signalPrice - predictorPayout;

        // Verify: buyerCost = predictorPayout + commission + buyerAccessFee
        uint256 totalDistributed = predictorPayout +
            commission +
            BUYER_ACCESS_FEE;
        assertEq(totalDistributed, buyerCost, "Fee conservation violated");

        // Verify: signalPrice = predictorPayout + commission
        assertEq(
            predictorPayout + commission,
            _signalPrice,
            "Signal price split incorrect"
        );
    }

    /**
     * @notice Fuzz test: Actual purchase verifies fee distribution
     * @param _signalPrice Random signal price
     */
    function testFuzz_ActualPurchaseFeeDistribution(
        uint256 _signalPrice
    ) public {
        _signalPrice = bound(_signalPrice, MIN_SIGNAL_PRICE, MAX_SIGNAL_PRICE);

        _registerPredictor(predictor1);

        uint256 predictorBalanceBefore = usdt.balanceOf(predictor1);
        uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);

        bytes32 contentId = keccak256(
            abi.encodePacked("fuzz-signal-", _signalPrice)
        );
        _buySignal(buyer1, predictor1, _signalPrice, contentId);

        uint256 expectedPredictorPayout = market.calculatePredictorPayout(
            _signalPrice
        );
        // Calculate commission manually
        uint256 expectedCommission = _signalPrice - expectedPredictorPayout;
        uint256 expectedTreasuryIncome = expectedCommission + BUYER_ACCESS_FEE;

        assertEq(
            usdt.balanceOf(predictor1),
            predictorBalanceBefore + expectedPredictorPayout,
            "Predictor payout incorrect"
        );
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceBefore + expectedTreasuryIncome,
            "Treasury income incorrect"
        );
    }

    // ============================================
    // TOKEN ID FUZZ TESTS
    // ============================================

    /**
     * @notice Fuzz test: Token IDs always increment correctly
     * @param _numPurchases Number of purchases to make (bounded)
     */
    function testFuzz_TokenIdIncrement(uint8 _numPurchases) public {
        // Bound to reasonable range (1-50 purchases)
        uint256 numPurchases = bound(uint256(_numPurchases), 1, 50);

        _registerPredictor(predictor1);

        uint256 previousTokenId = 0;
        for (uint256 i = 0; i < numPurchases; i++) {
            bytes32 contentId = keccak256(
                abi.encodePacked("token-id-test-", i)
            );
            address buyer = makeAddr(string(abi.encodePacked("buyer-", i)));

            uint256 tokenId = _buySignal(
                buyer,
                predictor1,
                MIN_SIGNAL_PRICE,
                contentId
            );

            // Verify token ID is strictly incrementing
            assertEq(
                tokenId,
                previousTokenId + 1,
                "Token ID should increment by 1"
            );
            previousTokenId = tokenId;
        }

        // Verify total minted matches
        assertEq(
            signalKey.totalMinted(),
            numPurchases,
            "Total minted mismatch"
        );
    }

    /**
     * @notice Fuzz test: Content identifiers are stored correctly
     * @param _contentId Random content identifier
     */
    function testFuzz_ContentIdentifierStorage(bytes32 _contentId) public {
        // Skip zero content ID if your contract rejects it (most don't)
        vm.assume(_contentId != bytes32(0) || true); // Allow all for this test

        _registerPredictor(predictor1);

        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            MIN_SIGNAL_PRICE,
            _contentId
        );

        assertEq(
            signalKey.getContentIdentifier(tokenId),
            _contentId,
            "Content identifier not stored correctly"
        );
    }

    // ============================================
    // MULTI-USER FUZZ TESTS
    // ============================================

    /**
     * @notice Fuzz test: Multiple predictors with random referral chains
     * @param _numPredictors Number of predictors to register
     * @param _referralSeed Seed for determining referral relationships
     */
    function testFuzz_ReferralChain(
        uint8 _numPredictors,
        uint256 _referralSeed
    ) public {
        uint256 numPredictors = bound(uint256(_numPredictors), 2, 20);
        // Bound referral seed to avoid overflow
        _referralSeed = bound(_referralSeed, 0, type(uint128).max);

        address[] memory predictors = new address[](numPredictors);
        uint256 totalReferralsPaid = 0;

        for (uint256 i = 0; i < numPredictors; i++) {
            predictors[i] = makeAddr(
                string(abi.encodePacked("ref-predictor-", i))
            );

            if (i == 0) {
                // First predictor has no referrer
                _registerPredictor(predictors[i]);
            } else {
                // Use seed to determine if this predictor uses a referrer
                bool useReferrer = ((_referralSeed >> (i % 64)) & 1) == 1;

                if (useReferrer) {
                    // Pick a random previous predictor as referrer (safe modulo)
                    uint256 referrerIndex = (_referralSeed % i);
                    address referrer = predictors[referrerIndex];

                    uint256 referrerBalanceBefore = usdt.balanceOf(referrer);
                    _registerPredictorWithReferrer(predictors[i], referrer);

                    // Check if referral was paid (referrer must be active)
                    if (accessPass.isPredictorActive(referrer)) {
                        assertEq(
                            usdt.balanceOf(referrer),
                            referrerBalanceBefore + REFERRAL_PAYOUT,
                            "Referral payout incorrect"
                        );
                        totalReferralsPaid++;
                    }
                } else {
                    _registerPredictor(predictors[i]);
                }
            }
        }

        assertEq(
            market.totalPredictorsJoined(),
            numPredictors,
            "Predictor count mismatch"
        );
        assertEq(
            market.totalReferralsPaid(),
            totalReferralsPaid,
            "Referral count mismatch"
        );
    }

    /**
     * @notice Fuzz test: Many buyers purchasing from many predictors
     * @param _numPredictors Number of predictors
     * @param _numBuyers Number of buyers
     * @param _purchasesPerBuyer Purchases per buyer
     */
    function testFuzz_MassMarketplace(
        uint8 _numPredictors,
        uint8 _numBuyers,
        uint8 _purchasesPerBuyer
    ) public {
        uint256 numPredictors = bound(uint256(_numPredictors), 1, 10);
        uint256 numBuyers = bound(uint256(_numBuyers), 1, 10);
        uint256 purchasesPerBuyer = bound(uint256(_purchasesPerBuyer), 1, 5);

        // Register predictors
        address[] memory predictors = new address[](numPredictors);
        for (uint256 i = 0; i < numPredictors; i++) {
            predictors[i] = makeAddr(
                string(abi.encodePacked("mass-predictor-", i))
            );
            _registerPredictor(predictors[i]);
        }

        // Create buyers and make purchases
        uint256 totalPurchases = 0;
        for (uint256 i = 0; i < numBuyers; i++) {
            address buyer = makeAddr(
                string(abi.encodePacked("mass-buyer-", i))
            );

            for (uint256 j = 0; j < purchasesPerBuyer; j++) {
                // Pick a random predictor
                address predictor = predictors[(i + j) % numPredictors];
                bytes32 contentId = keccak256(
                    abi.encodePacked("mass-signal-", i, "-", j)
                );

                _buySignal(buyer, predictor, MIN_SIGNAL_PRICE, contentId);
                totalPurchases++;
            }

            // Verify buyer's NFT count
            assertEq(
                signalKey.balanceOf(buyer),
                purchasesPerBuyer,
                "Buyer NFT count mismatch"
            );
        }

        assertEq(
            market.totalSignalsPurchased(),
            totalPurchases,
            "Total purchases mismatch"
        );
        assertEq(
            signalKey.totalMinted(),
            totalPurchases,
            "Total minted mismatch"
        );
    }

    // ============================================
    // EDGE CASE FUZZ TESTS
    // ============================================

    /**
     * @notice Fuzz test: Signal price at exact boundaries
     * @param _priceOffset Offset from minimum price (can be 0)
     */
    function testFuzz_PriceBoundaries(uint256 _priceOffset) public {
        // Test prices from exactly minimum to minimum + offset
        _priceOffset = bound(
            _priceOffset,
            0,
            MAX_SIGNAL_PRICE - MIN_SIGNAL_PRICE
        );
        uint256 signalPrice = MIN_SIGNAL_PRICE + _priceOffset;

        _registerPredictor(predictor1);

        bytes32 contentId = keccak256(
            abi.encodePacked("boundary-test-", _priceOffset)
        );

        // Should succeed at any valid price
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            signalPrice,
            contentId
        );
        assertTrue(tokenId > 0, "Should mint valid token");
    }

    /**
     * @notice Fuzz test: Price below minimum should always revert
     * @param _invalidPrice Price below minimum
     */
    function testFuzz_PriceBelowMinimum(uint256 _invalidPrice) public {
        // Ensure price is below minimum (but not zero to avoid other reverts)
        _invalidPrice = bound(_invalidPrice, 1, MIN_SIGNAL_PRICE - 1);

        _registerPredictor(predictor1);

        uint256 totalCost = _invalidPrice + BUYER_ACCESS_FEE;
        _fundUserWithUSDT(buyer1, totalCost);

        vm.prank(buyer1);
        vm.expectRevert(SignalFriendMarket.SignalPriceTooLow.selector);
        market.buySignalNFT(
            predictor1,
            _invalidPrice,
            COMMISSION_RATE,
            keccak256("invalid")
        );
    }

    /**
     * @notice Fuzz test: Commission rate slippage protection
     * @param _maxCommissionRate Max commission rate buyer is willing to accept
     */
    function testFuzz_CommissionRateSlippage(
        uint256 _maxCommissionRate
    ) public {
        _registerPredictor(predictor1);

        uint256 signalPrice = MIN_SIGNAL_PRICE;
        uint256 totalCost = market.calculateBuyerCost(signalPrice);
        _fundUserWithUSDT(buyer1, totalCost);

        bytes32 contentId = keccak256("slippage-test");

        vm.prank(buyer1);

        if (_maxCommissionRate < COMMISSION_RATE) {
            // Should revert if max commission is less than actual
            vm.expectRevert(SignalFriendMarket.InvalidCommissionRate.selector);
            market.buySignalNFT(
                predictor1,
                signalPrice,
                _maxCommissionRate,
                contentId
            );
        } else {
            // Should succeed if max commission >= actual
            market.buySignalNFT(
                predictor1,
                signalPrice,
                _maxCommissionRate,
                contentId
            );
            assertEq(signalKey.balanceOf(buyer1), 1, "Should have minted NFT");
        }
    }

    /**
     * @notice Fuzz test: Referral with various invalid addresses
     * @param _invalidReferrer Random address that's not a predictor
     */
    function testFuzz_InvalidReferrer(address _invalidReferrer) public {
        // Ensure the address is not already a predictor and not zero
        vm.assume(_invalidReferrer != address(0));
        vm.assume(!accessPass.isPredictorActive(_invalidReferrer));
        vm.assume(_invalidReferrer != predictor1);

        uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);

        // Join with invalid referrer - should succeed but no referral payout
        _fundUserWithUSDT(predictor1, PREDICTOR_JOIN_FEE);
        vm.prank(predictor1);
        market.joinAsPredictor(_invalidReferrer);

        // Verify full fee went to treasury (no referral)
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceBefore + PREDICTOR_JOIN_FEE,
            "Treasury should receive full fee"
        );
        assertEq(
            usdt.balanceOf(_invalidReferrer),
            0,
            "Invalid referrer should receive nothing"
        );
        assertEq(
            market.totalReferralsPaid(),
            0,
            "No referral should be counted"
        );
    }

    /**
     * @notice Fuzz test: Self-referral should not pay out
     */
    function testFuzz_SelfReferral(address _user) public {
        vm.assume(_user != address(0));
        vm.assume(_user != treasury);
        vm.assume(_user != address(market));

        uint256 treasuryBalanceBefore = usdt.balanceOf(treasury);

        _fundUserWithUSDT(_user, PREDICTOR_JOIN_FEE);
        vm.prank(_user);
        market.joinAsPredictor(_user); // Self-referral

        // Full fee should go to treasury
        assertEq(
            usdt.balanceOf(treasury),
            treasuryBalanceBefore + PREDICTOR_JOIN_FEE,
            "Self-referral should not reduce treasury income"
        );
        assertEq(
            market.totalReferralsPaid(),
            0,
            "Self-referral should not count"
        );
    }

    // ============================================
    // TRANSFER FUZZ TESTS
    // ============================================

    /**
     * @notice Fuzz test: SignalKeyNFT transfers to random addresses
     * @param _recipient Random recipient address
     */
    function testFuzz_SignalKeyTransfer(address _recipient) public {
        // Exclude invalid recipients
        vm.assume(_recipient != address(0));
        vm.assume(_recipient != buyer1);

        _registerPredictor(predictor1);

        bytes32 contentId = keccak256("transfer-test");
        uint256 tokenId = _buySignal(
            buyer1,
            predictor1,
            MIN_SIGNAL_PRICE,
            contentId
        );

        // Transfer to random recipient
        vm.prank(buyer1);
        signalKey.transferFrom(buyer1, _recipient, tokenId);

        assertEq(
            signalKey.ownerOf(tokenId),
            _recipient,
            "Recipient should own token"
        );
        assertEq(
            signalKey.balanceOf(_recipient),
            1,
            "Recipient balance should be 1"
        );
        assertEq(signalKey.balanceOf(buyer1), 0, "Sender balance should be 0");

        // Content ID should be preserved
        assertEq(
            signalKey.getContentIdentifier(tokenId),
            contentId,
            "Content ID should be preserved"
        );
    }

    /**
     * @notice Fuzz test: PredictorAccessPass is always soulbound
     * @param _recipient Random recipient address
     */
    function testFuzz_PredictorPassSoulbound(address _recipient) public {
        vm.assume(_recipient != address(0));
        vm.assume(_recipient != predictor1);

        _registerPredictor(predictor1);
        uint256 tokenId = accessPass.getPredictorTokenId(predictor1);

        // Attempt transfer should always fail
        vm.prank(predictor1);
        vm.expectRevert(PredictorAccessPass.TransfersNotAllowed.selector);
        accessPass.transferFrom(predictor1, _recipient, tokenId);

        // Verify ownership unchanged
        assertEq(
            accessPass.ownerOf(tokenId),
            predictor1,
            "Ownership should not change"
        );
    }

    // ============================================
    // STRESS TESTS
    // ============================================

    /**
     * @notice Fuzz test: Large number of sequential purchases from single predictor
     * @param _numPurchases Number of purchases (bounded)
     */
    function testFuzz_SequentialPurchases(uint8 _numPurchases) public {
        uint256 numPurchases = bound(uint256(_numPurchases), 1, 100);

        _registerPredictor(predictor1);

        uint256 predictorBalanceBefore = usdt.balanceOf(predictor1);
        uint256 expectedTotalPayout = 0;

        for (uint256 i = 0; i < numPurchases; i++) {
            address buyer = makeAddr(string(abi.encodePacked("seq-buyer-", i)));
            bytes32 contentId = keccak256(abi.encodePacked("seq-signal-", i));

            _buySignal(buyer, predictor1, MIN_SIGNAL_PRICE, contentId);
            expectedTotalPayout += market.calculatePredictorPayout(
                MIN_SIGNAL_PRICE
            );
        }

        assertEq(
            usdt.balanceOf(predictor1),
            predictorBalanceBefore + expectedTotalPayout,
            "Total predictor payout incorrect"
        );
        assertEq(
            market.totalSignalsPurchased(),
            numPurchases,
            "Total purchases mismatch"
        );
    }

    /**
     * @notice Fuzz test: Verify no overflow in large price calculations
     * @param _multiplier Price multiplier for large values
     */
    function testFuzz_LargePriceNoOverflow(uint256 _multiplier) public view {
        // Test with large but valid prices
        _multiplier = bound(_multiplier, 1, 1000);
        uint256 largePrice = MIN_SIGNAL_PRICE * _multiplier;

        // Ensure we don't exceed uint256 max in calculations
        vm.assume(largePrice <= type(uint256).max / BASIS_POINTS);

        uint256 buyerCost = market.calculateBuyerCost(largePrice);
        uint256 payout = market.calculatePredictorPayout(largePrice);
        // Calculate commission manually
        uint256 commission = largePrice - payout;

        // Verify no overflow - values should be sensible
        assertTrue(buyerCost > largePrice, "Buyer cost should exceed price");
        assertTrue(
            commission < largePrice,
            "Commission should be less than price"
        );
        assertTrue(payout < largePrice, "Payout should be less than price");
        assertEq(
            commission + payout,
            largePrice,
            "Commission + payout should equal price"
        );
    }
}
