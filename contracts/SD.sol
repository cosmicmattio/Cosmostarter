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

//SD Staking-Distribution
contract SD {
    address payable public owner;
    address public staking_token_address = 0xc3e53F4d16Ae77Db1c982e75a937B9f60FE63690;
    address public sale_token_address = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address public usdt_address = 0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E;
    //uint256 public sale_token_amount = ;
    address[] public stakeholders;
    mapping(address => uint256) public deposits_usdt;
    mapping(address => uint256) public deposits_eth;
    mapping(address => uint256) public staked_tokens;
    mapping(address => uint256) public effective_staked_tokens;
    uint256 public staking_end_timestamp   = 1622208679 + 1800;
    uint256 public deposit_start_timestamp = 1622208679 + 1800 + 600;
    uint256 public deposit_end_timestamp   = 1622208679 + 1800 + 600 + 600;

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
        return true;
    }

    function depositUSDT(uint256 amt) public returns (bool) {
        require(staked_tokens[msg.sender] > 0, 'only stakeholders are allowed to deposit');
        require(block.timestamp > staking_end_timestamp, 'TOO early, wait for staking_end_timestamp');
        require(block.timestamp < deposit_end_timestamp, 'TOO late, deposits closed at deposits_end_timestamp');
        IERC20 usdt_token_contract = IERC20(usdt_address);
        usdt_token_contract.transferFrom(msg.sender, address(this), amt);
        deposits_usdt[msg.sender] += amt;
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


