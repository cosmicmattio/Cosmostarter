## Notes:
##
## Step 1: 1st stage before the presale. CSMS staking tokens can be deposited (stake function), investors deposit their staking tokens.
## Step 2: Deposit stage. Deposit (ETH) and depositUSDT are used by investors to deposit funds for presale.
## Step 3: When deposit stage ends, no more staking and deposits are accepted.
## Step 4: Contract owner can withdraw contributed ETH and tokens. Tokens will be distributed participants with Disperse.app in v1.
##
## - Only users who staked CSMS are allowed to deposit in stage 2
## - All staked tokens and deposits are saved and publicly available 
## (function getStakeHolders(), deposits_usdt, deposits_eth, staked_tokens)
## - Contract owner can withdraw (ETH) or withdrawToken (any token including USDT, staking tokens) at any stage, 
## and this will not affect deposit/stake records. 
## 
## Update: Added tier system for contributing to token sales (IDOs). Each tier will have a max contribution cap depending on the amount of tokens staked in smartcontract.

pragma solidity ^0.7.6;

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }
    function sub(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }
    function div(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    function mod(uint256 a, uint256 b, string memory errorMessage) internal pure returns (uint256) {
        require(b != 0, errorMessage);
        return a % b;
    }
    
    function ceil(uint256 a, uint256 m) internal pure returns (uint256 r) {
        return (a + m - 1) / m * m;
    }
}

