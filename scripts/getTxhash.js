const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.WebSocketProvider(
    "wss://mainnet.infura.io/ws/v3/b6826ba6d4fb46faa9e127277ed1ef25"
  );
  //   const provider = new ethers.JsonRpcProvider(
  //     "https://mainnet.infura.io/v3/b6826ba6d4fb46faa9e127277ed1ef25"
  //   );
  console.log("连接成功，开始获取交易信息...");
  const txHash =
    "0x7f5e5986f8e29ed4ab127e9d6cff84d9b397b3fac939cf0d6b43911a1a734405";
  const tx = await provider.getTransaction(txHash);
  console.log("交易详情:", tx);
  //   await getTx(provider);
}

// 获取指定交易哈希的交易详情
async function getTx(provider) {
  const txHash =
    "0x7f5e5986f8e29ed4ab127e9d6cff84d9b397b3fac939cf0d6b43911a1a734405";
  try {
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      console.log("未找到该交易，交易哈希:", txHash);
      return;
    }
    console.log("交易详情:", tx);
    // console.log("发送方:", tx.from);
    // console.log("接收方:", tx.to);
    // console.log("交易data:", tx.data);
    // console.log("交易nonce:", tx.nonce);
  } catch (error) {
    console.error("获取交易详情时出错:", error);
  }
}

main().catch((error) => {
  console.error("执行脚本出错:", error);
  process.exitCode = 1;
});
