import hre, { ethers as hhEthers, network } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { getPermitParams } from "../../utils/get-permit-params";
import { ethers } from "ethers";
import { expect } from "chai";

describe("ERC20Permit", function () {
  async function deployPermitFixture() {
    const [user0, user1] = await hhEthers.getSigners();

    const ERC20Permit = await hre.ethers.getContractFactory("ERC20Permit");
    const erc20Permit = await ERC20Permit.deploy();

    return { erc20Permit, user0, user1 };
  }

  describe("Permit", function () {
    it("Should make a permit", async function () {
      const { erc20Permit, user0, user1 } = await loadFixture(
        deployPermitFixture
      );

      const sentValue = ethers.parseEther("10").toString();
      const { owner, spender, value, deadline, r, v, s } =
        await getPermitParams(
          user0 as unknown as ethers.Wallet,
          erc20Permit as unknown as ethers.Contract,
          {
            value: sentValue,
            chainId: network.config.chainId as number,
            spender: user1.address,
          }
        );

      await erc20Permit.permit(owner, spender, value, deadline, v, r, s);
      const allowance = await erc20Permit.allowance(
        user0.address,
        user1.address
      );

      expect(allowance).to.equal(sentValue);
    });
  });
});
