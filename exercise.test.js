const fs = require("fs");
const getStockLevelsForSku = require("./exercise");

jest.mock("fs");

describe("getStockLevelsForSku", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should calculate final stock quantity given sku with starting stock values and transactions", async () => {
    const dummySku = "dummy-sku";
    const initialQuantity = 50;
    const orderQuantity = 20;
    const refundQuantity = 10;

    fs.readFileSync.mockReturnValueOnce(
      getDummyStartingStock(dummySku, initialQuantity)
    );

    fs.readFileSync.mockReturnValueOnce(
      getDummyTransactions(dummySku, orderQuantity, refundQuantity)
    );

    const result = await getStockLevelsForSku(dummySku);

    expect(result.sku).toBe(dummySku);
    expect(result.qty).toBe(40);
  });

  it("should calculate final stock quantity when given sku with no starting stock values but with transactions", async () => {
    const dummySku = "dummy-sku";
    const orderQuantity = 40;
    const refundQuantity = 10;

    fs.readFileSync.mockReturnValueOnce(getDummyStartingStock("any-sku", 10));

    fs.readFileSync.mockReturnValueOnce(
      getDummyTransactions(dummySku, orderQuantity, refundQuantity)
    );

    const result = await getStockLevelsForSku(dummySku);

    expect(result.sku).toBe(dummySku);
    expect(result.qty).toBe(-30);
  });

  it("should calculate final stock quantity when given sku with starting stock values but no transactions", async () => {
    const dummySku = "dummy-sku";
    const initialQuantity = 10;

    fs.readFileSync.mockReturnValueOnce(
      getDummyStartingStock(dummySku, initialQuantity)
    );

    fs.readFileSync.mockReturnValueOnce(
      getDummyTransactions("any-sku", 50, 10)
    );

    const result = await getStockLevelsForSku(dummySku);

    expect(result.sku).toBe(dummySku);
    expect(result.qty).toBe(10);
  });

  it("should throw exception when sku is not found in starting stock and transactions", async () => {
    const noneExistingSku = "none-existing-sku";

    fs.readFileSync.mockReturnValueOnce(getDummyStartingStock("any-sku", 10));

    fs.readFileSync.mockReturnValueOnce(getDummyTransactions("any-sku", 10, 1));

    await expect(getStockLevelsForSku(noneExistingSku)).rejects.toThrow(
      `Sku: ${noneExistingSku} not found`
    );
  });
});

const getDummyStartingStock = (sku, stockQuantity) => {
  return JSON.stringify([
    {
      sku: sku,
      stock: stockQuantity,
    },
    {
      sku: "some-sku",
      stock: 100,
    },
  ]);
};

const getDummyTransactions = (sku, orderQuantity, refundQuantity) => {
  return JSON.stringify([
    { sku: sku, type: "order", qty: orderQuantity },
    { sku: "some-sku", type: "order", qty: 4 },
    { sku: sku, type: "refund", qty: refundQuantity },
    { sku: "some-sku", type: "refund", qty: 1 },
  ]);
};
