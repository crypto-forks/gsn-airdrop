const fs = require('fs')
const proofs = require( '../proofs/proofs.json')
const MerkleDistributor = artifacts.require("MerkleDistributor");
const TestERC20 = artifacts.require("TestERC20");
module.exports = async function(deployer) {
  await deployer.deploy(TestERC20, "Test Token", "TOK", 100e18.toString());

  const token = await TestERC20.deployed()
  await deployer.deploy(MerkleDistributor, token.address, proofs.merkleRoot);

  await token.setBalance(MerkleDistributor.address, 200e18.toString())

  const acc = (await web3.eth.getAccounts())[0]
  await web3.eth.sendTransaction({from:acc, to:'0xd21934eD8eAf27a67f0A70042Af50A1D6d195E81', value:1e18})
  fs.writeFileSync(__dirname+'/../proofs/addresses.json', JSON.stringify({
    distributor: MerkleDistributor.address,
    token: token.address
  },null,2))
};
