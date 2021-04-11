const fs = require('fs')
const MerkleDistributor = artifacts.require('MerkleDistributor')

const GSNToken = require( '../../../../gsn-governance-contracts/build/contracts/GSNToken.json');
const Timelock = require( '../../../../gsn-governance-contracts/build/contracts/Timelock.json');

const proofs = require( '../proofs/proofs.json');
const merkleRoot = proofs.merkleRoot

module.exports = async function (deployer) {

  const netId = await web3.eth.net.getId()

  const tokenAddress = GSNToken.networks[netId].address

  // expiration one year (in 15-second block)
  const expirationBlock = await web3.eth.getBlockNumber() + 365*24*3600 / 15

  //timelock is redeem address
  const expirationRedeemAddress = Timelock.networks[netId].address

  await deployer.deploy(MerkleDistributor, tokenAddress, merkleRoot, expirationBlock, expirationRedeemAddress)

  if ( process.env.AIRDROP_OUT ) {
	fs.writeFileSync(process.env.AIRDROP_OUT, 
		`export AIRDROP=${MerkleDistributor.address}\n`)
  }
  
  fs.writeFileSync(__dirname+`/../proofs/addresses-${netId}.json`, JSON.stringify({
    distributor: MerkleDistributor.address,
    token: tokenAddress
  },null,2))

}
