const MerkleDistributor = artifacts.require('MerkleDistributor')

module.exports = async function (deployer) {
  const token = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
  const expirationBlock = 1e10
  const expirationRedeemAddress = '0x0000000000000000000000000000000000000000'
  const merkleRoot = '0x'
  await deployer.deploy(MerkleDistributor, token, merkleRoot, expirationBlock, expirationRedeemAddress)
}
