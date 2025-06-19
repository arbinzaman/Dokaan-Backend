import prisma from "../config/db.config.js";

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
