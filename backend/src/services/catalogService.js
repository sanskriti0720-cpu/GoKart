const Category = require('../models/Category');
const Product = require('../models/Product');

const sortOptions = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { soldCount: -1, ratingAverage: -1 },
};

async function listProducts(query) {
  const { q, category, brand, minRating, minPrice, maxPrice, sort, page, limit } = query;
  const filter = { status: 'active' };

  if (q) filter.$text = { $search: q };
  if (brand) filter.brand = new RegExp(`^${brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  if (minRating !== undefined) filter.ratingAverage = { $gte: minRating };
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (category) {
    const selectedCategory = await Category.findOne({
      isActive: true,
      $or: [{ slug: category.toLowerCase() }, ...(/^[a-f\d]{24}$/i.test(category) ? [{ _id: category }] : [])],
    })
      .select('_id')
      .lean();

    if (!selectedCategory) {
      return {
        products: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
    filter.category = selectedCategory._id;
  }

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions[sort])
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .lean(),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

module.exports = { listProducts };
