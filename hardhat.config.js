require('@nomiclabs/hardhat-waffle');
const { expect } = require('chai');
const fs = require('fs').promises;
const { RPC_URL, PRIVATE_KEYS, GAS_PRICE_IN_GWEI, SD_ADDRESS, StakeToken_ADDRESS, USDTToken_ADDRESS } = require('./config');

const assert = (condition, message) => {
  if (condition) return;
  throw new Error(message);
}

const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
var connection = { url: RPC_URL };


function forever() {
 return new Promise(_ => {});
}

task('deploytoken', `Deploy StakeToken.sol`)
  .setAction(async () => {
    const [deployer] = await ethers.getSigners();

    console.log(
      `Deploying SD with the account: ${deployer.address}`
    );

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    expect((await deployer.getBalance()).gt(ethers.utils.parseEther('0.5'))).to.be.true;

    const StakeToken = await ethers.getContractFactory("StakeToken");
    const staketoken = await StakeToken.deploy();

    console.log('StakeToken address:', staketoken.address);

    console.log('Mining...');
    await staketoken.deployed();
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('Now update StakeToken_ADDRESS constant in the config');
  });

task('deployusdt', `Deploy USDTToken.sol`)
  .setAction(async () => {
    const [deployer] = await ethers.getSigners();

    console.log(
      `Deploying USDT with the account: ${deployer.address}`
    );

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    expect((await deployer.getBalance()).gt(ethers.utils.parseEther('0.5'))).to.be.true;

    const USDTToken = await ethers.getContractFactory("USDTToken");
    const usdttoken = await USDTToken.deploy();

    console.log('USDTToken address:', usdttoken.address);

    console.log('Mining...');
    await usdttoken.deployed();
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('Now update USDTToken_ADDRESS constant in the config');
  });



task('deploy', `Deploy SD.sol`)
  .setAction(async () => {
    const [deployer] = await ethers.getSigners();

    console.log(
      `Deploying SD with the account: ${deployer.address}`
    );

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);

    expect((await deployer.getBalance()).gt(ethers.utils.parseEther('0.5'))).to.be.true;

    const SD = await ethers.getContractFactory("SD");
    const sd = await SD.deploy();

    console.log('SD address:', sd.address);

    console.log('Mining...');
    await sd.deployed();
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('Now update SD_ADDRESS constant in the config');
  });

task('balances', 'addresses and balances')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');

    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let usdt_balance = 0
    let stake_balance = 0
    
    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)

    for(let i = 0; i < others.length; i++ ) {
	usdt_balance = await USDTContract.connect(deployer).balanceOf(others[i].address) 
	stake_balance = await StakeTokenContract.connect(deployer).balanceOf(others[i].address)
        console.log('Account ' + i + ' addr:' + others[i].address + ' balance ETH:' + ethers.utils.formatEther(await others[i].getBalance()) + ' balance USDT:' + usdt_balance + ' balance StakeToken:' + stake_balance )
    }
  });




task('approve', 'approve all tokens for SD')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);
    const MAX_INT =  new ethers.BigNumber.from('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');

    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let usdt_balance = 0
    let stake_balance = 0

    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)

    for(let i = 0; i < others.length; i++ ) {
        tx = await USDTContract.connect(others[i]).approve(SD_ADDRESS, MAX_INT, {gasPrice});
        console.log(tx.hash)
        await tx.wait();
        tx = await StakeTokenContract.connect(others[i]).approve(SD_ADDRESS, MAX_INT, {gasPrice});
        console.log(tx.hash)
        await tx.wait();

    }
  });



task('stake', 'first you stake')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');

    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let usdt_balance = 0
    let stake_balance = 0

    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)
    const SDContract = await ethers.getContractAt('SD', SD_ADDRESS)

    for(let i = 0; i < others.length; i++ ) {
        tx = await SDContract.connect(others[i]).stake(1000*(i+1), {gasPrice});
        console.log(tx.hash)
        await tx.wait();
    }
  });

task('unstake', 'then you unstake')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);

    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let usdt_balance = 0
    let stake_balance = 0

    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)
    const SDContract = await ethers.getContractAt('SD', SD_ADDRESS)

    for(let i = 0; i < others.length; i++ ) {
        tx = await SDContract.connect(others[i]).unstake(100*(i+1), {gasPrice});
        console.log(tx.hash)
        await tx.wait();
    }
  });


task('deposit', 'then you deposit')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');

    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let usdt_balance = 0
    let stake_balance = 0

    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)
    const SDContract = await ethers.getContractAt('SD', SD_ADDRESS)

    for(let i = 0; i < others.length; i++ ) {
        tx = await SDContract.connect(others[i]).depositETH({value:1234*(i+1)});
        console.log(tx.hash)
        await tx.wait();
        tx = await SDContract.connect(others[i]).depositUSDT(12340*(i+1));
        console.log(tx.hash)
        await tx.wait();
    }
  });


