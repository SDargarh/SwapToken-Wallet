import React, { Component } from "react";
import SwapTokenWalletContract from "./contracts/SwapTokenWallet.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { loaded: false, tokenAddr: "", tokenAmt: 0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.SwapTokenWallet = new this.web3.eth.Contract(
        SwapTokenWalletContract.abi,
        SwapTokenWalletContract.networks[this.networkId] &&
          SwapTokenWalletContract.networks[this.networkId].address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      // this.listenToPaymentEvent();
      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  listenToPaymentEvent = () => {
    this.ItemManager.events.SupplyChainStep().on("data", async function (evt) {
      console.log(evt);
      let itemObj = this.ItemManager.methods
        .items(evt.returnValues._itemIndex)
        .call();
      console.log(itemObj);
      alert("Item " + itemObj._identifier + " was paid, Deliver it now.");
    });
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async () => {
    const { tokenAddr, tokenAmt } = this.state;
    let result = await this.SwapTokenWalletContract.methods
      .ExchangeTokensForEther(tokenAddr, tokenAmt)
      .send({ from: this.contract[0] });

    console.log(result);
    alert(
      result.events.tokensExchangedForEthers.returnValues.tokenAmt +
        result.events.tokensExchangedForEthers.returnValues.tokenName +
        "Exchanged For " +
        result.events.tokensExchangedForEthers.returnValues.etherReceived +
        " Ethers "
    );
  };

  handleWithdrawSubmit = async () => {
    let resultETH =
      await this.SwapTokenWalletContract.methods.withdrawMyETH.send({
        from: this.contract[0],
      });

    console.log(resultETH);
    alert(
      resultETH.events.etherWithdrawn.returnValues.etherAmt / 10 ** 18 +
        "Ethers withdrawn"
    );
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Swap your Tokens</h1>
        <label for="tokenAddr">Token Address:</label>
        <input
          type="text"
          id="tokenAddr"
          value={this.state.tokenAddr}
          onchange={this.handleInputChange}
        />
        <label for="tokenAmt">Token Amount:</label>
        <input
          type="text"
          id="tokenAmt"
          value={this.state.tokenAmt}
          onchange={this.handleInputChange}
        />
        <p>
          <button type="button" onClick={this.handleSubmit}>
            {" "}
            Swap my tokens
          </button>
        </p>
        <p>
          <button type="button" onClick={this.handleWithdrawSubmit}>
            {" "}
            Withdraw My Ethers
          </button>
        </p>
      </div>
    );
  }
}

export default App;
