import { ethers } from "ethers";
import { ERC20 } from "../blockchain/typechain-types";

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
  params: {
    value: string;
    spender: string;
    destination: string;
    chainId?: number;
    deadline?: number;
  }
): Promise<{
  owner: string;
  spender: string;
  destination: string;
  value: string;
  deadline: number;
  v: number;
  r: string;
  s: string;
}> {
  const owner = signer.address;

  const nonce = await erc20Permit.nonces(owner);
  const deadline = params.deadline || Date.now() + 3600; // 1h
  const { spender, value, chainId, destination } = params;

  const domain = {
    name: await getTokenName(erc20Permit),
    version: "1",
    chainId: await getChainId(erc20Permit, chainId),
    verifyingContract: await getTokenAddress(erc20Permit),
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

  const values = {
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const signature = await signer.signTypedData(domain, types, values);
  const recovered = ethers.verifyTypedData(domain, types, values, signature);

  if (recovered !== signer.address)
    throw new Error("The signature is invalid. The permit will fail.");

  const { r, v, s } = ethers.Signature.from(signature);

  return {
    owner,
    spender,
    destination,
    value,
    deadline,
    v,
    r,
    s,
  };
}

async function getTokenName(token: ERC20 | ethers.Contract) {
  return token.name();
}

async function getTokenAddress(token: ERC20 | ethers.Contract) {
  return token.getAddress();
}

async function getChainId(token: ethers.Contract, chainId: number | undefined) {
  if (chainId) return chainId;

  const network = await token.runner?.provider?.getNetwork();
  if (network) return parseInt(network.chainId.toString());

  throw new Error(
    "chainId was not provided and cannot be fetch from the token network"
  );
}
