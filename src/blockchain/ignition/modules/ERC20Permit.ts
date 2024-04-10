import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ERC20PermitModule = buildModule("ERC20PermitModule", (m) => {
  const erc20Permit = m.contract("ERC20Permit");

  return { erc20Permit };
});

export default ERC20PermitModule;
