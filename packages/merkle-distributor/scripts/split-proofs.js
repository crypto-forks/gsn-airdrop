fs = require('fs')
path = require('path')
const input = process.argv[2]
const outfolder = path.resolve(process.argv[3])

if (!outfolder) {
  console.log(`usage: split-proofs {proofs.js} {outfolder}
  generate many proof-XX.js in the out folder, each only for addresses starting with XX`)
  process.exit(1)
}

const allProofs = JSON.parse(fs.readFileSync(input, 'ascii'))

outputs = {}
const { claims, ...otherFields } = allProofs

const claimsLength = Object.keys(claims).length

console.log(`reading ${claimsLength} claim proofs`)
for (const addr in claims) {
  const prefix = addr.slice(2, 4).toLowerCase()

  if (!outputs[prefix]) {
    outputs[prefix] = {}
  }
  outputs[prefix][addr] = claims[addr]
}
console.log(`writing 256 output files to ${outfolder}`)
//generate all 256 files, even with empty claims
for (let i=0; i<=255; i++ ) {
  const prefix = i.toString(16).padStart(2,'0')
  const subProof = { ...otherFields, claims: outputs[prefix] || {} }
  let filename = `${outfolder}/proof-${prefix}.json`
  fs.writeFileSync(filename, JSON.stringify(subProof))
}
console.log()
console.log('done writing 256 files')
