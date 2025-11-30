import type { Address } from "viem";

type ChainId = 97 | 56; // BNB Testnet | BNB Mainnet

interface ContractAddresses {
  signalFriendMarket: Address;
  predictorAccessPass: Address;
  signalKeyNFT: Address;
  mockUSDT: Address;
}

export const contractAddresses: Record<ChainId, ContractAddresses> = {
  // BNB Testnet
  97: {
    signalFriendMarket: "0x5133397a4B9463c5270beBa05b22301e6dD184ca",
    predictorAccessPass: "0x10EB1A238Db78b763ec97e326b800D7A7AcA3fC4",
    signalKeyNFT: "0xfb26Df6101e1a52f9477f52F54b91b99fb016aed",
    mockUSDT: "0xF87d17a5ca95F3f992f82Baabf4eBC5301A178a5",
  },
  // BNB Mainnet - TO BE ADDED
  56: {
    signalFriendMarket: "0x0000000000000000000000000000000000000000",
    predictorAccessPass: "0x0000000000000000000000000000000000000000",
    signalKeyNFT: "0x0000000000000000000000000000000000000000",
    mockUSDT: "0x0000000000000000000000000000000000000000",
  },
};

export function getAddresses(chainId: number): ContractAddresses {
  const addresses = contractAddresses[chainId as ChainId];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return addresses;
}
