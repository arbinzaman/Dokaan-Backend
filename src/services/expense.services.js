import prisma from "../config/db.config.js";
import { filterByTime,  } from "../utils/dateFilter.js";


// Create expense
export const createExpense = async (data) => {
  const { title, amount, notes, category, date, user_id, shopId } = data;

  if (!user_id || !shopId) {
    throw new Error("user_id and shopId are required");
  }

  return await prisma.expense.create({
    data: {
      title,
      amount,
      notes,
      category,
      date,
      user_id: BigInt(user_id),
      dokaanId: BigInt(shopId), // ✅ Assign to dokaanId (NOT shopId)
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  });
};


export const getFinancialSummary = async (shopId, type = "day") => {
  if (!shopId) throw new Error("shopId is required");

  const shopIdBigInt = BigInt(shopId);

  const sales = await prisma.sales.findMany({
    where: { shopId: shopIdBigInt },
    select: {
      totalPrice: true,
      soldAt: true,
    },
  });

  const expenses = await prisma.expense.findMany({
    where: { dokaanId: shopIdBigInt },
    select: {
      amount: true,
      date: true,
    },
  });

  const result = {};

  for (const sale of sales) {
    const date = new Date(sale.soldAt);
    let key;

    switch (type) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = `${date.getFullYear()}`;
        break;
      default:
        key = date.toISOString().split("T")[0]; // day
    }

    if (!result[key]) {
      result[key] = { totalRevenue: 0, totalExpense: 0, netProfit: 0 };
    }

    result[key].totalRevenue += sale.totalPrice;
  }

  for (const expense of expenses) {
    const date = new Date(expense.date);
    let key;

    switch (type) {
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        break;
      case "year":
        key = `${date.getFullYear()}`;
        break;
      default:
        key = date.toISOString().split("T")[0]; // day
    }

    if (!result[key]) {
      result[key] = { totalRevenue: 0, totalExpense: 0, netProfit: 0 };
    }

    result[key].totalExpense += expense.amount;
  }

  for (const key in result) {
    result[key].netProfit = result[key].totalRevenue - result[key].totalExpense;
  }

  return result;
};


export const getDetailedIncomeStatement = async ({ shopId, type, year, month, date, week }) => {
  if (!shopId) throw new Error("shopId is required");

  const shopIdBigInt = BigInt(shopId);

  // Get sales
  const sales = await prisma.sales.findMany({
    where: { shopId: shopIdBigInt },
    select: { totalPrice: true, soldAt: true }
  });

  // Get expenses
  const expenses = await prisma.expense.findMany({
    where: { dokaanId: shopIdBigInt },
    select: { amount: true, category: true, date: true }
  });

  // Get other income if needed
  const incomes = await prisma.income.findMany({
    where: { dokaanId: shopIdBigInt },
    select: { amount: true, source: true, date: true }
  });

  const filteredSales = filterByTime(sales, "soldAt", { type, date, month, year, week });
  const filteredExpenses = filterByTime(expenses, "date", { type, date, month, year, week });
  const filteredIncomes = filterByTime(incomes, "date", { type, date, month, year, week });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0) +
                       filteredIncomes.reduce((sum, i) => sum + i.amount, 0);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const expenseBreakdown = {};
  for (const expense of filteredExpenses) {
    if (!expenseBreakdown[expense.category]) {
      expenseBreakdown[expense.category] = 0;
    }
    expenseBreakdown[expense.category] += expense.amount;
  }

  const revenueBreakdown = {
    productSales: filteredSales.reduce((sum, s) => sum + s.totalPrice, 0),
    otherIncome: filteredIncomes.reduce((sum, i) => sum + i.amount, 0),
  };

  return {
    summary: { totalRevenue, totalExpenses, netProfit },
    revenueBreakdown,
    expenseBreakdown
  };
};


// Get all expenses for a shop
export const getAllExpensesByShopId = async (shopId) => {
  if (!shopId) {
    throw new Error("shopId is required");
  }

  const dokaanId = Number(shopId); // Convert to number first

  if (isNaN(dokaanId)) {
    throw new Error("Invalid shopId format. Must be a numeric string.");
  }

  return await prisma.expense.findMany({
    where: { dokaanId: BigInt(dokaanId) },
    orderBy: { date: "desc" },
  });
};



// Get single expense
export const getSingleExpense = async (id) => {
  return await prisma.expense.findUnique({
    where: { id: Number(id) },
  });
};

// Update
export const updateExpense = async (id, data) => {
  return await prisma.expense.update({
    where: { id: Number(id) },
    data: {
      title: data.title,
      notes: data.notes,
      amount: data.amount,
      category: data.category,
      date: data.date,
      updated_at: new Date().toISOString(),

      ...(data.user_id && {
        user: {
          connect: { id: BigInt(data.user_id) },
        },
      }),
      ...(data.shopId && {
        dokaan: {
          connect: { id: BigInt(data.shopId) },
        },
      }),
    },
  });
};



export const deleteExpense = async (id) => {
  return await prisma.expense.delete({
    where: { id: Number(id) },
  });
};

//
