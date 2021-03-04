import React, {Component} from "react";
import {Web3Provider} from "@ethersproject/providers";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./gsn-green-vector.svg";
// import useWeb3Modal from "./hooks/useWeb3Modal";

import {ClaimAirdrop} from "./components/ClaimAirdrop";

async function isMetamaskConnected() {
  const accounts = await new Web3Provider(window.ethereum).listAccounts().catch(e=>e.message)
  return accounts && accounts.length
}

class ConnectButton extends Component {
  constructor(props) {
    super(props);
    this.state={}
  }

  async metamaskConnect() {
    if (!this.state.connected) {
      await window.ethereum.request({method: 'eth_requestAccounts'})
    }
  }

  async componentDidMount() {
    this.setState({connected: await isMetamaskConnected()})
  }

  render() {
    if ( this.state.connected) {
      return <></>
    }
    return <Button enabled="false" onClick={()=>this.metamaskConnect()}>
      { this.state.connected ? "Disconnect":"Connect Metamask" }
    </Button>
  }
}

/*
function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}
*/

function App() {
  // const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  const rpcProvider = window.ethereum
  const provider = new Web3Provider(rpcProvider)
  if ( rpcProvider.isMetaMask ) {
    rpcProvider.on('chainChanged', (chainId)=>{
      console.log('chainChanged:', chainId)
      // if (chianId != net.chainId) {
      window.location.reload()
      // }
    })
    rpcProvider.on('accountsChanged', (accs) => {
      console.log('accountChanged', accs);
      window.location.reload()
    })
  }
  return (
    <div>
      <Header>
        <ConnectButton/>
        {/*<WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />*/}
      </Header>
        <Body>
        <Image src={logo} alt="react-logo" />
          <ClaimAirdrop provider = {provider} title={(provider||"asd").toString()}/>
        <Link href="https://opengsn.org" style={{ marginTop: "8px" }}>
          The OpenGSN site
        </Link>
        </Body>
    </div>
  );
}

export default App;
