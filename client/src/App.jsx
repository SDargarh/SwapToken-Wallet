import React, { Component } from "react";
import SwapTokenWalletContract from "./contracts/SwapTokensWallet.json";
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

      console.log("contract instance created");

      this.setState({ loaded: true });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
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

    let result = await this.SwapTokenWallet.methods
      .ExchangeTokensForEther(tokenAddr, tokenAmt)
      .send({ from: this.accounts[0] });

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
    let resultETH = await this.SwapTokenWallet.methods.withdrawMyETH().send({
      from: this.accounts[0],
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
        <label htmlFor="tokenAddr">Token Address:</label>
        <input
          type="text"
          id="tokenAddr"
          name="tokenAddr"
          value={this.state.tokenAddr}
          onChange={this.handleInputChange}
        />
        <label htmlFor="tokenAmt">Token Amount:</label>
        <input
          type="text"
          id="tokenAmt"
          name="tokenAmt"
          value={this.state.tokenAmt}
          onChange={this.handleInputChange}
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
