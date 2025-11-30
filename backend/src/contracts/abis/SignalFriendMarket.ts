export const signalFriendMarketAbi = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_usdt",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_multiSigSigners",
        "type": "address[3]",
        "internalType": "address[3]"
      },
      {
        "name": "_platformTreasury",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_predictorAccessPass",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_signalKeyNFT",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ACTION_EXPIRY_TIME",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "BASIS_POINTS",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "actions",
    "inputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "actionType",
        "type": "uint8",
        "internalType": "enum SignalFriendMarket.ActionType"
      },
      {
        "name": "newAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "newValue",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proposalTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "approvalCount",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "executed",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approveAction",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "batchCleanActions",
    "inputs": [
      {
        "name": "_actionIdsToClear",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buySignalNFT",
    "inputs": [
      {
        "name": "_predictor",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_priceUSDT",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_maxCommissionRate",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_contentIdentifier",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "buyerAccessFee",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculateBuyerCost",
    "inputs": [
      {
        "name": "_signalPrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculatePlatformEarnings",
    "inputs": [
      {
        "name": "_signalPrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "calculatePredictorPayout",
    "inputs": [
      {
        "name": "_signalPrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "cleanAction",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "commissionRate",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getActionApprovals",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint8",
        "internalType": "uint8"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getActionDetails",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "actionType",
        "type": "uint8",
        "internalType": "enum SignalFriendMarket.ActionType"
      },
      {
        "name": "newAddress",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "newValue",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "proposalTime",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "approvalCount",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "executed",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getActionExpirationTime",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getAllActionIds",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32[]",
        "internalType": "bytes32[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlatformParameters",
    "inputs": [],
    "outputs": [
      {
        "name": "_minSignalPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_predictorJoinFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_referralPayout",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_buyerAccessFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "_commissionRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getSigners",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address[3]",
        "internalType": "address[3]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasSignerApproved",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "_signer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isActionExecuted",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isActionExpired",
    "inputs": [
      {
        "name": "_actionId",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isFullyInitialized",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "isValidPredictor",
    "inputs": [
      {
        "name": "_predictor",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "joinAsPredictor",
    "inputs": [
      {
        "name": "_referrer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "minSignalPrice",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "multiSigSigners",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "paused",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "platformTreasury",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "predictorAccessPass",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "predictorJoinFee",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "proposePauseContract",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUnpauseContract",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateBuyerAccessFee",
    "inputs": [
      {
        "name": "_newFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateCommissionRate",
    "inputs": [
      {
        "name": "_newRate",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateMinSignalPrice",
    "inputs": [
      {
        "name": "_newPrice",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdatePredictorAccessPass",
    "inputs": [
      {
        "name": "_newAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdatePredictorJoinFee",
    "inputs": [
      {
        "name": "_newFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateReferralPayout",
    "inputs": [
      {
        "name": "_newPayout",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateSignalKeyNFT",
    "inputs": [
      {
        "name": "_newAddress",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateTreasury",
    "inputs": [
      {
        "name": "_newTreasury",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "proposeUpdateUSDT",
    "inputs": [
      {
        "name": "_newUSDT",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "referralPayout",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "signalKeyNFT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalPredictorsJoined",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalReferralsPaid",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSignalsPurchased",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "usdtToken",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "ActionApproved",
    "inputs": [
      {
        "name": "actionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "approver",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "approvalCount",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ActionCleaned",
    "inputs": [
      {
        "name": "actionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "actionType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum SignalFriendMarket.ActionType"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ActionExecuted",
    "inputs": [
      {
        "name": "actionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "actionType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum SignalFriendMarket.ActionType"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ActionProposed",
    "inputs": [
      {
        "name": "actionId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "bytes32"
      },
      {
        "name": "actionType",
        "type": "uint8",
        "indexed": false,
        "internalType": "enum SignalFriendMarket.ActionType"
      },
      {
        "name": "proposer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "expiryTime",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "BuyerAccessFeeUpdated",
    "inputs": [
      {
        "name": "oldFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "CommissionRateUpdated",
    "inputs": [
      {
        "name": "oldRate",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newRate",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ContractPaused",
    "inputs": [
      {
        "name": "pauser",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ContractUnpaused",
    "inputs": [
      {
        "name": "unpauser",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MinSignalPriceUpdated",
    "inputs": [
      {
        "name": "oldPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PredictorAccessPassUpdated",
    "inputs": [
      {
        "name": "oldAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "newAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PredictorJoinFeeUpdated",
    "inputs": [
      {
        "name": "oldFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PredictorJoined",
    "inputs": [
      {
        "name": "predictor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "referrer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "nftTokenId",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "referralPaid",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "ReferralPayoutUpdated",
    "inputs": [
      {
        "name": "oldPayout",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "newPayout",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SignalKeyNFTUpdated",
    "inputs": [
      {
        "name": "oldAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "newAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "SignalPurchased",
    "inputs": [
      {
        "name": "buyer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "predictor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "receiptTokenId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "contentIdentifier",
        "type": "bytes32",
        "indexed": false,
        "internalType": "bytes32"
      },
      {
        "name": "signalPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "totalCost",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TreasuryUpdated",
    "inputs": [
      {
        "name": "oldAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "newAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "USDTAddressUpdated",
    "inputs": [
      {
        "name": "oldAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "newAddress",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ActionAlreadyExecuted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ActionDoesNotExist",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ActionExpired",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyApproved",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AlreadyHasPredictorNFT",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ContractCurrentlyPaused",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ContractNotInitialized",
    "inputs": []
  },
  {
    "type": "error",
    "name": "DuplicateSignerAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientAllowance",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidCommissionRate",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPredictor",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPredictorAccessPassAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSignalKeyNFTAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidSignerAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTreasuryAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidUSDTAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OnlyMultiSigSigner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "PredictorBlacklisted",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SignalPriceTooLow",
    "inputs": []
  },
  {
    "type": "error",
    "name": "USDTTransferFailed",
    "inputs": []
  }
] as const;