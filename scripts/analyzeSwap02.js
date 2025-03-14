const { ethers } = require("ethers");

async function main() {
  // 使用 WebSocketProvider 建立连接
  const provider = new ethers.WebSocketProvider(
    "wss://eth-mainnet.g.alchemy.com/v2/msA7jG5qOGW-EPhzv8urrBFP4m072YIz"
  );

  console.log("开始监听以太坊交易池的pending交易...");

  // 等待2秒确保连接建立
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 开始监听 pending 事件
  pendingTx(provider);
}

// 监听 pending 事件，并处理交易
function pendingTx(provider) {
  let txcount = 0;

  // 定义 pending 事件的回调函数
  const pendingHandler = async (txHash) => {
    try {
      // 根据交易哈希获取交易详情
      const tx = await provider.getTransaction(txHash);
      if (tx) {
        txcount++;
        console.log(`----------------------${txcount}----------------------`);
        console.log("tx.hash:", tx.hash);

        // 分析交易是否调用了 swap 函数
        const isRight = await analyze_fun_swap(tx);
        if (isRight) {
          console.log("查找成功～～～～～");
        }
        // 当监听交易达到一定数量后，停止监听
        if (txcount >= 200) {
          console.log("已处理5个交易，停止监听。");
          provider.off("pending", pendingHandler);
          return;
        }
      }
    } catch (error) {
      console.error("获取交易详情时出错:", error);
    }
  };

  // 注册 pending 事件
  provider.on("pending", pendingHandler);
}
// 识别交易 data 是否调用了 transfer 函数
async function analyze_fun(tx) {
  // 定义两组 ABI，便于后续扩展
  const swapABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)",
  ];

  // 当前示例仅使用 transferABI 进行解析
  const iface = new ethers.Interface(swapABI);
  // 使用 parseTransaction 方法解析 tx
  const parsed = iface.parseTransaction({ data: tx.data });
  if (parsed != null) {
    console.log("tx调用了 transfer 函数～～～");
    console.log("函数名称:", parsed.name);
    console.log("参数列表:", parsed.args);
    return true;
  } else {
    console.log("tx 不属于 transfer 函数或解析出错!");
    return false;
  }
}

async function analyze_fun_swap(tx) {
  const routerABI = [
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)",
    "function swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline)",
    "function swapTokensForExactETH(uint amountOut, uint amountInMax, address[] path, address to, uint deadline)",
    "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)",
    "function swapETHForExactTokens(uint amountOut, address[] path, address to, uint deadline)",
    "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] path, address to, uint deadline)",
  ];

  // 构造 ethers.js Interface
  const iface = new ethers.Interface(routerABI);

  try {
    const parsed = iface.parseTransaction({ data: tx.data });

    if (parsed) {
      console.log("交易调用的函数:", parsed.name);
      console.log("交易参数:", parsed.args);

      // **判断是否是闪电贷**
      const amountIn = parsed.args[0] || parsed.args[1]; // 获取输入金额
      if (amountIn === 0) {
        console.log("⚠️ 该交易可能涉及闪电贷（Flash Loan）");
        return true;
      } else {
        console.log("✅ 该交易是常规的 Uniswap 交换操作");
        return false;
      }
    } else {
      // console.log("未能解析该交易的调用函数");
      return false;
    }
  } catch (error) {
    console.log("解析交易 data 失败:", error.message);
  }
}
main().catch((error) => {
  console.error("Error executing script:", error);
  process.exitCode = 1;
});
