const { ethers, getNamedAccounts } = require("hardhat")

const AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
  const { deployer } = await getNamedAccounts()
  const iWeth = await ethers.getContractAt(
    "IWeth",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    deployer
  )
  const txResponse = await iWeth.deposit({ value: AMOUNT })
  await txResponse.wait(1)
  const wethBalance = await iWeth.balanceOf(deployer)
  console.log(`Have ${wethBalance.toString()} balance.`)
}

module.exports = { getWeth, AMOUNT }
