import prisma from "../config/db.config.js";

export const createSale = async (data) => {
  const { products, customer, ...saleMeta } = data;

  // --- Handle customer logic ---
  let customerRecord = null;
  if (customer?.phone || customer?.email) {
    customerRecord = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: customer.phone ?? undefined },
          { email: customer.email ?? undefined },
        ],
      },
    });

    if (!customerRecord) {
      customerRecord = await prisma.customer.create({
        data: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
      });
    }
  }

  const createdSales = [];

  for (const item of products) {
    const product = await prisma.product.findUnique({
      where: { code: item.code },
    });

    if (!product) {
      throw new Error(`Product not found: ${item.code}`);
    }

    if ((product.initialStock || 0) < item.quantity) {
      throw new Error(`Not enough stock for product: ${product.name}`);
    }

    // Update product stock
    await prisma.product.update({
      where: { code: product.code },
      data: {
        initialStock: (product.initialStock || 0) - item.quantity,
      },
    });

    // Create sale
    const sale = await prisma.sales.create({
      data: {
        code: item.code,
        branch: saleMeta.branch,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        soldAt: new Date(saleMeta.soldAt || new Date()),

        product: { connect: { id: product.id } },
        seller: { connect: { id: saleMeta.sellerId } },
        shop: { connect: { id: saleMeta.shopId } },

        ...(customerRecord && { customer: { connect: { id: customerRecord.id } } }),

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

    // Update CustomerPurchase entry if customer exists
    if (customerRecord) {
      const dokaanId = saleMeta.shopId;

      const existingPurchase = await prisma.customerPurchase.findUnique({
        where: {
          customerId_dokaanId_productId: {
            customerId: customerRecord.id,
            dokaanId: dokaanId,
            productId: product.id,
          },
        },
      });

      if (existingPurchase) {
        await prisma.customerPurchase.update({
          where: {
            customerId_dokaanId_productId: {
              customerId: customerRecord.id,
              dokaanId: dokaanId,
              productId: product.id,
            },
          },
          data: {
            purchaseCount: existingPurchase.purchaseCount + item.quantity,
          },
        });
      } else {
        await prisma.customerPurchase.create({
          data: {
            customerId: customerRecord.id,
            dokaanId: dokaanId,
            productId: product.id,
            purchaseCount: item.quantity,
          },
        });
      }
    }

    createdSales.push(sale);
  }

  return createdSales;
};


// Get All Sales
// Filter by year, month, date
const monthMap = {
  jan: 0, feb: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};
// Get all sales for a specific shop, with optional filters for year, month, and date
// Returns an object with filters, filtered sales, and grouped sales
export const getAllSales = async (shopId, year, month, date, day) => {
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
    const saleDay = soldAt.getDate(); // 1-31
    const saleMonth = soldAt.getMonth(); // 0-11
    const saleYear = soldAt.getFullYear();
  
    // Match full exact date
    if (date) {
      const filterDate = new Date(date);
      return soldAt.toDateString() === filterDate.toDateString();
    }
  
    // ✅ Match by day + month
    if (day && month && !year) {
      return (
        saleDay === Number(day) &&
        saleMonth === monthMap[month.toLowerCase()]
      );
    }
  
    // ✅ Match by day only (across all months/years)
    if (day && !month && !year) {
      return saleDay === Number(day);
    }
  
    // Match by month only
    if (month && !year) {
      return saleMonth === monthMap[month.toLowerCase()];
    }
  
    // Match month + year
    if (month && year) {
      return (
        saleMonth === monthMap[month.toLowerCase()] &&
        saleYear === Number(year)
      );
    }
  
    // Match year only
    if (year) {
      return saleYear === Number(year);
    }
  
    return true; // fallback: return all if no filters
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


export const getTotalRevenueAndGrowth = async (shopId) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based

  const currentMonthStart = new Date(year, month, 1);
  const nextMonthStart = new Date(year, month + 1, 1);

  const previousMonthStart = new Date(year, month - 1, 1);
  const thisMonthStart = currentMonthStart;

  // Get sales for current month
  const currentSales = await prisma.sales.findMany({
    where: {
      shopId,
      soldAt: {
        gte: currentMonthStart,
        lt: nextMonthStart,
      },
    },
    select: {
      salesPrice: true,
      purchasePrice: true,
    },
  });

  // Get sales for previous month
  const previousSales = await prisma.sales.findMany({
    where: {
      shopId,
      soldAt: {
        gte: previousMonthStart,
        lt: thisMonthStart,
      },
    },
    select: {
      salesPrice: true,
      purchasePrice: true,
    },
  });

  // Helper to calculate total revenue for sales array
  const calculateRevenue = (sales) =>
    sales.reduce((sum, s) => sum + (s.salesPrice - s.purchasePrice), 0);

  const currentTotalRevenue = calculateRevenue(currentSales);
  const previousTotalRevenue = calculateRevenue(previousSales);

  let growth = 0;
  if (previousTotalRevenue > 0) {
    growth = ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100;
  }

  return {
    totalRevenue: currentTotalRevenue,
    salesGrowth: growth.toFixed(1) + '%',
  };
};

export const getTotalDailySalesCount = async () => {
  // Count total sales records
  const totalSales = await prisma.sales.count();

  // Format today's date as "May 15, 2025"
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group sales by date (soldAt), sum totalPrice
  const rawSalesData = await prisma.sales.groupBy({
    by: ['soldAt'],
    _sum: {
      totalPrice: true,
    },
  });

  // Initialize days of week with zero sales (Mon to Sun)
  const daysOfWeek = [
    { name: 'Mon', sales: 0 },
    { name: 'Tue', sales: 0 },
    { name: 'Wed', sales: 0 },
    { name: 'Thu', sales: 0 },
    { name: 'Fri', sales: 0 },
    { name: 'Sat', sales: 0 },
    { name: 'Sun', sales: 0 },
  ];

  // Aggregate sales per weekday
  for (const sale of rawSalesData) {
    const saleDate = new Date(sale.soldAt);
    // JS getDay(): Sunday=0, Monday=1 ... Saturday=6
    // Shift so Monday=0 ... Sunday=6
    const dayIndex = (saleDate.getDay() + 6) % 7;
    daysOfWeek[dayIndex].sales += sale._sum.totalPrice ?? 0;
  }

  return {
    totalSales,
    date,
    dailySalesData: daysOfWeek,
  };
}



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
