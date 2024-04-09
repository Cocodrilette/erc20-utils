/// <reference types="./index.d.ts" />

export async function getPermitParams(
  signer: ethers.Signer | ethers.SignerWithAddress | ethers.Wallet,
  erc20Permit: ethers.Contract,
  params: { value: string; spender: string; chainId: number; version?: string }
): Promise<{
  owner: string;
  spender: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
}>;
