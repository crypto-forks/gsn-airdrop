const fs = require('fs')
const csvtojson = require('csvtojson')
const BN = require('bn.js')

async function run () {
  const sendersAirdroppedAmount = 400e18
  const developersAirdroppedAmount = 3e22
  const relayOperatorsAirdroppedAmount = 3e22
  const personsCheckSum = 1525640e18.toLocaleString().replace(/,/g, '')

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
  let personsSum = new BN(0)
  jsonObjFromCsv.forEach(obj => {
    if (obj['field4'].includes('0x')) {
      const amount = obj['field2'].replace(/,/g, '').concat('0'.repeat(18))
      console.log(`${obj['field1']} (${obj['field4']}) receives amount ${amount}`)
      personsSum = personsSum.add(new BN(amount))
      personsJSON[obj['field4'].toLowerCase()] = (new BN(amount)).toString(16)
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

}

run()
