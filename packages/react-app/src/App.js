import React from "react";
import { Contract } from "@ethersproject/contracts";
import {getDefaultProvider, Web3Provider} from "@ethersproject/providers";

import { Body, Button, Header, Image, Link } from "./components";
import logo from "./gsn-green-vector.svg";
import useWeb3Modal from "./hooks/useWeb3Modal";

import { addresses, abis } from "@opengsn/airdrop-contracts";
import {ClaimAirdrop} from "./components/ClaimAirdrop";

async function readOnChainData() {
  // Should replace with the end-user wallet, e.g. Metamask
  const defaultProvider = getDefaultProvider();
  // Create an instance of an ethers.js Contract
  // Read more about ethers.js on https://docs.ethers.io/v5/api/contract/contract/
  const ceaErc20 = new Contract(addresses.ceaErc20, abis.erc20, defaultProvider);
  // A pre-defined address that owns some CEAERC20 tokens
  const tokenBalance = await ceaErc20.balanceOf("0x3f8CB69d9c0ED01923F11c829BaE4D9a4CB6c82C");
  console.log({ tokenBalance: tokenBalance.toString() });
}

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

function App() {
  // const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();

  return (
    <div>
      <Header>
        {/*<WalletButton provider={provider} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />*/}
      </Header>
        <Body>
        <Image src={logo} alt="react-logo" />
          <ClaimAirdrop provider = {new Web3Provider(window.ethereum)}/>
        <Link href="https://opengsn.org" style={{ marginTop: "8px" }}>
          The OpenGSN site
        </Link>
        </Body>
    </div>
  );
}

export default App;
