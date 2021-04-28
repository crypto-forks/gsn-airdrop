import {Contract} from "ethers";
import axios from 'axios'

const MerkleDistributor = require("../build/contracts/MerkleDistributor.json")
const ERC20 = require("../build/contracts/TestERC20.json")

function initContract(provider, truffleInstance, address) {
  return new Contract(address, truffleInstance.abi, provider)
}

/**
 * Client wrapper for making a claim
 */
export class Claimer {

  constructor(addr, provider, contract, claim) {
    this.address = addr
    this.theContract = contract
    this.claim = claim
  }

  async getState() {
    if ( !this.hasProof() ) return "no-claim"
    if ( await this.alreadyClaimed() )
      return "claimed"
    return "ok"
  }

  async getToken() {
    return await this.theContract.token()
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

export async function initClaimer(claimerAddress, provider, baseUrl) {
  const axiosInstance = axios.create({baseURL: baseUrl})
  console.log('base=', baseUrl)
  let claim
  try {
    const { data } = await axiosInstance.get(`proofs/proof-${claimerAddress.slice(2, 4).toLowerCase()}.json`)
    claim = data.claims[claimerAddress]
  } catch (e) {
    //don't hide missing files (=broken installation).
    // should report "request failed" (on missing file) or "cannot read property" (for broken configuration file)
    throw e
  }

  const {data: addresses} = await axiosInstance.get('proofs/addresses.json')

  const { distributor } = addresses
  if (!distributor) {
    console.error(`no instance of ${MerkleDistributor.contractName} for network ${networkId}. only for: ${Object.keys(MerkleDistributor.networks)}`)
    throw new Error(`Please connect to Ethereum mainnet`)
}

  return new Claimer(claimerAddress, provider,
    initContract(provider, MerkleDistributor, distributor),
    claim)
}

export function initToken(provider, address) {
  console.log('inittoken addr=', address)
  return initContract(provider, ERC20, address)
}
