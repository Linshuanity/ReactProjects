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
      msg: "",
      accnt: "",
      prize: 1,
      chances: 5
    };
    this.coinToss = this.coinToss.bind(this);
    this.collectPrize = this.collectPrize.bind(this);
    this.cryptoButton = this.cryptoButton.bind(this);
    this.virus_asset = 0;
  }

  coinToss() {
    const button = document.querySelector(".button-go");
    if (Math.random() < 0.5) {
      this.setState({ result: "heads" }, () => {
         const animated = document.querySelector("#coin.heads");
         animated.addEventListener('animationend', () => {
            this.setState({result: "", prize: 1 }, () => {
               button.disabled = true;
               button.innerText = this.state.chances-1 + " chances left.";
            });
         });
      });
    } else {
      this.setState({ result: "tails" }, () => {
         const animated = document.querySelector("#coin.tails");
         animated.addEventListener('animationend', () => {
            this.setState({ result: "", prize: this.state.prize * 2 }, function () {
               button.innerText = "Go for " + this.state.prize * 2;
            });
         });
      });
    }
  }

  collectPrize() {
    const button = document.querySelector(".button-go");
    this.virus_asset += this.state.prize;
    this.setState({ prize: 1, chances: this.state.chances-1 }, function() {
       if (this.state.chances > 0) {
          button.disabled = false;
       }
       else {
          document.querySelector(".button-stop").disabled = true;
          button.disabled = true;
       }
       button.innerText = this.state.chances + " chances left.";
    });
  }

  async cryptoButton () {
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
        <h1>Current prize: {this.state.prize}</h1>
        <h2>Virus Asset: {this.virus_asset}</h2>
        <button className="button-stop" onClick={this.collectPrize}>Collect virus</button>
        <button className="button-go" onClick={this.coinToss}>5 chances left</button>

        <h1>Crypto Authentication</h1>
        <button className="ConnectBtn" onClick={this.cryptoButton}>
          Connect Wallet
        </button>
        <p>{this.state.msg}</p>
        {this.state.msg === "User Login" && <div>Account: {this.state.accnt}</div>}
      </div>
    );
  }
}

export default App;

