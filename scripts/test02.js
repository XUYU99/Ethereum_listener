const { ethers } = require("ethers");

// 替换为你的 Infura 项目 ID
const infuraProjectId = "YOUR_INFURA_PROJECT_ID";
const wsUrl = `wss://mainnet.infura.io/ws/v3/${infuraProjectId}`;

// 使用 WebSocketProvider 建立连接
const provider = new ethers.WebSocketProvider(wsUrl);

// 计数器，用于统计已处理的交易数量
let txCount = 0;

/**
 * 安全获取交易详情
 * 在获取前延时一定毫秒数，降低请求频率
 * @param {ethers.providers.WebSocketProvider} provider
 * @param {string} txHash
 * @param {number} delay 延时毫秒数（默认200ms）
 * @returns 交易详情
 */
async function safeGetTransaction(provider, txHash, delay = 200) {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return provider.getTransaction(txHash);
}

/**
 * 处理挂起交易的回调函数
 * @param {string} txHash
 */
async function handlePendingTransaction(txHash) {
  try {
    // 延时后获取交易详情
    const tx = await safeGetTransaction(provider, txHash);
    if (tx && txCount < 5) {
      txCount++;
      console.log("txCount:", txCount);
      console.log("检测到挂起交易:", tx.hash);
      console.log("-----------------tx----------------------", txCount);
      console.log(tx);
      console.log("-----------------tx analyze---------------------", txCount);
      console.log("交易 data:", tx.data);
      // 如果需要进一步分析可以调用其它函数，例如：analyzeTransaction(tx)

      // 当处理达到5个交易后停止监听
      if (txCount >= 5) {
        console.log("已处理5个交易，停止监听。");
        provider.off("pending", handlePendingTransaction);
      }
    }
  } catch (error) {
    console.error("获取交易详情时出错:", error);
  }
}

// 开始监听挂起交易，并使用 handlePendingTransaction 作为回调
provider.on("pending", handlePendingTransaction);

console.log("开始监听以太坊交易池的挂起交易...");
