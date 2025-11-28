// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SignalFriendMarket} from "../src/SignalFriendMarket.sol";
import {PredictorAccessPass} from "../src/PredictorAccessPass.sol";
import {SignalKeyNFT} from "../src/SignalKeyNFT.sol";

/**
 * @title SetupMultiSigScript
 * @notice Phase 2 setup: Connect NFT contracts to Market via MultiSig
 * @dev This script must be run 3 times, once by each signer, OR all 3 signers
 *      can coordinate to run their approvals within the 1-hour action expiry window.
 * 
 * Usage:
 *   # Signer 1 proposes both actions:
 *   SIGNER_ROLE=1 forge script script/SetupMultiSig.s.sol:SetupMultiSigScript --rpc-url $BNB_TESTNET_RPC --broadcast
 * 
 *   # Signer 2 approves both actions:
 *   SIGNER_ROLE=2 ACTION_ID_1=0x... ACTION_ID_2=0x... forge script script/SetupMultiSig.s.sol:SetupMultiSigScript --rpc-url $BNB_TESTNET_RPC --broadcast
 * 
 *   # Signer 3 approves (auto-executes):
 *   SIGNER_ROLE=3 ACTION_ID_1=0x... ACTION_ID_2=0x... forge script script/SetupMultiSig.s.sol:SetupMultiSigScript --rpc-url $BNB_TESTNET_RPC --broadcast
 */
contract SetupMultiSigScript is Script {
    function run() public {
        // ============================================
        // LOAD CONFIGURATION
        // ============================================
        
        // Deployed contract addresses (from Deploy.s.sol output)
        address marketAddress = vm.envAddress("SIGNAL_FRIEND_MARKET");
        address accessPassAddress = vm.envAddress("PREDICTOR_ACCESS_PASS");
        address signalKeyAddress = vm.envAddress("SIGNAL_KEY_NFT");
        
        // Which signer is running this script (1, 2, or 3)
        uint256 signerRole = vm.envUint("SIGNER_ROLE");
        require(signerRole >= 1 && signerRole <= 3, "SIGNER_ROLE must be 1, 2, or 3");
        
        // Get the appropriate private key
        string memory envKey = string(abi.encodePacked("MULTISIG_SIGNER_", vm.toString(signerRole), "_PRIVATE_KEY"));
        uint256 signerPrivateKey = vm.envUint(envKey);
        address signer = vm.addr(signerPrivateKey);
        
        SignalFriendMarket market = SignalFriendMarket(marketAddress);
        
        console.log("========================================");
        console.log("   SignalFriend MultiSig Setup");
        console.log("========================================");
        console.log("");
        console.log("Signer Role:", signerRole);
        console.log("Signer Address:", signer);
        console.log("Market Address:", marketAddress);
        console.log("AccessPass Address:", accessPassAddress);
        console.log("SignalKey Address:", signalKeyAddress);
        console.log("");
        console.log("Current Market State:");
        console.log("  - isFullyInitialized:", market.isFullyInitialized());
        console.log("  - predictorAccessPass:", market.predictorAccessPass());
        console.log("  - signalKeyNFT:", market.signalKeyNFT());
        console.log("");

        vm.startBroadcast(signerPrivateKey);

        if (signerRole == 1) {
            // ============================================
            // SIGNER 1: PROPOSE BOTH ACTIONS
            // ============================================
            
            console.log("--- Signer 1: Proposing Actions ---");
            
            // Propose setting PredictorAccessPass
            if (market.predictorAccessPass() == address(0)) {
                bytes32 actionId1 = market.proposeUpdatePredictorAccessPass(accessPassAddress);
                console.log("");
                console.log("Action 1 - Update PredictorAccessPass");
                console.log("  Action ID:", vm.toString(actionId1));
                console.log("  Target:", accessPassAddress);
            } else {
                console.log("PredictorAccessPass already set, skipping...");
            }
            
            // Propose setting SignalKeyNFT
            if (market.signalKeyNFT() == address(0)) {
                bytes32 actionId2 = market.proposeUpdateSignalKeyNFT(signalKeyAddress);
                console.log("");
                console.log("Action 2 - Update SignalKeyNFT");
                console.log("  Action ID:", vm.toString(actionId2));
                console.log("  Target:", signalKeyAddress);
            } else {
                console.log("SignalKeyNFT already set, skipping...");
            }
            
            console.log("");
            console.log("========================================");
            console.log("NEXT STEP: Signer 2 and 3 must approve");
            console.log("Pass the Action IDs above to the next signers");
            console.log("========================================");
            
        } else {
            // ============================================
            // SIGNER 2 or 3: APPROVE ACTIONS
            // ============================================
            
            console.log("--- Signer", signerRole, ": Approving Actions ---");
            
            // Get action IDs from environment (set by signer 1)
            bytes32 actionId1 = vm.envBytes32("ACTION_ID_1");
            bytes32 actionId2 = vm.envBytes32("ACTION_ID_2");
            
            // Approve action 1 (PredictorAccessPass)
            if (actionId1 != bytes32(0) && market.predictorAccessPass() == address(0)) {
                console.log("");
                console.log("Approving Action 1:", vm.toString(actionId1));
                market.approveAction(actionId1);
                console.log("  Approved! Current approvals:", market.getActionApprovals(actionId1));
                
                if (market.isActionExecuted(actionId1)) {
                    console.log("  ACTION EXECUTED! PredictorAccessPass is now set.");
                }
            }
            
            // Approve action 2 (SignalKeyNFT)
            if (actionId2 != bytes32(0) && market.signalKeyNFT() == address(0)) {
                console.log("");
                console.log("Approving Action 2:", vm.toString(actionId2));
                market.approveAction(actionId2);
                console.log("  Approved! Current approvals:", market.getActionApprovals(actionId2));
                
                if (market.isActionExecuted(actionId2)) {
                    console.log("  ACTION EXECUTED! SignalKeyNFT is now set.");
                }
            }
        }

        vm.stopBroadcast();

        // ============================================
        // FINAL STATUS
        // ============================================
        
        console.log("");
        console.log("========================================");
        console.log("   Current Status After Script");
        console.log("========================================");
        console.log("isFullyInitialized:", market.isFullyInitialized());
        console.log("predictorAccessPass:", market.predictorAccessPass());
        console.log("signalKeyNFT:", market.signalKeyNFT());
        
        if (market.isFullyInitialized()) {
            console.log("");
            console.log("SUCCESS! Market is fully initialized.");
            console.log("The platform is ready for use!");
        } else {
            console.log("");
            console.log("Market is NOT fully initialized yet.");
            console.log("More approvals are needed.");
        }
        console.log("========================================");
    }
}
