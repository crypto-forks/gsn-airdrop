const fs = require('fs')
const MerkleDistributor = artifacts.require('MerkleDistributor')

const GSNToken = require( '../../../../gsn-governance-contracts/build/contracts/GSNToken.json');
const Timelock = require( '../../../../gsn-governance-contracts/build/contracts/Timelock.json');

const proofs = require( '../proofs/proofs.json');
const merkleRoot = proofs.merkleRoot

const TestERC20 = artifacts.require("TestERC20");

module.exports = async function (deployer) {

  const netId = await web3.eth.net.getId()

  let tokenAddress = process.env.GSNTOKEN

  //timelock is redeem address
  let expirationRedeemAddress = process.env.TIMELOCK

  let localTest=false
  if ( !tokenAddress ) {

    if ( netId < 1000 ) {
      throw new Error( 'no GSNTOKEN and network is not local:'+netId)
    }
    console.log( 'DEBUG: deploying test token')
    tok = await deployer.deploy(TestERC20, 'test', 'TST', web3.utils.toWei('100000', 'ether'))
    tokenAddress = tok.address
    //no redeem in local test
    expirationRedeemAddress = '0x'.padEnd(42,'0')
    localTest=true
  } else {
    //sanity: validate the address is a valid token.
    tok = await TestERC20.at(tokenAddress)
    console.log('Using token', await tok.symbol(), await tok.name())
  }

  // expiration one year (in 15-second block)
  const expirationBlock = await web3.eth.getBlockNumber() + 365*24*3600 / 15

  await deployer.deploy(MerkleDistributor, tokenAddress, merkleRoot, expirationBlock, expirationRedeemAddress)

  if ( localTest) {
    await tok.transfer(MerkleDistributor.address, web3.utils.toWei('100000', 'ether'))
    console.log( 'DEBUG: transfered tokens to MerkleDistributor:', 
        await tok.balanceOf(MerkleDistributor.address).then(web3.utils.fromWei))
  }
  if ( process.env.AIRDROP_OUT ) {
	fs.writeFileSync(process.env.AIRDROP_OUT, 
		`export AIRDROP=${MerkleDistributor.address}\n`)
  }
  
  fs.writeFileSync(__dirname+`/../proofs/addresses.json`, JSON.stringify({
    netId,
    distributor: MerkleDistributor.address,
    token: tokenAddress
  },null,2))

}
