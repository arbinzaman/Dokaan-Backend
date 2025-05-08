import prisma from "../config/db.config.js";

// Create Sale
export const createSale = async (data) => {
  console.log(data);
  const product = await prisma.product.findUnique({
    where: { code: data.code },
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
    where: { code: product.code },
    data: {
      initialStock: (product.initialStock || 0) - data.quantity,
    },
  });

  // Create sale with product snapshot and correct relation
  return await prisma.sales.create({
    data: {
      // productId: product.id, // Store the actual relation ID
      code: data.code,
      // sellerId: data.sellerId,
      // shopId: data.shopId,
      branch: data.branch,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      soldAt: new Date(),

        // Connect to the existing product
        product: {
          connect: { id: product.id }, // This ensures you're linking to the existing product
        },
        seller: {
          connect: {
            id: data.sellerId, // connect the seller by their unique ID
          },
        },
          // Shop relation
          shop: {
            connect: {
              id: data.shopId,
            },
          },
    
      
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
// Filter by year, month, date
const monthMap = {
  jan: 0, feb: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
// Get all sales for a specific shop, with optional filters for year, month, and date
// Returns an object with filters, filtered sales, and grouped sales
export const getAllSales = async (shopId, year, month, date,day) => {
  const sales = await prisma.sales.findMany({
    where: { shopId: Number(shopId) },
    include: {
      product: true,
      seller: true,
      shop: true,
    },
    orderBy: { soldAt: "desc" },
  });

  const filtered = sales.filter((sale) => {
    const soldAt = new Date(sale.soldAt);
    const saleDay = soldAt.getDate(); // 1 to 31
    const saleMonth = soldAt.getMonth(); // 0-11
    const saleYear = soldAt.getFullYear();
  
    // Match exact date (YYYY-MM-DD)
    if (date) {
      const targetDate = new Date(date);
      return soldAt.toDateString() === targetDate.toDateString();
    }
  
    // Match specific day of month (e.g., all sales on 7th day)
    if (day) {
      return saleDay === Number(day);
    }
  
    if (month && !year) {
      return saleMonth === monthMap[month.toLowerCase()];
    }
  
    if (year && month) {
      return (
        saleYear === Number(year) &&
        saleMonth === monthMap[month.toLowerCase()]
      );
    }
  
    if (year) {
      return saleYear === Number(year);
    }
  
    return true;
  });
  
  
  
  

  const grouped = {
    dayWise: {},
    monthWise: {},
    yearWise: {},
  };

  for (const sale of filtered) {
    const soldAt = new Date(sale.soldAt);
    const dayKey = soldAt.toISOString().split("T")[0];
    const monthKey = `${soldAt.getFullYear()}-${String(soldAt.getMonth() + 1).padStart(2, "0")}`;
    const yearKey = `${soldAt.getFullYear()}`;

    const groupSale = (group, key) => {
      if (!group[key]) {
        group[key] = {
          totalSales: 0,
          totalQuantity: 0,
          totalRevenue: 0,
          sales: [],
        };
      }
      group[key].totalSales += 1;
      group[key].totalQuantity += sale.quantity;
      group[key].totalRevenue += sale.totalPrice;
      group[key].sales.push(sale);
    };

    groupSale(grouped.dayWise, dayKey);
    groupSale(grouped.monthWise, monthKey);
    groupSale(grouped.yearWise, yearKey);
  }

  return {
    filters: { shopId, year, month, date },
    filteredSales: filtered,
    groupedSales: grouped,
  };
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

export const getMonthlySalesStats = async (shopId) => {
  const sales = await prisma.sales.findMany({
    where: {
      shopId: shopId,
    },
    select: {
      soldAt: true,
      totalPrice: true,
    },
  });

  const monthMap = {
    0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr",
    4: "May", 5: "Jun", 6: "Jul", 7: "Aug",
    8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
  };

  const salesByMonth = {};

  sales.forEach((sale) => {
    const month = monthMap[new Date(sale.soldAt).getMonth()];
    salesByMonth[month] = (salesByMonth[month] || 0) + Number(sale.totalPrice);
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


// Get total sales for a specific shop (sum of all sales)
export const getTotalSales = async (shopId) => {
  if (!shopId) {
    throw new Error("shopId is required");
  }

  const result = await prisma.sales.aggregate({
    where: {
      shopId: Number(shopId),
    },
    _sum: {
      totalPrice: true,
    },
  });

  return {
    shopId: Number(shopId),
    totalSales: result._sum.totalPrice ?? 0,
  };
};



export const getCategoryWiseSales = async (shopId) => {
  const result = await prisma.sales.groupBy({
    by: ["itemCategory"],
    _sum: {
      totalPrice: true,
    },
    where: {
      shopId: shopId, // Add filter by shopId
    },
  });

  return result.map((item) => ({
    category: item.itemCategory || "Uncategorized",
    totalSalesAmount: item._sum.totalPrice || 0,
  }));
};


export const getTotalRevenue = async (parsedShopId) => {
  const sales = await prisma.sales.findMany({
    where: {
      shopId: parsedShopId,
    },
    select: {
      salesPrice: true,
      purchasePrice: true,
    },
  });

  let totalRevenue = 0;

  for (const sale of sales) {
    const revenue = sale.salesPrice - sale.purchasePrice;
    totalRevenue += revenue;
  }

  return { totalRevenue };
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
