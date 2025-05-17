import prisma from "../config/db.config.js";

// Create a new customer
export const createCustomer = async (data) => {
  return await prisma.customer.create({ data });
};

// Get all customers with purchase details and favorite status
export const getAllCustomersWithDetails = async (filters = {}) => {
  const { year, month, day } = filters;

  let dateFilter = {};
  if (year) {
    // If month is a string like "January", convert to index
    let monthIndex = 0;

    if (typeof month === "string") {
      const parsedDate = new Date(`${month} 1, ${year}`);
      if (!isNaN(parsedDate)) {
        monthIndex = parsedDate.getMonth();
      }
    } else if (!isNaN(month)) {
      monthIndex = Number(month) - 1; // Convert 1-based to 0-based index
    }

    const safeDay = !isNaN(day) ? Number(day) : 1;

    const startDate = new Date(year, monthIndex, safeDay);
    const endDate = new Date(
      year,
      typeof month !== "undefined" ? monthIndex + 1 : 11,
      day ? safeDay + 1 : 31
    );

    if (!isNaN(startDate) && !isNaN(endDate)) {
      dateFilter.createdAt = {
        gte: startDate,
        lt: endDate,
      };
    }
  }

  const customers = await prisma.customer.findMany({
    where: dateFilter,
    include: {
      purchaseStats: {
        include: {
          dokaan: true,
          product: true,
        },
      },
    },
  });
  

  return customers.map((customer) => {
    const shopSet = new Set(customer.purchaseStats.map((stat) => stat.dokaanId));
    const isFavorite = shopSet.size > 5;
  
    const purchases = customer.purchaseStats.map((stat) => ({
      dokaanName: stat.dokaan.dokaan_name,
      productName: stat.product.name,
      purchaseCount: stat.purchaseCount,
    }));
  
    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      favorite: isFavorite,
      purchases,
      createdAt: customer.createdAt, // ✅ CRITICAL
    };
  });
  
  
};



// Get a single customer by ID
export const getCustomerById = async (id) => {
  return await prisma.customer.findUnique({
    where: { id },
    include: {
      purchaseStats: {
        include: {
          dokaan: true,
          product: true,
        },
      },
    },
  });
};

// Update customer
export const updateCustomer = async (id, data) => {
  return await prisma.customer.update({
    where: { id },
    data,
  });
};

// Delete customer
export const deleteCustomer = async (id) => {
  return await prisma.customer.delete({
    where: { id },
  });
};

// Get customer statistics
export const getCustomerStats = async (shopId) => {
    // console.log(shopId);
    const customers = await prisma.customer.findMany({
      where: {
        purchaseStats: {
          some: {
            dokaanId: Number(shopId),
          },
        },
      },
      include: {
        purchaseStats: {
          where: {
            dokaanId: Number(shopId),
          },
          include: {
            dokaan: true,
          },
        },
      },
    });
  
    let totalPurchases = 0;
    let favoriteCustomers = 0;
  
    const customerDetails = customers.map((customer) => {
      const purchases = customer.purchaseStats;
      const total = purchases.reduce((acc, curr) => acc + curr.purchaseCount, 0);
      const shopSet = new Set(purchases.map((p) => p.dokaanId));
      const shopCount = shopSet.size;
      const isFavorite = shopCount > 5; // CHANGED LOGIC
  
      if (isFavorite) favoriteCustomers++;
      totalPurchases += total;
  
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalPurchases: total,
        shopCount,
        isFavorite,
      };
    });
  
    return {
      totalCustomers: customerDetails.length,
      favoriteCustomers,
      totalPurchases,
      customers: customerDetails,
    };
  };
  
// Get customer growth stats month-wise
export const getCustomerGrowthByShop = async (shopId) => {
  if (!shopId) throw new Error("shopId is required");

  const customers = await prisma.customer.findMany({
    where: {
      purchaseStats: {
        some: {
          dokaanId: Number(shopId),
        },
      },
    },
    select: {
      id: true,
      purchaseStats: {
        where: {
          dokaanId: Number(shopId),
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
      },
    },
  });

  const monthlyCounts = Array(12).fill(0);
  let latestMonth = null;

  customers.forEach((customer) => {
    const firstPurchase = customer.purchaseStats[0];
    if (!firstPurchase) return;

    const createdAt = new Date(firstPurchase.createdAt);
    const month = createdAt.getMonth(); // 0 = Jan, 11 = Dec
    monthlyCounts[month]++;
    if (!latestMonth || createdAt > latestMonth) {
      latestMonth = createdAt;
    }
  });

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthData = monthLabels.map((month, index) => ({
    month,
    users: monthlyCounts[index],
  }));

  return {
    growthData,
    lastUpdatedMonth: latestMonth ? monthLabels[latestMonth.getMonth()] : null,
  };
};

