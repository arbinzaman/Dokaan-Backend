import prisma from "../config/db.config.js";

// Create a new customer
export const createCustomer = async (data) => {
  return await prisma.customer.create({ data });
};

// Get all customers with purchase details and favorite status
export const getAllCustomersWithDetails = async () => {
    const customers = await prisma.customer.findMany({
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
      const isFavorite = shopSet.size > 5; // CHANGED LOGIC
  
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
  
