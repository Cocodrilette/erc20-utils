import { ethers } from "ethers";

/**
 * Simplified way to get the parameters required to execute a `permit` operation in an ERC20 compliant token
 * @param signer The account that will sign the permit message
 * @param erc20Permit The ERC20 token over which the permit will be executed
 * @param params Required additional params to be included in the signed message
 * @returns The params required to execute the `ERC20.permit(...)` method
 */
export async function getPermitParams(
  signer: ethers.Wallet,
  erc20Permit: ethers.Contract,
  {
    value,
    spender,
    chainId,
    version = "1",
  }: { value: string; spender: string; chainId: number; version?: string }
): Promise<{
  owner: string;
  spender: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
}> {
  const owner = signer.address;

  const nonce = await erc20Permit.nonces(owner);
  const deadline = Date.now() + 1000 * (60 * 60); // 1h
  const values = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const domain = {
    name: await erc20Permit.name(),
    version,
    chainId,
    verifyingContract: erc20Permit.address,
  };

  const signTypeData = await signTypedData(signer);
  const signature = signTypeData(domain, types, values);
  const { r, v, s } = ethers.utils.splitSignature(signature);

  return { owner, spender, value, deadline, v, r, s };
}

async function signTypedData(signer: any) {
  if (signer["_signTypedData"]) {
    return signer._signTypedData;
  } else if (signer["signTypedData"]) {
    return signer.signTypedData;
  } else {
    throw new Error("Not an instance of ethers.Wallet");
  }
}
