import prisma from "../config/db.config.js";

// Create Sale
export const createSale = async (data) => {
  const product = await prisma.product.findUnique({
    where: { code: data.productCode },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check stock
  if ((product.initialStock || 0) < data.quantity) {
    throw new Error("Not enough stock available");
  }

  // Deduct stock
  await prisma.product.update({
    where: { id: product.id },
    data: {
      initialStock: (product.initialStock || 0) - data.quantity,
    },
  });

  // Create sale with product snapshot and correct relation
  return await prisma.sales.create({
    data: {
      productId: product.id, // ✅ store actual relation ID
      code: data.code,
      sellerId: data.sellerId,
      shopId: data.shopId,
      branch: data.branch,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      soldAt: new Date(),

      // Snapshot from product
      name: product.name,
      purchasePrice: product.purchasePrice,
      salesPrice: product.salesPrice,
      discount: product.discount,
      includeVAT: product.includeVAT,
      batchNo: product.batchNo,
      serialNoOrIMEI: product.serialNoOrIMEI,
      description: product.description,
      itemUnit: product.itemUnit,
      itemCategory: product.itemCategory,
      size: product.size,
      wholesalePrice: product.wholesalePrice,
      mrp: product.mrp,
    },
  });
};


// Get All Sales
export const getAllSales = async () => {
  return await prisma.sales.findMany({
    include: {
      product: true,
      seller: true,
      shop: true,
    },
  });
};

// Get Sale by ID
export const getSaleById = async (id) => {
  return await prisma.sales.findUnique({
    where: { id: id },
    include: {
      product: true,
      seller: true,
      shop: true,
    },
  });
};

// Update Sale (only non-product fields)
export const updateSale = async (id, data) => {
  return await prisma.sales.update({
    where: { id: Number(id) },
    data,
  });
};

// Delete Sale
export const deleteSale = async (id) => {
  return await prisma.sales.delete({
    where: { id: Number(id) },
  });
};

// Get Sales Stats (Revenue per Seller)
export const getSalesStats = async () => {
  // Get all sales data
  const sales = await prisma.sales.findMany({
    include: {
      seller: true, // Include seller info
    },
  });

  // Group sales by seller
  const sellerStats = sales.reduce((stats, sale) => {
    const sellerId = sale.sellerId;

    if (!stats[sellerId]) {
      stats[sellerId] = {
        totalRevenue: 0,
        averageOrderValue: 0,
        totalSales: 0,
      };
    }

    stats[sellerId].totalRevenue += sale.totalPrice;
    stats[sellerId].totalSales += 1;

    return stats;
  }, {});

  // Calculate average order value for each seller
  for (const sellerId in sellerStats) {
    const seller = sellerStats[sellerId];
    seller.averageOrderValue = seller.totalRevenue / seller.totalSales;
  }

  // Return revenue stats grouped by seller
  return sellerStats;
};


// Get Top Selling Products by Seller
export const getTopSellingProductsBySeller = async (limit = 5, shopId) => {
  const whereCondition = shopId ? { shopId: Number(shopId) } : {};

  // Step 1: Group sales by seller and product code
  const groupedSales = await prisma.sales.groupBy({
    by: ["sellerId", "code"],
    where: whereCondition,
    _sum: {
      quantity: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
  });

  // Step 2: Group sales by sellerId, so each seller has their own top products
  const sellerSales = groupedSales.reduce((result, sale) => {
    if (!result[sale.sellerId]) {
      result[sale.sellerId] = [];
    }

    result[sale.sellerId].push(sale);

    return result;
  }, {});

  // Step 3: For each seller, fetch product details and combine with sales quantity
  const sellerTopSellingProducts = {};
  for (const sellerId in sellerSales) {
    const sales = sellerSales[sellerId];
    const productCodes = sales.map((sale) => sale.code);

    // Fetch product details for top-selling products
    const products = await prisma.product.findMany({
      where: {
        code: {
          in: productCodes,
        },
      },
    });

    // Combine product info with total quantity sold for each product
    const productsWithSales = products.map((product) => {
      const sale = sales.find((sale) => sale.code === product.code);
      return {
        ...product,
        totalSold: sale?._sum.quantity || 0,
      };
    });

    sellerTopSellingProducts[sellerId] = {
      totalTopSellingProducts: productsWithSales.length,
      products: productsWithSales,
    };
  }

  // Return top-selling products grouped by seller
  return sellerTopSellingProducts;
};


export const getMonthlySalesStats = async () => {
  const sales = await prisma.sales.findMany({
    select: {
      soldAt: true,
      totalPrice: true,
    },
  });

  const monthMap = {
    0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
    6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
  };

  const salesByMonth = {};

  sales.forEach((sale) => {
    const month = monthMap[new Date(sale.createdAt).getMonth()];
    if (!salesByMonth[month]) {
      salesByMonth[month] = 0;
    }
    salesByMonth[month] += sale.totalAmount;
  });

  const result = Object.keys(monthMap).map((num) => {
    const month = monthMap[num];
    return {
      month,
      sales: salesByMonth[month] || 0,
    };
  });

  return result;
};

// // Get Top Selling Products by Product Code
// export const getTopSellingProducts = async (limit = 5, shopId) => {
//   const whereCondition = shopId ? { shopId: Number(shopId) } : {};

//   // Step 1: Group sales by product code
//   const groupedSales = await prisma.sales.groupBy({
//     by: ["code"],
//     where: whereCondition,
//     _sum: {
//       quantity: true,
//     },
//     orderBy: {
//       _sum: {
//         quantity: "desc",
//       },
//     },
//   });

//   // Step 2: Total top-selling products (before applying limit)
//   const totalTopSellingProducts = groupedSales.length;

//   // Step 3: Apply limit
//   const limitedSales = groupedSales.slice(0, limit);

//   // Step 4: Fetch related product details
//   const productCodes = limitedSales.map((item) => item.code);

//   const products = await prisma.product.findMany({
//     where: {
//       code: {
//         in: productCodes,
//       },
//     },
//   });

//   // Step 5: Merge products with their sales quantity
//   const productsWithSales = products.map((product) => {
//     const sale = limitedSales.find((item) => item.code === product.code);
//     return {
//       ...product,
//       totalSold: sale?._sum.quantity || 0,
//     };
//   });

//   return {
//     totalTopSellingProducts,
//     products: productsWithSales,
//   };
// };