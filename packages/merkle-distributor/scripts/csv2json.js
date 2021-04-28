const fs = require('fs')
const csvtojson = require('csvtojson')
const BN = require('bn.js')
const { toWei } = require('web3-utils')

async function run () {
  const sendersAirdroppedAmount = `${(new BN(toWei('400', 'ether'))).toString(16)}`
  const developersAirdroppedAmount = `${(new BN(toWei('30000', 'ether'))).toString(16)}`
  const relayOperatorsAirdroppedAmount = `${(new BN(toWei('30000', 'ether'))).toString(16)}`
  const personsCheckSum = toWei('1525640', 'ether')

  const sendersFile = fs.readFileSync(__dirname + '/../airdrop/lists/senders', 'ascii')
  const developersFile = fs.readFileSync(__dirname + '/../airdrop/lists/developers', 'ascii')
  const relayOperatorsFile = fs.readFileSync(__dirname + '/../airdrop/lists/relay-operators', 'ascii')
  const jsonObjFromCsv = await csvtojson().fromFile(__dirname + '/../airdrop/airdrop-v6.csv')

  const sendersArray = sendersFile.trim().split('\n')
  const developersArray = developersFile.trim().split('\n')
  const relayOperatorsArray = relayOperatorsFile.trim().split('\n')

  const sendersJSON = {}
  const developersJSON = {}
  const relayOperatorsJSON = {}

  sendersArray.forEach(address => sendersJSON[address.toLowerCase()] = sendersAirdroppedAmount)
  developersArray.forEach(address => developersJSON[address.toLowerCase()] = developersAirdroppedAmount)
  relayOperatorsArray.forEach(address => relayOperatorsJSON[address.toLowerCase()] = relayOperatorsAirdroppedAmount)

  const personsJSON = {}
  const personsVestedAirdrop = []
  let personsSum = new BN(0)
  jsonObjFromCsv.forEach(obj => {
    const recipientName = obj['field1']
    const recipientAddress = obj['field4']
    if (recipientAddress.includes('0x')) {
      const amount = obj['field2'].replace(/,/g, '').concat('0'.repeat(18))
      const vestingAmount = obj['field3'].replace(/,/g, '').concat('0'.repeat(18))
      console.log(`${recipientName} (${recipientAddress}) receives amount ${amount}`)
      personsVestedAirdrop.push({
        recipientName,
        recipientAddress,
        vestingAmount
      })
      // NOTE: we now can have '0' as value for the airdrop - no need to create 0 entry proof
      if (amount === '0') {
        console.log(`zero amount - skipping!`)
        return
      }
      personsSum = personsSum.add(new BN(amount))
      personsJSON[recipientAddress.toLowerCase()] = `${(new BN(amount)).toString(16)}`
    }
  })
  if (personsSum.toString() !== personsCheckSum) {
    console.error(`Wrong NFP sum: expected: ${personsCheckSum} actual: ${personsSum.toString()}`)
    process.exit(-1)
  }
  console.log(personsSum.toString())
  // console.log(personsJSON)
  // Order is important here, since there might be duplicate entries in (senders, developers, relayOperators, persons). Order is from lowest amount to highest, s.t. a duplicate will receive
  // the higher value.
  const mergedJSON = {  ...sendersJSON, ...developersJSON, ...relayOperatorsJSON, ...personsJSON }

  fs.writeFileSync(__dirname + '/../build/input.json', JSON.stringify(mergedJSON, null, '\n').replace(/\n\n/g, '\n'))
  fs.writeFileSync(__dirname + '/../build/vested-airdrop.json', JSON.stringify(personsVestedAirdrop, null, '\n').replace(/\n\n/g, '\n'))

}

run()
