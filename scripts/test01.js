const { ethers } = require("ethers");
async function main() {
  // 替换为你的 Infura 项目 ID
  const wsUrl = `wss://sepolia.infura.io/ws/v3/b6826ba6d4fb46faa9e127277ed1ef25`;

  // 使用 WebSocketProvider 连接到以太坊主网
  const provider = new ethers.WebSocketProvider(wsUrl);

  console.log("开始监听以太坊交易池的挂起交易...");
  var txcount = 0;
  // 监听 pending 事件，参数为交易哈希
  provider.on("pending", async (txHash) => {
    try {
      // 根据交易哈希获取交易详情
      const tx = await provider.getTransaction(txHash);
      if (tx && txcount < 5) {
        txcount++;
        console.log("txcount:", txcount);
        console.log("检测到挂起交易:", tx.hash);
        // 可根据需要输出更多交易信息，如 from, to, value 等
        console.log("-----------------tx----------------------", txcount);
        console.log(tx);
        console.log(
          "-----------------tx analyze---------------------",
          txcount
        );
        console.log(tx.data);
        // await analyzeTransaction(tx);
        // await analyzefunSelector(tx.data);
      }
    } catch (error) {
      console.error("获取交易详情时出错:", error);
    }
  });
}

async function analyzeTransaction(tx) {
  // 目标合约地址通常存放在 tx.to 字段中
  const targetContract = tx.to;
  console.log("目标合约地址:", targetContract);

  // 交易调用数据保存在 tx.data 中，函数选择器为前 10 个字符（"0x" + 8 个十六进制字符）
  const data = tx.data;
  if (!data || data.length < 10) {
    console.log("交易数据中没有足够的信息来解析函数调用");
    return;
  }
  const functionSelector = data.slice(0, 10);
  console.log("函数选择器:", functionSelector);

  // 调用 4byte.directory API 查询该函数选择器对应的可能函数签名
  const apiUrl = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${functionSelector}`;
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error("查询函数签名失败，状态码:", response.status);
      return;
    }
    const result = await response.json();
    if (result.count > 0 && result.results.length > 0) {
      console.log("可能的函数签名:");
      result.results.forEach((item) => {
        console.log(item.text_signature);
      });
    } else {
      console.log("未找到对应的函数签名信息");
    }
  } catch (error) {
    console.error("查询函数签名时出错:", error);
  }
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
