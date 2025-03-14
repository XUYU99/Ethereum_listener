const { ethers } = require("ethers");

async function main() {
  const wsUrl = `wss://sepolia.infura.io/ws/v3/b6826ba6d4fb46faa9e127277ed1ef25`;
  const provider = new ethers.WebSocketProvider(wsUrl);

  console.log("开始监听以太坊交易池的pending交易...");
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待连接建立

  // 添加连接状态监听
  provider._websocket.on("error", (error) => {
    console.error("WebSocket错误:", error);
    process.exit(1);
  });

  provider._websocket.on("close", (code, reason) => {
    console.log("WebSocket连接关闭:", code, reason.toString());
    process.exit(code !== 1000 ? 1 : 0);
  });

  pendingTx(provider);
}

function pendingTx(provider) {
  let txCount = 0;
  const maxTx = 100; // 最大处理交易数
  const throttle = 100; // 处理间隔(ms)

  // 使用节流函数控制处理频率
  const processTx = throttleAsync(async (txHash) => {
    try {
      const tx = await provider.getTransaction(txHash);
      if (!tx) return;

      txCount++;
      console.log(`\n--- 交易 ${txCount}/${maxTx} ---`);
      console.log("交易哈希:", tx.hash);

      // 快速预筛选transfer交易
      if (tx.data.startsWith("0xa9059cbb")) {
        console.log("⚠️ 检测到疑似transfer交易");
        const analysis = analyzefunSelector(tx.data);
        if (analysis) {
          console.log("接收地址:", analysis.to);
          console.log(
            "转账金额:",
            ethers.formatUnits(analysis.amount, 18),
            "ETH"
          );
        }
      }

      if (txCount >= maxTx) {
        console.log("🚨 已达到最大处理交易数，停止监听");
        provider.off("pending", processTx);
        provider.destroy(); // 关闭连接
      }
    } catch (error) {
      console.error("处理交易时出错:", error.message);
    }
  }, throttle);

  provider.on("pending", processTx);
}

// 节流函数包装器
function throttleAsync(fn, delay) {
  let lastExec = 0;
  return async (...args) => {
    const now = Date.now();
    if (now - lastExec < delay) return;
    lastExec = now;
    return fn(...args);
  };
}

// 优化后的分析函数
function analyzefunSelector(txData) {
  try {
    const iface = new ethers.Interface([
      "function transfer(address to, uint256 amount)",
    ]);
    const { args, name } = iface.parseTransaction({ data: txData });
    return { name, to: args[0], amount: args[1] };
  } catch {
    return null; // 非transfer交易直接返回null
  }
}

main().catch((error) => {
  console.error("程序异常:", error);
  process.exit(1);
});
