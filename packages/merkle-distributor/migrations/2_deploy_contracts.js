const fs = require('fs')
const MerkleDistributor = artifacts.require('MerkleDistributor')

const IERC20 = require( '../build/contracts/IERC20.json')

const DeployedToken = require( '../../../../gsn-governance-contracts/build/contracts/GSNToken.json');
const RedeemTarget = require( '../../../../gsn-governance-contracts/build/contracts/Timelock.json');
let proofs = require( '../proofs/proofs.json');
const merkleRoot = proofs.merkleRoot

module.exports = async function (deployer) {

  //const token = await TestERC20.deployed()
  const netId = await web3.eth.net.getId()

  const tokenAddress = DeployedToken.networks[netId].address
  const token = new web3.eth.Contract(IERC20.abi, tokenAddress)
  // expiration one year (in 15-second block)
  const expirationBlock = await web3.eth.getBlockNumber() + 365*24*3600 / 15

  //timelock is redeem address
  const expirationRedeemAddress = RedeemTarget.networks[netId].address

  let fromAddr = (await web3.eth.getAccounts())[0];
  await deployer.deploy(MerkleDistributor, tokenAddress, merkleRoot, expirationBlock, expirationRedeemAddress)
  // await token.methods.transfer(MerkleDistributor.address, proofs.tokenTotal ).send({from:fromAddr})
  // console.log('balanceof depl', await token.methods.balanceOf(MerkleDistributor.address).call())
  // console.log('balanceof owner', await token.methods.balanceOf(fromAddr).call())
  console.log('AIRDROP_TAG', MerkleDistributor.address)
  
  fs.writeFileSync(__dirname+`/../proofs/addresses-${netId}.json`, JSON.stringify({
    distributor: MerkleDistributor.address,
    token: tokenAddress
  },null,2))

}