task('status', 'current status of SD')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);

    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');

    const SDContract = await ethers.getContractAt('SD', SD_ADDRESS)
    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)

    let stakeholders = await SDContract.connect(deployer).getStakeHolders();
    //console.log("Stakeholders:",stakeholders)
    let bal_stake
    let bal_usdt
    let bal_eth

 //   let provider = ethers.getDefaultProvider()

    console.log('staking_end_timestamp:' + await SDContract.connect(deployer).staking_end_timestamp())
    console.log('deposit_start_timestamp:' + await SDContract.connect(deployer).deposit_start_timestamp())
    console.log('deposit_end_timestamp:' + await SDContract.connect(deployer).deposit_end_timestamp())
    console.log('ETH on SD contract:addr:' + SD_ADDRESS + ' balance:'+ await ethers.provider.getBalance(SD_ADDRESS))
    console.log('USDT on SD contract:' + await USDTContract.connect(deployer).balanceOf(SD_ADDRESS))

    for(let i = 0; i < stakeholders.length; i++ ) {
        bal_stake = await SDContract.connect(deployer).staked_tokens(stakeholders[i]);    
 	bal_stake_effective = await SDContract.connect(deployer).effective_staked_tokens(stakeholders[i]);
        bal_eth   = await SDContract.connect(deployer).deposits_eth(stakeholders[i]);
        bal_usdt  = await SDContract.connect(deployer).deposits_usdt(stakeholders[i]);
	console.log('Stakeholder:' + stakeholders[i] + ' Staked Effective Tokens:' + bal_stake_effective + ' Holding Stake Tokens:' + bal_stake  + ' Deposited ETH:' + bal_eth + ' Deposited USDT:' + bal_usdt)
    }
  });


task('withdraw', 'owner withdrawal')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');

    const SDContract = await ethers.getContractAt('SD', SD_ADDRESS)
    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)

    let tx

    tx = await SDContract.connect(deployer).withdrawETH({gasPrice});
    console.log(tx.hash)
    await tx.wait();


    tx = await SDContract.connect(deployer).withdrawToken(USDTToken_ADDRESS,{gasPrice});
    console.log(tx.hash)
    await tx.wait();

  });


task('distribute', 'distribute ETH/USDT/Stake between the buyers')
  .setAction(async () => {
    const [deployer, ...others] = await ethers.getSigners();
    const gasPrice = ethers.utils.parseUnits(GAS_PRICE_IN_GWEI, 'gwei');
    console.log('Should have 10 buyer keys');
    expect(others.length).to.equal(10);
    console.log(`Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
    console.log('It must be above 99.5 ETH');
    let tx
    let bal
    let mis
    let cnt
    let data = ""
    let z = new ethers.BigNumber.from(0);
    let bal_usdt
    let mis_usdt
    let bal_stake
    let mis_stake

    const USDTContract = await ethers.getContractAt('USDTToken', USDTToken_ADDRESS)
    const StakeTokenContract = await ethers.getContractAt('StakeToken', StakeToken_ADDRESS)

    for(let i = 0; i < 10; i++ ) {
      bal = await others[i].getBalance();
      bal_usdt = await USDTContract.connect(deployer).balanceOf(others[i].address)
      bal_stake = await StakeTokenContract.connect(deployer).balanceOf(others[i].address)
      if(i == 0) {
        mis = ethers.utils.parseEther('21').sub(bal);
	mis_usdt = ethers.utils.parseEther('1000').sub(bal_usdt);
	mis_stake = ethers.utils.parseEther('1000').sub(bal_stake);
      } else {
        mis = ethers.utils.parseEther('1.05').sub(bal);
        mis_usdt = ethers.utils.parseEther('333').sub(bal_usdt);
	mis_stake = ethers.utils.parseEther('333').sub(bal_stake);
      }

      if(mis.lte(z)) {
        console.log('Account ' + i + ' has enough ETH balance:' + ethers.utils.formatEther(bal) + ' missing:' + ethers.utils.formatEther(mis) )
      } else {
        console.log('Account ' + i + ' has missing ETH balance:' + ethers.utils.formatEther(mis) + ' sending transaction...')
        tx = await deployer.sendTransaction({to: others[i].address, value: mis, gasPrice,nonce:0})
        console.log(tx.hash)
	await tx.wait();
      }
      cnt = await others[i].getTransactionCount()

      if(mis_usdt.lte(z)) {
        console.log('Account ' + i + ' has enough USDT balance:' + ethers.utils.formatEther(bal_usdt) + ' missing:' + ethers.utils.formatEther(mis_usdt) )
      } else {
        console.log('Account ' + i + ' has missing USDT balance:' + ethers.utils.formatEther(mis_usdt) + ' sending transaction...')
        tx = await USDTContract.connect(deployer).transfer(others[i].address, mis_usdt, {gasPrice});
        console.log(tx.hash)
        await tx.wait();
      }

      if(mis_stake.lte(z)) {
        console.log('Account ' + i + ' has enough StakeToken balance:' + ethers.utils.formatEther(bal_stake) + ' missing:' + ethers.utils.formatEther(mis_stake) )
      } else {
        console.log('Account ' + i + ' has missing StakeToken balance:' + ethers.utils.formatEther(mis_stake) + ' sending transaction...')
        tx = await StakeTokenContract.connect(deployer).transfer(others[i].address, mis_stake, {gasPrice});
        console.log(tx.hash)
        await tx.wait();
      }

      cnt = await others[i].getTransactionCount()
      console.log('count:',cnt)
    }
    console.log('Wait mining...');
    //await fs.writeFile('nonces.dat', data);
  });





module.exports = {
  networks: {
    target: {
      url: RPC_URL,
      accounts: PRIVATE_KEYS,
      gasMultiplier: 1.2,
    },
    hardhat: {
      mining: {
        auto: false,
        interval: [3000, 6000],
      },
    },
  },
  solidity: {
    version: '0.7.6',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
};
