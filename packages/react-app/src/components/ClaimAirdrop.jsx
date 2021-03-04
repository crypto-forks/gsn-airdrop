import {Button} from "./index";

import {initClaimer, initToken} from '@opengsn/distributor'

import React,{Component} from "react";
import {Web3Provider} from "@ethersproject/providers";

const toString = x=>(x||'null').toString()

export class ClaimAirdrop extends Component {

    provider
    state
    constructor(props) {
        super(props);
        // const {provider} = props
        const provider = new Web3Provider(window.ethereum)
        this.provider = provider
        this.state={}
    }
    async componentDidMount() {

        const provider = this.provider
        this.account = (await provider.listAccounts())[0];
        console.log('netinfo=', await provider.getNetwork())

        this.token = await initToken(provider)
        this.claimer = await initClaimer(this.account, provider)

        await this.updateDisplay()
    }

    async updateDisplay() {
        const account = this.account
        const alreadyClaimed = await this.claimer.alreadyClaimed()
        const amount = alreadyClaimed ? "claimed" : this.claimer.getAmount()
        const balance = await this.token.balanceOf(account).then(toString)
        const ethBalance = await this.provider.getBalance(account).then(toString)
        console.log({account, balance, alreadyClaimed})
        this.setState({
            account,
            amount,
            balance,
            ethBalance,
            alreadyClaimed
        })
    }

    async claim() {
        this.claimer.doClaim()
        this.updateDisplay()
    }

    render() {
        return (
            <div>
                <p>Claim your GSN Tokens</p>
                <p>Your account: {this.state.account}</p>
                <p>Eth balance: {this.state.ethBalance}</p>
                <p>Token balance: {this.state.balance}</p>
                <p>Claim Amount: {this.state.amount}</p>
                {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
                <Button enabled="true" onClick={()=>this.claim()}>
                    Claim your Tokens
                </Button>

            </div>
        );
    }
}