import React from "react";
import { ethers } from "ethers";

const randomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      result: "",
      nader: "nader",
      msg: "",
      accnt: ""
    };
    this.coinToss = this.coinToss.bind(this);
    this.crypto = this.crypto.bind(this);
  }

  coinToss() {
    this.setState({ nader: "" }, () => {
      if (Math.random() < 0.5) {
        this.setState({ result: "heads" });
        console.log("heads");
      } else {
        this.setState({ result: "tails" });
        console.log("tails");
      }
    });
  }

  crypto() {
    const cryptoButton = async () => {
      const { ethereum } = window;
      if (ethereum.isMetaMask) {
        this.setState({ msg: "MetaMask Installed"});
        await ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await ethereum.request({ method: "eth_accounts" });

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const message = randomString(16);
        const signature = await signer.signMessage(message);

        const signAddress = await ethers.utils.verifyMessage(message, signature);
        if (signAddress.toLowerCase() === accounts[0].toLowerCase()) {
          this.setState({ msg: "User Login"});
          this.setState({ accnt: accounts[0]});
        } else {
          this.setState({ msg: "Login failed"});
        }
      } else {
        this.setState({ msg: "MetaMask is not installed"});
        }
    }
  }

  render() {
    return (
      <div className="App">
        <div id="coin" className={this.state.result} key={+new Date()}>
          <div className="side-a">
            <h2>TAIL</h2>
          </div>
          <div className="side-b">
            <h2>HEAD</h2>
          </div>
        </div>
        <h1>Flip a coin</h1>
        <button id="btn" onClick={this.coinToss}>
          Coin Toss
        </button>
        <h1>Crypto Authentication</h1>
        <button className="ConnectBtn" onClick={this.crypto.cryptoButton}>
          Connect Wallet
        </button>
        <p>{this.state.msg}</p>
        {this.state.msg === "User Login" && <div>Account: {this.state.accnt}</div>}
      </div>
    );
  }
}

export default App;