//SD Staking-Distribution
contract SD {
    using SafeMath for uint256;
    address payable public owner;
    address public staking_token_address = 0xD8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43;
    address public sale_token_address = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public usdt_address = 0x2E2Ed0Cfd3AD2f1d34481277b3204d807Ca2F8c2;
    //uint256 public sale_token_amount = ;
    address[] public stakeholders;
    mapping(address => uint256) public deposits_usdt;
    mapping(address => uint256) public deposits_eth;
    mapping(address => uint256) public staked_tokens;
    mapping(address => uint256) public effective_staked_tokens;
    uint256 public staking_end_timestamp   = 1634717939 + 300;
    uint256 public deposit_start_timestamp = 1634717939 + 300 + 300;
    uint256 public deposit_end_timestamp   = 1634717939 + 300 + 300 + 300;

    uint256 public tier1_stake_tokens_min = 100;
    uint256 public tier1_deposit_max_usdt = 200;
    uint256 public tier1_deposit_max_eth = 300;

    uint256 public tier2_stake_tokens_min = 1000;
    uint256 public tier2_deposit_max_usdt = 2000;
    uint256 public tier2_deposit_max_eth = 3000;

    uint256 public tier3_stake_tokens_min = 10000;
    uint256 public tier3_deposit_max_usdt = 20000;
    uint256 public tier3_deposit_max_eth = 30000;

    uint256 public tier4_stake_tokens_min = 100000;
    uint256 public tier4_deposit_max_usdt = 200000;
    uint256 public tier4_deposit_max_eth = 300000;

    constructor() {
        owner = msg.sender;
    }

    function getStakeHolders() public view returns(address[] memory) {
        return stakeholders;
    }

    function depositETH() public payable returns (bool) {
        require(staked_tokens[msg.sender] > 0, 'only stakeholders are allowed to deposit');
        require(block.timestamp > deposit_start_timestamp, 'TOO early, wait for deposit_start_timestamp');
        require(block.timestamp < deposit_end_timestamp, 'TOO late, deposits closed at deposits_end_timestamp');
        deposits_eth[msg.sender] += msg.value;
        require(effective_staked_tokens[msg.sender]>=tier1_stake_tokens_min ,'ETH Deposits are not allowed');

	if(effective_staked_tokens[msg.sender] >= tier1_stake_tokens_min && effective_staked_tokens[msg.sender] < tier2_stake_tokens_min){
		require(deposits_eth[msg.sender] <= tier1_deposit_max_eth, 'Tier 1 deposit limit overflow');
	}
        if(effective_staked_tokens[msg.sender] >= tier2_stake_tokens_min && effective_staked_tokens[msg.sender] < tier3_stake_tokens_min){
                require(deposits_eth[msg.sender] <= tier2_deposit_max_eth, 'Tier 2 deposit limit overflow');
        }
        if(effective_staked_tokens[msg.sender] >= tier3_stake_tokens_min && effective_staked_tokens[msg.sender] < tier3_stake_tokens_min){
                require(deposits_eth[msg.sender] <= tier3_deposit_max_eth, 'Tier 3 deposit limit overflow');
        }
        if(effective_staked_tokens[msg.sender] >= tier4_stake_tokens_min ){
                require(deposits_eth[msg.sender] <= tier4_deposit_max_eth, 'Tier 4 deposit limit overflow');
        }

        return true;
    }

    function depositUSDT(uint256 amt) public returns (bool) {
        require(staked_tokens[msg.sender] > 0, 'only stakeholders are allowed to deposit');
        require(block.timestamp > staking_end_timestamp, 'TOO early, wait for staking_end_timestamp');
        require(block.timestamp < deposit_end_timestamp, 'TOO late, deposits closed at deposits_end_timestamp');
        IERC20 usdt_token_contract = IERC20(usdt_address);
        usdt_token_contract.transferFrom(msg.sender, address(this), amt);
        deposits_usdt[msg.sender] += amt;
        require(effective_staked_tokens[msg.sender]>=tier1_stake_tokens_min ,'USDT Deposits are not allowed');
        if(effective_staked_tokens[msg.sender] >= tier1_stake_tokens_min && effective_staked_tokens[msg.sender] < tier2_stake_tokens_min){
                require(deposits_eth[msg.sender] <= tier1_deposit_max_usdt, 'Tier 1 deposit limit overflow');
        }
        if(effective_staked_tokens[msg.sender] >= tier2_stake_tokens_min && effective_staked_tokens[msg.sender] < tier3_stake_tokens_min){
                require(deposits_eth[msg.sender] <= tier2_deposit_max_usdt, 'Tier 2 deposit limit overflow');
        }
        if(effective_staked_tokens[msg.sender] >= tier3_stake_tokens_min && effective_staked_tokens[msg.sender] < tier3_stake_tokens_min){
                require(deposits_eth[msg.sender] <= tier3_deposit_max_usdt, 'Tier 3 deposit limit overflow');
        }
        if(effective_staked_tokens[msg.sender] >= tier4_stake_tokens_min ){
                require(deposits_eth[msg.sender] <= tier4_deposit_max_usdt, 'Tier 4 deposit limit overflow');
        }

        return true;
    }

    function stake(uint256 amt) public returns (bool) {
        require(amt >0, 'zero amt not allowed');
        require(block.timestamp < staking_end_timestamp, 'TOO late, staking closed at staking_end_timestamp');
        IERC20 staking_token_contract = IERC20(staking_token_address);
        if(staked_tokens[msg.sender] == 0) {
                stakeholders.push(msg.sender);
        }
        staking_token_contract.transferFrom(msg.sender, address(this), amt);
        staked_tokens[msg.sender] += amt;
        effective_staked_tokens[msg.sender] += amt;
	require(tier1_stake_tokens_min <= effective_staked_tokens[msg.sender], 'You should stake at least tier1_stake_tokens_min');
        return true;
    }

    function unstake(uint256 amt) public returns (bool) {
        require(amt >0, 'zero amt not allowed');
        require(staked_tokens[msg.sender] >= amt, 'not enough staked tokens');
        //require(block.timestamp < staking_end_timestamp, 'TOO late, staking closed at staking_end_timestamp');
        if(block.timestamp < deposit_start_timestamp) {
            //affect both
            staked_tokens[msg.sender] -= amt;
            effective_staked_tokens[msg.sender] -= amt;
        } else {
            //keep effective
            staked_tokens[msg.sender] -= amt;
        }
        IERC20 staking_token_contract = IERC20(staking_token_address);
        staking_token_contract.transfer(msg.sender, amt);
        return true;
    }

    function withdrawETH() public returns (bool) {
        require(msg.sender == owner, 'ERROR!: ONLY OWNER ALLOWED');
        owner.transfer(address(this).balance);
        return true;
    }
    function withdrawToken(address token_contract_addr) public returns (bool){
        require(msg.sender == owner, 'ERROR!: ONLY OWNER ALLOWED');
        IERC20 token_contract = IERC20(token_contract_addr);
        uint256 my_token_balance = token_contract.balanceOf(address(this));
        token_contract.transfer(owner, my_token_balance);
        return true;
    }
}
