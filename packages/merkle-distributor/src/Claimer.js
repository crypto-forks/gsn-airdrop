import {Contract} from "ethers";

const MerkleDistributor = require("../build/contracts/MerkleDistributor.json")
const ERC20 = require("../build/contracts/TestERC20.json")
const proofs = require("../proofs/proofs")

async function initContract(provider, truffleInstance) {
  const net = await provider.getNetwork()
  const networkId = await provider.send('net_version')
  const contractNetInfo = truffleInstance.networks[networkId]
  if (contractNetInfo == null) {
    throw new Error(`no instance of ${truffleInstance.contractName} for network ${chainId}. only for: ${Object.keys(truffleInstance.networks)}`)
  }
  return new Contract(contractNetInfo.address, truffleInstance.abi, provider)
}

/**
 * Client wrapper for making a claim
 */
export class Claimer {


  constructor(addr, provider, contract) {
    this.address = addr
    this.theContract = contract
    this.claim = proofs.claims[addr]
  }

  async getState() {
    if ( !this.hasProof() ) return "no-claim"
    if ( await this.alreadyClaimed() )
      return "claimed"
    return "ok"
  }

  hasProof() {
    return this.claim!=null
  }

  getAmount() {
    return this.claim ? parseInt(this.claim.amount) : null
  }

  async alreadyClaimed() {
    if ( !this.hasProof())
      return false
    return await this.theContract.isClaimed(this.claim.index)
  }

  async doClaim() {
    const { index, amount, proof } = this.claim
    const res = await this.theContract.connect(this.theContract.provider.getSigner()).claim(index, this.address, amount, proof)
    await new Promise(resolve=>setTimeout(resolve,1000))
    console.log(res)
    const res1 = await res.wait()
    await new Promise(resolve=>setTimeout(resolve,1000))
    console.log(res1)
  }
}

export async function initClaimer(addr, provider) {
  return new Claimer(addr, provider, await initContract(provider, MerkleDistributor))
}

export async function initToken(provider) {
  return await initContract(provider, ERC20)
}