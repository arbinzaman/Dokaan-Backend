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

export const getSaleById = async (id) => {
  try {
    // If your database uses BigInt for 'id', you can cast it
    return await prisma.sales.findUnique({
      where: { id: BigInt(id) },  // Ensure id is BigInt if needed
      include: {
        product: true,
        seller: true,
        shop: true,
      },
    });
  } catch (error) {
    console.error('Get Sale By ID Error:', error);
    throw new Error('Invalid ID or incorrect field type');
  }
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

export const getSalesStats = async () => {
  const sales = await prisma.sales.findMany();

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
  const averageOrderValue = totalRevenue / sales.length || 0;

  return {
    totalRevenue,
    averageOrderValue,
  };
};


// Get Top Selling Products by Product Code
export const getTopSellingProducts = async (limit = 5, shopId) => {
  const whereCondition = shopId ? { shopId: Number(shopId) } : {};

  // Step 1: Group sales by product code
  const groupedSales = await prisma.sales.groupBy({
    by: ["code"],
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

  // Step 2: Total top-selling products (before applying limit)
  const totalTopSellingProducts = groupedSales.length;

  // Step 3: Apply limit
  const limitedSales = groupedSales.slice(0, limit);

  // Step 4: Fetch related product details
  const productCodes = limitedSales.map((item) => item.code);

  const products = await prisma.product.findMany({
    where: {
      code: {
        in: productCodes,
      },
    },
  });

  // Step 5: Merge products with their sales quantity
  const productsWithSales = products.map((product) => {
    const sale = limitedSales.find((item) => item.code === product.code);
    return {
      ...product,
      totalSold: sale?._sum.quantity || 0,
    };
  });

  return {
    totalTopSellingProducts,
    products: productsWithSales,
  };
};


export const getLowStockProducts = async (shopId) => {
  // Find products with initial stock less than or equal to 5 or with null initial stock
  const lowStockProducts = await prisma.product.findMany({
    where: {
      shopId: shopId, // Filter by shopId (dokaan.id)
      OR: [
        {
          initialStock: {
            lte: 5, // Define threshold for low stock
          },
        },
        {
          initialStock: null, // Include products with null stock
        },
        {
          initialStock: 0, // Include products with zero stock
        },
      ],
    },
  });

  const count = lowStockProducts.length;

  return {
    totalLowStockProducts: count,
    products: lowStockProducts,
  };
};


// sales.services.js
export const getSalesDataByMonth = async () => {
  try {
    const salesData = await prisma.sales.groupBy({
      by: ['month'], // Group by month
      _sum: {
        sales: true, // Sum up sales for each month
      },
      orderBy: {
        month: 'asc', // Order by month
      },
    });

    // Format the data as needed
    return salesData.map((data) => ({
      month: data.month,
      sales: data._sum.sales,
    }));
  } catch (error) {
    console.error('Error fetching sales data by month:', error);
    throw new Error('Error fetching sales data');
  }
};








