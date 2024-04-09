import { ethers } from "ethers";

/**
 * Simplified way to get the parameters required to executed a `permit` operation in a ERC20 compliant token
 * @param {Signer | SignerWithAddress | Wallet} signer The account that will sign the permit message
 * @param {ERC20 | ERC20Permit} erc20Permit The ERC20 token over the permit will be executed
 * @param {{value: string, spender: string, chainId: number, version?: string}} params Required additional params to be included in the signed message
 * @returns {Promise<{owner: string; spender: string; value: string; deadline: number; v: number; r: string; s: string;}} The params required to execute the `ERC20.permit(...)` method
 */
export async function getPermitParams(
  signer,
  erc20Permit,
  { value, spender, chainId }
) {
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
      {
        name: "owner",
        type: "address",
      },
      {
        name: "spender",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
      {
        name: "nonce",
        type: "uint256",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
  };

  const domain = {
    name: await erc20Permit.name(),
    version: version || "1",
    chainId,
    verifyingContract: erc20Permit.address,
  };

  const signature = await signer._signTypedData(domain, types, values);
  const { r, v, s } = ethers.utils.splitSignature(signature);

  return { owner, spender, value, deadline, v, r, s };
}
