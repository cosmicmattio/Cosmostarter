# ether

Staking Deposit contract

## Installation

    npm install
    npm run compile

## Testing

    npm run test

## Usage

Config.js keys are configured to work with fork.

1. Run fork in terminal and keep it running (fake testnet fork on our node).

    npm run fork

2. Follow other steps in other terminal. First compile helper token contracts (USDT/StakeToken).

    npm run compile 

3. Deploy fake USDT

    npm run hardhat -- --network target deployusdt
    
   You will need to note USDTToken address: 0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E (example)
   And set it in:
   contract/SD.sol (as usdt_address)
   config.js (as USDTToken_ADDRESS)

4. Deploy fake Cosmostarter

   npm run hardhat -- --network target deployusdt

   You will need to note Cosmostarter address: 0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690 (example)
   And set it in:
   contract/SD.sol (as staking_token_address)
   config.js (as Cosmostarter_ADDRESS)

6. Set desired staking_end_timestamp, deposit_start_timestamp, and deposit_end_timestamp in contract/SD.sol and compile it:

   npm run compile

7. Deploy the SD contract:

   npm run hardhat -- --network target deploy
   You will need to note SD address: 0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB (example)
   And set it in:
     config.js (as SD_ADDRESS)

7. Distribute ETH/USDT/Cosmostarter among buyers

   npm run hardhat -- --network target distribute

8. Approve USDT/Cosmostarter on SD contract for all buyers:

   npm run hardhat -- --network target approve

9. Check accounts balances:

    npm run hardhat -- --network target balances

10. Stake tokens:

    npm run hardhat -- --network target stake

10. Unstake tokens:

    npm run hardhat -- --network target unstake

10. Deposit:

    npm run hardhat -- --network target unstake

11. Contract status:

    npm run hardhat -- --network target status

12. Owner withdrawal:

    npm run hardhat -- --network target withdraw

