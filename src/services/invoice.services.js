import prisma from "../config/db.config.js";

export const createInvoice = async (data) => {
  // console.log("Seller ID:", data.sellerName);

  // return prisma.invoice.create({
  //   data: {
  //     invoiceNumber: data.invoiceNumber,
  //     totalPrice: data.totalPrice,
  //     discount: data.discount,
  //     vatPercent: data.vatPercent,
  //     notes: data.notes,
  //     paymentStatus: data.paymentStatus,
  //     paymentMethod: data.paymentMethod,
  //     paymentRef: data.paymentRef,
  //     paymentNotes: data.paymentNotes,
  //     paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
  //     dueDate: data.dueDate ? new Date(data.dueDate) : null,

  //     shop: { connect: { id: BigInt(data.shopId) } },
  //     customer: data.customerId
  //       ? { connect: { id: BigInt(data.customerId) } }
  //       : undefined,
  // seller: { connect: { id: BigInt(data.sellerId) } }, // THIS IS REQUIRED and ONLY place seller info goes

  //     sales: {
  //       create: data.sales.map((sale) => ({
  //         product: { connect: { id: BigInt(sale.productId) } },
  //         quantity: sale.quantity,
  //         salesPrice: sale.salesPrice,
  //         purchasePrice: sale.purchasePrice,
  //         discount: sale.discount,
  //         name: sale.name,
  //         code: sale.code,
  //         totalPrice: sale.salesPrice * sale.quantity - (sale.discount || 0),
  //       })),
  //     },
  //   },
  // });

  const prismaData = {
    invoiceNumber: data.invoiceNumber,
    totalPrice: data.totalPrice,
    discount: data.discount,
    vatPercent: data.vatPercent,
    notes: data.notes,
    paymentStatus: data.paymentStatus,
    paymentMethod: data.paymentMethod,
    paymentRef: data.paymentRef,
    paymentNotes: data.paymentNotes,
    paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
    dueDate: data.dueDate ? new Date(data.dueDate) : null,

    shopId: data.shopId,
    shopName: data.shopName,
    //  shop: { connect: { id: BigInt(data.shopId) } },

    customer: data.customerId
      ? { connect: { id: BigInt(data.customerId) } }
      : undefined,
    // customerId: data.customerId ? BigInt(data.customerId) : undefined,

    sellerName: data.sellerName, // keep this scalar string
    // seller: { connect: { id: BigInt(data.sellerId) } },
    seller: data.sellerId ? { connect: { id: BigInt(data.sellerId) } } : undefined,
    // sellerId: BigInt(data.sellerId),

    sales: {
      create: data.sales.map((sale) => ({
        product: { connect: { id: BigInt(sale.productId) } },
        quantity: sale.quantity,
        salesPrice: sale.salesPrice,
        purchasePrice: sale.purchasePrice,
        discount: sale.discount,
        name: sale.name,
        code: sale.code,
        totalPrice: sale.salesPrice * sale.quantity - (sale.discount || 0),
      })),
    },
  };

  console.log("prisma data", typeof prismaData.seller);
  console.log("Seller ID:", prismaData.seller);
  console.log("shop ID:", prismaData.shop);
  console.log("Prisma create data:", JSON.stringify(prismaData, null, 2));

  return prisma.invoice.create({
    data: prismaData,
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
      // seller: true,
      sales: true,
      // shop: true,
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
      // seller: true,
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
