import { Product } from '../types/data';

/** Demo catalogue for a small kirana / general store in Pune. */
export const initialProducts: Product[] = [
{ id: 'atta', name: 'Aashirvaad Atta 5kg', category: 'Staples', price: 285, cost: 246, stock: 38, leadTimeDays: 3, supplier: 'Pune Agro Distributors', baseDailyDemand: 6 },
{ id: 'oil', name: 'Fortune Sunflower Oil 1L', category: 'Edible Oil', price: 165, cost: 141, stock: 0, leadTimeDays: 4, supplier: 'Wilmar Stockist, Hadapsar', baseDailyDemand: 8 },
{ id: 'butter', name: 'Amul Butter 500g', category: 'Dairy', price: 285, cost: 256, stock: 7, leadTimeDays: 2, supplier: 'Amul Dairy Supply', baseDailyDemand: 4 },
{ id: 'salt', name: 'Tata Salt 1kg', category: 'Staples', price: 28, cost: 22, stock: 220, leadTimeDays: 3, supplier: 'Pune Agro Distributors', baseDailyDemand: 10 },
{ id: 'rice', name: 'India Gate Basmati 5kg', category: 'Staples', price: 690, cost: 585, stock: 72, leadTimeDays: 5, supplier: 'KRBL Wholesale', baseDailyDemand: 2.5 },
{ id: 'dal', name: 'Toor Dal 1kg', category: 'Staples', price: 165, cost: 136, stock: 60, leadTimeDays: 4, supplier: 'Market Yard Traders', baseDailyDemand: 5 },
{ id: 'maggi', name: 'Maggi Noodles 12-pack', category: 'Snacks', price: 168, cost: 139, stock: 24, leadTimeDays: 3, supplier: 'Nestlé Distributor', baseDailyDemand: 4 },
{ id: 'parle', name: 'Parle-G Biscuits 10-pack', category: 'Snacks', price: 100, cost: 83, stock: 150, leadTimeDays: 3, supplier: 'Parle Agencies', baseDailyDemand: 7 },
{ id: 'tea', name: 'Tata Tea Gold 500g', category: 'Beverages', price: 310, cost: 258, stock: 45, leadTimeDays: 4, supplier: 'Tata Consumer Stockist', baseDailyDemand: 3 },
{ id: 'surf', name: 'Surf Excel Easy Wash 1kg', category: 'Household', price: 145, cost: 116, stock: 70, leadTimeDays: 5, supplier: 'HUL Distributor', baseDailyDemand: 4 },
{ id: 'colgate', name: 'Colgate Strong Teeth 200g', category: 'Personal Care', price: 120, cost: 94, stock: 40, leadTimeDays: 5, supplier: 'Colgate Stockist', baseDailyDemand: 3 },
{ id: 'bhujia', name: "Haldiram's Bhujia 400g", category: 'Snacks', price: 110, cost: 82, stock: 110, leadTimeDays: 6, supplier: "Haldiram's Agency", baseDailyDemand: 1.5 }];
