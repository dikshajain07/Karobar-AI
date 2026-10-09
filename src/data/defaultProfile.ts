import { BusinessCategory, MerchantProfile } from '../types/profile';

export const defaultProfile: MerchantProfile = {
  merchantName: 'Rakesh Sharma',
  avatarInitials: '',
  avatarUrl: '',
  shopName: 'Sharma General Store',
  category: 'General Store',
  phone: '9822001234',
  email: 'rakesh@sharmastore.in',
  address: 'Shop 4, Karve Road, Kothrud, Pune 411038',
  currency: 'INR'
};

export const businessCategories: BusinessCategory[] = ['Grocery', 'Clothing', 'Electronics', 'Pharmacy', 'General Store', 'Other'];

export const currencyOptions = [
{ value: 'INR', label: 'Indian Rupee (₹)', available: true },
{ value: 'USD', label: 'US Dollar ($)', available: false },
{ value: 'AED', label: 'UAE Dirham (د.إ)', available: false }];