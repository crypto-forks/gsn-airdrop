import {Button} from "./index";

import {initClaimer, initToken} from '@opengsn/distributor'
import numeral from 'numeral'
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
      this.setState({error: "Metamask provider not detected"})
      return
    }
    try {

      if ( !provider ) {
        this.setState({error: 'Metamask not detected'})
        return
      }
      this.account = (await provider.listAccounts())[0];
      if ( !this.account ) {
        this.setState({ error: 'Metamask account not connected'})
        return
      }

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

  formatAmount(amount) {

    return numeral(amount/1e18).format('0,0')
  }
  getStateName() {
    switch (this.state.state) {
      case 'init': return 'Initializing'
      case "ok": return `Claim your ${this.formatAmount(this.state.amount)} tokens`
      case "claiming": return `Claiming your ${this.formatAmount(this.state.amount)} tokens`
      case 'claimed': {
        if ( this.justClaimed )
          return "Claimed successfully"
        return 'Already claimed'
      }
      case 'no-claim': return 'No tokens for your account'
      default:
        return `Unable to claim tokens`
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
