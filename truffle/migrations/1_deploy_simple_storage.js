const SwapTokensWallet = artifacts.require("SwapTokensWallet");

module.exports = function (deployer) {
  deployer.deploy(SwapTokensWallet);
};
