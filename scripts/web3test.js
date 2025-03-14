var { Web3 } = require("web3");

async function main() {
  var provider =
    "https://eth-mainnet.g.alchemy.com/v2/msA7jG5qOGW-EPhzv8urrBFP4m072YIz";
  var web3Provider = new Web3.providers.HttpProvider(provider);
  var web3 = new Web3(web3Provider);
  console.log("web3:", web3);
  const blocknum = await web3.eth.getBlockNumber();
  console.log("blocknum:", blocknum);
}
main().catch((error) => {
  console.error("Error executing script:", error);
  process.exitCode = 1;
});
