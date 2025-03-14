const { ethers } = require("ethers");
async function main() {
  // 替换为你的 Infura 项目 ID
  const wsUrl = `wss://sepolia.infura.io/ws/v3/b6826ba6d4fb46faa9e127277ed1ef25`;

  // 使用 WebSocketProvider 连接到以太坊主网
  const provider = new ethers.WebSocketProvider(wsUrl);

  console.log("开始监听以太坊交易池的挂起交易...");

  await new Promise((resolve) => setTimeout(resolve, 2000));
  return pendingTx(provider);
}

// 监听 pending 事件，参数为交易哈希
function pendingTx(provider1) {
  var txcount = 0;

  provider1.on("pending", async (txHash) => {
    try {
      // 根据交易哈希获取交易详情
      const tx = await provider1.getTransaction(txHash);
      if (tx && txcount < 5) {
        txcount++;
        console.log(`----------------------${txcount}----------------------`);
        // 可根据需要输出更多交易信息，如 from, to, value 等
        console.log(tx);
        console.log("-----tx analyze-----", txcount);
        // console.log("tx.data:", tx.data);
        // await analyzeTransaction(tx);
        analyzefunSelector(tx.data);
        // 当处理达到5个交易后停止监听
        if (txcount >= 5) {
          console.log("已处理5个交易，停止监听。");
          provider1.off("pending", handlePendingTransaction);
          //   return;
        }
      }
    } catch (error) {
      console.error("获取交易详情时出错:", error);
    }
  });
}
// 识别交易是否调用了的transfer函数
async function analyzefunSelector(txData) {
  const abi = ["function transfer(address to, uint256 amount)"];

  // 构造接口对象
  const iface = new ethers.Interface(abi);

  // 使用 parseTransaction 方法解析 data 字段
  const parsed = iface.parseTransaction({ data: txData });
  if (parsed != null) {
    console.log("txData是transfer函数～～～");
    console.log("函数名称:", parsed.name);
    console.log("参数列表:", parsed.args);
  } else {
    console.log("txData no transfer function!");
  }
}

main().catch((error) => {
  console.error("Error deploying contracts:", error);
  process.exitCode = 1;
});
