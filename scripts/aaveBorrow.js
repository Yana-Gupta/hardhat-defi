const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("./getWeth.js")

async function main() {
  await getWeth()
  const { deployer } = await getNamedAccounts()
  const lendingPool = await getLendingPool(deployer)
  console.log(`Lending Pool Address ${lendingPool.address}.`)

  // deposit the token
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

  // approve
  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
  console.log("Depositing....")
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
  console.log("Deposited 👍")

  // Borrow
  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
    lendingPool,
    deployer
  )

  // how much DAI can be borrowed based on the value of ETH.
  const daiEthPrice = await getDaiPrice()
  const amountDaiToBorrow = availableBorrowsETH.toString() * (0.6 / daiEthPrice)

  console.log(`You can borrow ${amountDaiToBorrow} DAI.`)

  // Borrowing
  const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrow, deployer)
  await getBorrowUserData()

  // Repaying
  await repay(amountDaiToBorrow, daiTokenAddress, lendingPool, deployer)

  await getBorrowUserData
}

async function getLendingPool(account) {
  // Get lendingPoolAddressesProvider address from aave docs ✅
  const lendingPoolAddressesProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
    account
  )
  const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()
  const lendingPool = await ethers.getContractAt(
    "ILendingPool",
    lendingPoolAddress.toString(),
    account
  )
  return lendingPool
}

async function approveErc20(
  erc20Address,
  spenderAddress,
  amountToSpend,
  account
) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
  const tx = await erc20Token.approve(spenderAddress, amountToSpend)
  await tx.wait(1)
  console.log(`Approved 👍`)
}

async function getBorrowUserData(lendingPool, account) {
  const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
    await lendingPool.getUserAccountData(account)
  console.log(
    `Total Colateral ETH- ${totalCollateralETH}\nTotal Borrowed ETH- ${totalDebtETH}\nAvailable Borrow ETH- ${availableBorrowsETH}`
  )
  return { availableBorrowsETH, totalDebtETH }
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    "0x773616E4d11A78F511299002da57A0a94577F1f4"
  )
  const { answer } = await daiEthPriceFeed.latestRoundData()
  const decimals = await daiEthPriceFeed.decimals()
  console.log(`DAI / ETH price is: ${answer}`)

  return answer
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
  const borrowTx = await lendingPool.borrow(
    daiAddress,
    amountDaiToBorrow,
    1,
    0,
    account
  )
  await borrowTx.wait(1)
  console.log(`Borrowed 👍`)
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.address, amount, account)
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
  await repayTx.wait(1)
  console.log(`Repaid 👍`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => console.log(`Error Tx: `, err))
