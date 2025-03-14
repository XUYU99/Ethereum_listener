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

        // console.log("交易详情:", tx);
        // 分析交易是否调用了 transfer 函数
        // const isRight = await analyze_fun(tx);
        const isRight = await analyze_con(tx);
        if (isRight) {
          console.log("查找成功～～～～～");
        }
        // 当处理达到5个交易后，停止监听
        if (txcount >= 400) {
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
  const transferABI = ["function transfer(address to, uint256 amount)"];
  const swapABI = [
    "function swap(string aggregatorId,address tokenFrom,uint256 amount,bytes data)",
  ];

  // 当前示例仅使用 transferABI 进行解析
  const iface = new ethers.Interface(transferABI);
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

async function analyze_con(tx) {
  const add = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  if (tx.to == add) {
    console.log("tx:", tx);
    console.log("tx 是 uniswap 合约～～～");
    return true;
  } else {
    return false;
  }
}

main().catch((error) => {
  console.error("Error executing script:", error);
  process.exitCode = 1;
});
