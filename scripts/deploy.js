// Importing required modules and libraries from the ethers.js library.
// const { Contract, ContractFactory } = require("ethers");

// const {
//   latest,
// } = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time");
const { ethers } = require("hardhat");
// const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
// const pairArtifact = require("../artifacts/contracts/uniswap-v2-core/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json");

// 主部署函数。
async function main() {
  console.log(
    "------------部署、铸造并授权--------------------------------------"
  );
  //从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  console.log(`使用账户部署合约: ${owner.address}`);

  //初始化uniswap工厂，并部署
  const uniswapFactory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswap = await uniswapFactory.deploy(owner.address);
  const uniswapAddress = await uniswap.getAddress();
  console.log(`Factory 部署在 ${uniswapAddress}`);

  //初始化tokenFactory, 并部署koko、ac币
  const tokenFactory = await ethers.getContractFactory("ERC20token", owner);
  const kokoToken = await tokenFactory.deploy("koko", "KO");
  const acToken = await tokenFactory.deploy("ac", "AC");
  const kokoTokenAddress = await kokoToken.getAddress();
  const acTokenAddress = await acToken.getAddress();
  console.log(`kokoToken 地址 ${kokoTokenAddress}`);
  console.log(`acToken 地址 ${acTokenAddress}`);

  //铸造koko币、ac币
  await kokoToken.mint(owner.address, 2000);
  await acToken.mint(owner.address, 3000);
  let kokoBalance = await kokoToken.balanceOf(owner);
  let acBalance = await acToken.balanceOf(owner);
  console.log(
    `铸造owner koko Balance: ${kokoBalance}, ac Balance: ${acBalance}`
  );

  //调用 uniswapfactory 的 createPair 函数来创造流动池
  const tx1 = await uniswap.createPair(kokoTokenAddress, acTokenAddress);
  await tx1.wait();
  // 获取pair地址
  const pairAddress = await uniswap.getPair(kokoTokenAddress, acTokenAddress);
  console.log(`pair 部署在 ${pairAddress}`);
  //从链上获取pair合约
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  // console.log("\n-----------授权-------------------------------");
  const routerFactory = await ethers.getContractFactory("Router", owner);
  const router = await routerFactory.deploy(pairAddress);
  const routerAddress = await router.getAddress();

  //将100个koko和200个ac代币授权给Router合约
  const approveTx1 = await kokoToken.approve(
    routerAddress,
    ethers.parseEther("1000")
  );
  await approveTx1.wait();
  const approvalTx2 = await acToken.approve(
    routerAddress,
    ethers.parseEther("1000")
  );
  await approvalTx2.wait();
  console.log("授权 1000 个kokoToken和 1000 个acToken给router");

  console.log("\n---------首次添加流动性--------------------------");
  console.log(`前`);
  //查询 LP 流动币数量和 pair 交易对的储备量
  let lpTokenBalance = await pair.balanceOf(owner.address);
  let reserves = await pair.getReserves();
  console.log(`owner LP 代币数量: ${lpTokenBalance.toString()};`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );

  //设置添加流动性的代币数量，分别添加 50 个koko币和 100   个ac币
  const token0Amount = ethers.parseEther("100");
  const token1Amount = ethers.parseEther("50");
  console.log(`首次添加ing......  添加 100 个kokoToken 和 50 个acToken， `);
  console.log(`后`);
  //开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  const addLiquidityTx = await router
    .connect(owner)
    .addLiquidity(
      kokoTokenAddress,
      acTokenAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      owner,
      deadline
    );
  await addLiquidityTx.wait();

  //查询 LP 流动币数量和 pair 交易对的储备量
  lpTokenBalance = await pair.balanceOf(owner.address);
  reserves = await pair.getReserves();
  console.log(`owner LP 代币数量: ${lpTokenBalance.toString()}`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  let totalSupply = await pair.totalSupply();
  console.log("首次增加流动性后 totalSupply: ", totalSupply);

  console.log(
    "\n--------------------再次添加流动性-----------------------------------"
  );
  const token0Amount2 = ethers.parseEther("80");
  const token1Amount2 = ethers.parseEther("60");
  console.log(` 添加ing...... 添加 80 个kokoToken 和 60 个acToken, `);
  const deadline2 = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  const addLiquidityTx2 = await router
    .connect(owner)
    .addLiquidity(
      kokoTokenAddress,
      acTokenAddress,
      token0Amount2,
      token1Amount2,
      0,
      0,
      owner,
      deadline
    );
  await addLiquidityTx2.wait();
  console.log(`后`);
  //查询 LP 流动币数量和 pair 交易对的储备量
  lpTokenBalance = await pair.balanceOf(owner.address);
  reserves = await pair.getReserves();
  console.log(`owner LP 代币数量: ${lpTokenBalance.toString()};`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  totalSupply = await pair.totalSupply();
  console.log("再次增加流动性后 totalSupply: ", totalSupply);

  console.log(
    "\n--------------------swap交换-----------------------------------"
  );
  console.log(`前`);
  //owner swap 前拥有kokoToken和acToken的数量
  kokoBalance = await kokoToken.balanceOf(owner);
  acBalance = await acToken.balanceOf(owner);
  console.log(`owner koko Balance: ${kokoBalance}, ac Balance: ${acBalance}`);

  reserves = await pair.getReserves();
  console.log(
    `swap前 pair的储备量: ${reserves[1].toString()}, ${reserves[0].toString()}`
  );
  totalSupply = await pair.totalSupply();
  console.log("totalSupply: ", totalSupply);
  const amountIn = ethers.parseEther("50");
  const amountOutMin = ethers.parseEther("2");
  const path = [kokoTokenAddress, acTokenAddress]; //前者是input地址，后者地址是output地址
  console.log("swap ing......");
  // console.log("-----------------------------------------------------");
  let amounts = await router
    .connect(owner)
    .swapExactTokensForTokens(amountIn, amountOutMin, path, owner, deadline);
  // console.log("-----------------------------------------------------");
  console.log(`后`);
  //owner swap 后拥有kokoToken的数量
  kokoBalance = await kokoToken.balanceOf(owner);
  acBalance = await acToken.balanceOf(owner);
  console.log(
    `swap后, owner koko Balance: ${kokoBalance}, ac Balance: ${acBalance}`
  );

  reserves = await pair.getReserves();
  console.log(
    `swap后 pair的储备量: ${reserves[1].toString()}, ${reserves[0].toString()}`
  );
  totalSupply = await pair.totalSupply();
  console.log("swap后 totalSupply: ", totalSupply);
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
