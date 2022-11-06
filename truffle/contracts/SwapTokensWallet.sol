// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "../node_modules/@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./IERC20.sol";

contract SwapTokensWallet {
    IERC20 public token;
    IUniswapV2Router02 public uniswapRouter =
        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);

    uint256[] public amounts;
    uint256[] public outAmounts;
    uint256 public tokenAmt;
    event tokensExchangedForEthers(
        string tokenName,
        uint256 tokenAmt,
        uint256 etherReceived
    );
    event etherWithdrawn(uint256 etherAmt);

    receive() external payable {}

    fallback() external payable {}

    mapping(address => uint256) public UsersWallet;

    function ExchangeTokensForEther(address _tokenAddr, uint256 _tokenAmt)
        public
        payable
    {
        token = IERC20(_tokenAddr);
        require(
            token.transferFrom(msg.sender, address(this), _tokenAmt),
            "transfer of tokens failed"
        );
        require(
            token.approve(address(uniswapRouter), _tokenAmt),
            "approval/add allowance failed"
        );

        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = uniswapRouter.WETH();
        uint256 deadline = block.timestamp + 1000;
        //getMinAmt(_tokenAmt, path);

        outAmounts = uniswapRouter.swapExactTokensForETH(
            _tokenAmt,
            0,
            path,
            address(this),
            deadline
        );
        emit tokensExchangedForEthers(token.name(), _tokenAmt, outAmounts[1]);
        UsersWallet[msg.sender] += outAmounts[1];
    }

    // function getMinAmt(uint _tokenAmt, address[] memory path) public{
    //     amounts = uniswapRouter.getAmountsIn(_tokenAmt, path);
    // }

    function withdrawMyETH() public {
        uint256 WithdrawAmount = UsersWallet[msg.sender];
        UsersWallet[msg.sender] = 0;
        (payable(msg.sender)).transfer(WithdrawAmount);
        emit etherWithdrawn(WithdrawAmount);
    }
}
