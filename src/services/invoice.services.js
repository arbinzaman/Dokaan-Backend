import prisma from "../config/db.config.js";

export const createInvoice = async (data) => {
  return await prisma.invoice.create({
    data: {
      ...rest,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      sales: {
        create: sales.map((sale) => ({
          productId: sale.productId,
          quantity: sale.quantity,
          salesPrice: sale.salesPrice,
          purchasePrice: sale.purchasePrice,
          discount: sale.discount,
          name: sale.name,
          code: sale.code,
          totalPrice: sale.salesPrice * sale.quantity - (sale.discount || 0),
        })),
      },
    },
  });
};

export const getInvoices = async ({ shopId, day, month, year }) => {
  const where = {
    shopId: BigInt(shopId),
  };

  if (day || month || year) {
    const startDate = new Date();
    const endDate = new Date();

    if (year) startDate.setFullYear(year);
    if (month) startDate.setMonth(month - 1);
    if (day) startDate.setDate(day);

    startDate.setHours(0, 0, 0, 0);
    endDate.setTime(startDate.getTime());

    if (day) {
      endDate.setDate(endDate.getDate() + 1);
    } else if (month) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (year) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    where.createdAt = {
      gte: startDate,
      lt: endDate,
    };
  }

  return await prisma.invoice.findMany({
    where,
    include: {
      customer: true,
      seller: true,
      sales: true,
      shop: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getInvoiceById = async (id) => {
  return await prisma.invoice.findUnique({
    where: { id: BigInt(id) },
    include: {
      customer: true,
      seller: true,
      sales: true,
      shop: true,
    },
  });
};

export const updateInvoice = async (id, data) => {
  return await prisma.invoice.update({
    where: { id: BigInt(id) },
    data,
  });
};

export const deleteInvoice = async (id) => {
  return await prisma.invoice.delete({
    where: { id: BigInt(id) },
  });
};
