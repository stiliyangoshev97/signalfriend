// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SignalFriendMarket} from "../src/SignalFriendMarket.sol";
import {PredictorAccessPass} from "../src/PredictorAccessPass.sol";
import {SignalKeyNFT} from "../src/SignalKeyNFT.sol";
import {MockUSDT} from "../src/MockUSDT.sol";

/**
 * @title DeployScript
 * @notice Deployment script for SignalFriend contracts on BNB Testnet
 * @dev Implements two-phase deployment pattern:
 *      Phase 1: Deploy Market with address(0) for NFTs, then deploy NFTs with Market address
 *      Phase 2: Update NFT addresses in Market via MultiSig (manual step after deployment)
 *
 * Usage:
 *   # Set environment variables first (see .env.example)
 *   # For BNB Testnet:
 *   forge script script/Deploy.s.sol:DeployScript --rpc-url $BNB_TESTNET_RPC --broadcast --verify
 *
 *   # For local Anvil testing:
 *   forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast
 */
contract DeployScript is Script {
    // ============================================
    // DEPLOYMENT CONFIGURATION
    // ============================================

    // Set to true to deploy MockUSDT (testnet), false to use real USDT (mainnet)
    bool constant DEPLOY_MOCK_USDT = true;

    // BNB Chain Mainnet USDT (Binance-Peg BSC-USD)
    address constant MAINNET_USDT = 0x55d398326f99059fF775485246999027B3197955;

    // Metadata URIs (can be empty for initial deployment, update via MultiSig later)
    string constant PREDICTOR_METADATA_URI = "";
    string constant SIGNAL_KEY_METADATA_URI = "";

    // ============================================
    // DEPLOYED CONTRACTS (set after deployment)
    // ============================================
    MockUSDT public mockUsdt;
    SignalFriendMarket public market;
    PredictorAccessPass public accessPass;
    SignalKeyNFT public signalKey;

    function run() public {
        // ============================================
        // LOAD CONFIGURATION FROM ENVIRONMENT
        // ============================================

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // MultiSig signers (3-of-3)
        address signer1 = vm.envAddress("MULTISIG_SIGNER_1");
        address signer2 = vm.envAddress("MULTISIG_SIGNER_2");
        address signer3 = vm.envAddress("MULTISIG_SIGNER_3");
        address[3] memory signers = [signer1, signer2, signer3];

        // Treasury address for platform fees
        address treasury = vm.envAddress("PLATFORM_TREASURY");

        // ============================================
        // PRE-DEPLOYMENT LOGGING
        // ============================================

        console.log("========================================");
        console.log("   SignalFriend Contract Deployment");
        console.log("========================================");
        console.log("");
        console.log("--- Network Information ---");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Deployer Balance:", deployer.balance / 1e18, "BNB");
        console.log("");
        console.log("--- Configuration ---");
        console.log("Deploy MockUSDT:", DEPLOY_MOCK_USDT);
        console.log("Treasury:", treasury);
        console.log("Signer 1:", signer1);
        console.log("Signer 2:", signer2);
        console.log("Signer 3:", signer3);
        console.log("");

        // ============================================
        // PHASE 1: INITIAL DEPLOYMENT
        // ============================================

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy USDT (MockUSDT for testnet, skip for mainnet)
        address usdtAddress;
        if (DEPLOY_MOCK_USDT) {
            console.log("--- Phase 1.1: Deploying MockUSDT ---");
            mockUsdt = new MockUSDT();
            usdtAddress = address(mockUsdt);
            console.log("MockUSDT deployed at:", usdtAddress);
        } else {
            usdtAddress = MAINNET_USDT;
            console.log("Using mainnet USDT at:", usdtAddress);
        }

        // Step 2: Deploy SignalFriendMarket with address(0) for NFT contracts
        // (NFT contracts need Market address, but Market needs to be deployed first)
        console.log("");
        console.log("--- Phase 1.2: Deploying SignalFriendMarket ---");
        market = new SignalFriendMarket(
            usdtAddress,
            signers,
            treasury,
            address(0), // PredictorAccessPass - will be set via MultiSig
            address(0) // SignalKeyNFT - will be set via MultiSig
        );
        console.log("SignalFriendMarket deployed at:", address(market));
        console.log("  - USDT:", usdtAddress);
        console.log("  - Treasury:", treasury);
        console.log("  - isFullyInitialized:", market.isFullyInitialized());

        // Step 3: Deploy PredictorAccessPass with Market address (immutable)
        console.log("");
        console.log("--- Phase 1.3: Deploying PredictorAccessPass ---");
        accessPass = new PredictorAccessPass(
            address(market),
            signers,
            PREDICTOR_METADATA_URI
        );
        console.log("PredictorAccessPass deployed at:", address(accessPass));
        console.log("  - signalFriendMarket:", accessPass.signalFriendMarket());

        // Step 4: Deploy SignalKeyNFT with Market address (immutable)
        console.log("");
        console.log("--- Phase 1.4: Deploying SignalKeyNFT ---");
        signalKey = new SignalKeyNFT(
            address(market),
            signers,
            SIGNAL_KEY_METADATA_URI
        );
        console.log("SignalKeyNFT deployed at:", address(signalKey));
        console.log("  - signalFriendMarket:", signalKey.signalFriendMarket());

        vm.stopBroadcast();

        // ============================================
        // POST-DEPLOYMENT SUMMARY
        // ============================================

        console.log("");
        console.log("========================================");
        console.log("   Phase 1 Deployment Complete!");
        console.log("========================================");
        console.log("");
        console.log("--- Deployed Addresses ---");
        if (DEPLOY_MOCK_USDT) {
            console.log("MockUSDT:            ", address(mockUsdt));
        }
        console.log("SignalFriendMarket:  ", address(market));
        console.log("PredictorAccessPass: ", address(accessPass));
        console.log("SignalKeyNFT:        ", address(signalKey));
        console.log("");

        // ============================================
        // PHASE 2 INSTRUCTIONS (Manual MultiSig Step)
        // ============================================

        console.log("========================================");
        console.log("   PHASE 2: MultiSig Setup Required");
        console.log("========================================");
        console.log("");
        console.log(
            "The Market contract needs NFT addresses set via 3-of-3 MultiSig."
        );
        console.log("Run the following after this deployment completes:");
        console.log("");
        console.log("Option A: Use the SetupMultiSig script:");
        console.log(
            "  forge script script/SetupMultiSig.s.sol:SetupMultiSigScript --rpc-url $BNB_TESTNET_RPC --broadcast"
        );
        console.log("");
        console.log("Option B: Manual steps (each signer must execute):");
        console.log("");
        console.log("1. Signer 1 proposes and auto-approves:");
        console.log(
            "   market.proposeUpdatePredictorAccessPass(",
            address(accessPass),
            ")"
        );
        console.log("2. Signer 2 approves the action");
        console.log("3. Signer 3 approves (auto-executes)");
        console.log("");
        console.log("4. Signer 1 proposes and auto-approves:");
        console.log(
            "   market.proposeUpdateSignalKeyNFT(",
            address(signalKey),
            ")"
        );
        console.log("5. Signer 2 approves the action");
        console.log("6. Signer 3 approves (auto-executes)");
        console.log("");
        console.log(
            "After Phase 2, verify: market.isFullyInitialized() == true"
        );
        console.log("");
        console.log("========================================");

        // ============================================
        // SAVE DEPLOYMENT ADDRESSES TO FILE
        // ============================================

        _writeDeploymentFile(treasury, signers);
        console.log("Deployment addresses saved to: deployment-addresses.txt");
    }

    /**
     * @notice Writes deployment addresses to a file
     * @dev Separated to avoid stack too deep error
     */
    function _writeDeploymentFile(
        address treasury,
        address[3] memory signers
    ) internal {
        string memory line1 = string(
            abi.encodePacked(
                "# SignalFriend Deployment - Chain ID: ",
                vm.toString(block.chainid),
                "\n",
                "# Deployed at block: ",
                vm.toString(block.number),
                "\n\n"
            )
        );

        string memory line2 = DEPLOY_MOCK_USDT
            ? string(
                abi.encodePacked(
                    "MOCK_USDT=",
                    vm.toString(address(mockUsdt)),
                    "\n"
                )
            )
            : "";

        string memory line3 = string(
            abi.encodePacked(
                "SIGNAL_FRIEND_MARKET=",
                vm.toString(address(market)),
                "\n",
                "PREDICTOR_ACCESS_PASS=",
                vm.toString(address(accessPass)),
                "\n",
                "SIGNAL_KEY_NFT=",
                vm.toString(address(signalKey)),
                "\n"
            )
        );

        string memory line4 = string(
            abi.encodePacked(
                "PLATFORM_TREASURY=",
                vm.toString(treasury),
                "\n",
                "MULTISIG_SIGNER_1=",
                vm.toString(signers[0]),
                "\n",
                "MULTISIG_SIGNER_2=",
                vm.toString(signers[1]),
                "\n",
                "MULTISIG_SIGNER_3=",
                vm.toString(signers[2]),
                "\n"
            )
        );

        string memory deploymentInfo = string(
            abi.encodePacked(line1, line2, line3, line4)
        );
        vm.writeFile("deployment-addresses.txt", deploymentInfo);
    }
}
