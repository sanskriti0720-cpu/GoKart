require('dotenv').config();

const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { connectDatabase } = require('../config/database');

const categories = [
  {
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Thoughtful essentials for a more considered home.',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Useful technology, selected for everyday life.',
  },
  {
    name: 'Style',
    slug: 'style',
    description: 'Easy-to-wear pieces and considered accessories.',
  },
];

const products = [
  {
    name: 'Sculpted Ceramic Table Lamp',
    slug: 'sculpted-ceramic-table-lamp',
    sku: 'HOME-LAMP-001',
    description: 'A softly sculpted ceramic lamp with a warm linen shade, made to bring a gentle glow to bedside tables and reading corners.',
    categorySlug: 'home-living',
    brand: 'Forma Studio',
    price: 5499,
    compareAtPrice: 6999,
    stock: 18,
    tags: ['lighting', 'ceramic', 'living room'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85', alt: 'Sculpted ceramic table lamp' }],
  },
  {
    name: 'Everyday Stoneware Mug Set',
    slug: 'everyday-stoneware-mug-set',
    sku: 'HOME-MUG-002',
    description: 'A set of two tactile stoneware mugs with a comfortable handle and subtle glaze variation. Made for a slower morning coffee.',
    categorySlug: 'home-living',
    brand: 'Common Table',
    price: 1299,
    compareAtPrice: 1599,
    stock: 42,
    tags: ['kitchen', 'stoneware', 'coffee'],
    images: [{ url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85', alt: 'Stoneware coffee mugs' }],
  },
  {
    name: 'Wireless Noise-Cancelling Headphones',
    slug: 'wireless-noise-cancelling-headphones',
    sku: 'TECH-AUDIO-003',
    description: 'Comfort-first wireless headphones with active noise cancellation, balanced sound, and a long-lasting battery for commutes and focused work.',
    categorySlug: 'technology',
    brand: 'North Audio',
    price: 8999,
    compareAtPrice: 10999,
    stock: 15,
    soldCount: 28,
    tags: ['audio', 'wireless', 'travel'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', alt: 'Wireless over-ear headphones' }],
  },
  {
    name: 'Compact Bluetooth Speaker',
    slug: 'compact-bluetooth-speaker',
    sku: 'TECH-AUDIO-004',
    description: 'A compact portable speaker with clear room-filling sound, simple controls, and a durable fabric finish for home or travel.',
    categorySlug: 'technology',
    brand: 'North Audio',
    price: 3499,
    compareAtPrice: null,
    stock: 31,
    soldCount: 12,
    tags: ['audio', 'bluetooth', 'portable'],
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85', alt: 'Portable Bluetooth speaker' }],
  },
  {
    name: 'Everyday Canvas Weekender',
    slug: 'everyday-canvas-weekender',
    sku: 'STYLE-BAG-005',
    description: 'A durable canvas weekender with considered pockets, sturdy handles, and enough space for a short trip or a full day out.',
    categorySlug: 'style',
    brand: 'Field Notes Supply',
    price: 4299,
    compareAtPrice: 4999,
    stock: 21,
    tags: ['bag', 'travel', 'canvas'],
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85', alt: 'Canvas travel weekender bag' }],
  },
  {
    name: 'Minimal Everyday Watch',
    slug: 'minimal-everyday-watch',
    sku: 'STYLE-WATCH-006',
    description: 'A clean, versatile timepiece with a brushed steel case and a comfortable strap, designed to move easily from workday to weekend.',
    categorySlug: 'style',
    brand: 'Meridian',
    price: 6799,
    compareAtPrice: null,
    stock: 12,
    tags: ['watch', 'accessories', 'minimal'],
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85', alt: 'Minimal everyday wristwatch' }],
  },
];

async function seedDatabase() {
  try {
    await connectDatabase();
    const categoryIds = new Map();

    for (const category of categories) {
      const savedCategory = await Category.findOneAndUpdate(
        { slug: category.slug },
        { $set: { ...category, isActive: true } },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
      categoryIds.set(category.slug, savedCategory._id);
    }

    for (const { categorySlug, ...product } of products) {
      await Product.findOneAndUpdate(
        { slug: product.slug },
        {
          $set: {
            ...product,
            category: categoryIds.get(categorySlug),
            status: 'active',
          },
        },
        { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
      );
    }

    console.info(`Seeded ${categories.length} categories and ${products.length} products.`);
  } catch (error) {
    console.error('Unable to seed ShopSphere:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
