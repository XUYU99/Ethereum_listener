# Ethereum_listener

本项目旨在通过实时监控以太坊网络上的交易数据，自动解析和识别交易调用内容，评估交易的安全性及前置交易（抢跑）风险，特别针对利用闪电贷等高级策略进行套利或攻击的交易进行预警。主要功能包括： 实时交易监控：使用 WebSocket 等方式捕获以太坊交易池中的挂起交易； 数据解析与识别：基于合约 ABI 解码交易数据，自动识别调用的具体函数（如 swap、transfer 等）及其参数； 风险评估：通过检测关键参数（例如输入资金为 0、异常路径、闪电贷相关调用等）判断交易是否存在抢跑风险或安全隐患； 预警与报告：对潜在风险交易进行分类，并实时输出预警信息，辅助安全审计和防御策略制定。

# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
yarn hardhat run scripts/test01.js
```
