import { Customer } from '../types/data';

export const WALK_IN_ID = 'walk-in';

/** Demo regulars of the store, plus the shared walk-in account. */
export const seedCustomers: Customer[] = [
{ id: WALK_IN_ID, name: 'Walk-in customer' },
{ id: 'c01', name: 'Priya Deshmukh', phone: '9822014567' },
{ id: 'c02', name: 'Anil Kulkarni', phone: '9890123456' },
{ id: 'c03', name: 'Sneha Patil', phone: '9765432109' },
{ id: 'c04', name: 'Rahul Joshi', phone: '9823456781' },
{ id: 'c05', name: 'Meera Iyer', phone: '9876501234' },
{ id: 'c06', name: 'Farhan Shaikh', phone: '9970012345' },
{ id: 'c07', name: 'Kavita Rao', phone: '9860098765' },
{ id: 'c08', name: 'Suresh Pawar', phone: '9921134567' },
{ id: 'c09', name: 'Neha Gupta', phone: '9850045678' },
{ id: 'c10', name: 'Vikram Jadhav', phone: '9011223344' },
{ id: 'c11', name: 'Anjali Mehta', phone: '9158765432' },
{ id: 'c12', name: 'Rohan Bhosale', phone: '8007654321' },
{ id: 'c13', name: 'Fatima Khan', phone: '8888012345' },
{ id: 'c14', name: 'Deepak Shinde', phone: '7709123456' },
{ id: 'c15', name: 'Pooja Nair' }];