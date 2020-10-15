const fs = require("fs");

const getStockLevelsForSku = async sku => {
  const startingStockQuantity = getStartingStockQuantityLevel(sku);
  const quantityAfterTransactions = getQuantityOfStockToRemoveAfterTransactions(sku, startingStockQuantity);

  const stockLevel = startingStockQuantity - quantityAfterTransactions;
  console.log(`Sku: ${sku}, stock: ${stockLevel}`)
  return { sku, qty: stockLevel };
};

const getStartingStockQuantityLevel = sku => {
  const stockJson = JSON.parse(fs.readFileSync("stock.json"));
  const stockMatchingSku = stockJson.filter((stock) => stock.sku === sku);

  if (stockMatchingSku.length < 1) {
    return null;
  }

  return stockMatchingSku[0].stock;
};

const getQuantityOfStockToRemoveAfterTransactions = (sku, startingQuantity) => {
  const transactionsJson = JSON.parse(fs.readFileSync("transactions.json"));
  let orderQuantity = 0;
  let refundQuantity = 0;

  const transactionsMatchingSku = transactionsJson.filter((transaction) => transaction.sku === sku);
  if (transactionsMatchingSku.length < 1 && startingQuantity === null) {
    throw new Error(`Sku: ${sku} not found`)
  }

  transactionsMatchingSku.forEach((transaction) => {
    if (transaction.type === "order") {
      orderQuantity += transaction.qty;
    } else if (transaction.type === "refund") {
      refundQuantity += transaction.qty;
    }
  });

  return orderQuantity - refundQuantity;
};

module.exports = getStockLevelsForSku;
