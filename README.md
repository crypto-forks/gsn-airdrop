# GSN airdrop

This repo contains the source for the initial GSN airdrop, including:

1) Allocation tables
2) Merkle distributor contract
3) React claims dapp

## Allocation

- Summary of allocation: [summary.csv](summary.csv)

  - Pseudonyms have been randomly generated for privacy
  - 4-year vesting for partners & community advisors under same terms as team
  - No limitations on voting

- Allocation by on-chain activity:

  - 400 GSN for each user in [addresses/senders](addresses/senders)
  - 30,000 GSN for each developer in [addresses/developers](addresses/developers)
  - 30,000 GSN for each relay operator in [addresses/relay-operators](addresses/relay-operators)

   A single address can receive up to 60,400 GSN, if it appears in all 3 lists.
 
   The [gsn-airdrop-makelists](https://github.com/opengsn/gsn-airdrop-makelists) repo has the activity collection code.
  
## Local development

1. edit `./packages/merkle-distributor/input.json`, and add your metamask address and
   desired amount.

2. `yarn deploy`

   deploy token and airdrop contract into local ganache

3. `yarn start`

   Start front end.

### Setup

Run the following command to install package dependencies::

	yarn

