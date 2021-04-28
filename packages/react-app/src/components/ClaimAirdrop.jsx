import {Button} from "./index";

import {initClaimer, initToken} from '@opengsn/distributor'

import React, {Component} from "react";

const toString = x => (x || 'null').toString()

export class ClaimAirdrop extends Component {

  provider
  state

  constructor(props) {
    super(props);
    const {provider} = props
    this.provider = provider
    this.state = {}
  }

  async componentDidMount() {
    const provider = this.provider
    if (!provider) {
      this.setState({error: "no provider"})
      return
    }
    try {

      this.account = (await provider.listAccounts())[0];

      this.setState({state: 'init'})
      this.claimer = await initClaimer(this.account, provider)
      this.token = initToken(provider, await this.claimer.getToken())

      await this.updateDisplay()
    } catch (e) {
      console.log(e)
      this.setState({error: e.message, state:'failed'})
    }
  }

  async updateDisplay() {
    const account = this.account
    if (!account)
      return
    const state = await this.claimer.getState()
    const amount = this.claimer.getAmount()
    const balance = await this.token.balanceOf(account).then(toString)
    const ethBalance = await this.provider.getBalance(account).then(toString)
    this.setState({
      account,
      amount,
      balance,
      ethBalance,
      state
    })
  }

  async claim() {
    try {
      this.setState({state: 'claiming'})
      await this.claimer.doClaim()
      this.justClaimed = true
    } finally {
      await this.updateDisplay()
    }
  }

  getStateName() {
    switch (this.state.state) {
      case 'init': return 'Initializing'
      case "ok": return `Claim your ${this.state.amount/1e18} tokens`
      case "claiming": return `Claiming your ${this.state.amount/1e18} tokens`
      case 'claimed': {
        if ( this.justClaimed )
          return "Claimed successfully"
        return 'Already claimed'
      }
      case 'no-claim': return 'No tokens for your account'
      default:
        return `errr: state ${this.state.state}`
    }
  }
  render() {
    return (
      <div>
        {this.state.error && <div style={{color: "red"}}>{this.state.error}</div>}
        <p>Claim your GSN Tokens</p>
        {
          // Your account: {this.state.account}<br/>
          // Eth balance: {this.state.ethBalance}<br/>
          // Token balance: {this.state.balance}<br/>
          // Claim Amount: {this.state.amount}<br/>
        }
        {/* Remove the "hidden" prop and open the JavaScript console in the browser to see what this function does */}
        <Button disabled={this.state.state !== 'ok'} onClick={() => this.claim()}>
          {this.getStateName()}
        </Button>

      </div>
    );
  }
}
