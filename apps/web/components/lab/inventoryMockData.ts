export interface InventoryItem {
  id: string;
  name: string;
  category: 'Reagent' | 'Supply' | 'Equipment';
  catalogId: string;
  batchNo: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  department?: string;
}

export interface InventoryAlert {
  id: string;
  name: string;
  subtitle: string;
  status: 'Out of Stock' | 'Low Stock' | 'Expiring Soon';
  badgeType: 'red' | 'amber' | 'orange';
}

export interface InventoryTransaction {
  id: string;
  dateTime: string;
  itemName: string;
  type: 'In' | 'Out';
  quantity: string;
  user: string;
  notes: string;
}

export interface StockLevelBar {
  name: string;
  percentage: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface ExpiryMonitorItem {
  id: string;
  name: string;
  expiryDate: string;
  daysLeft: number;
  status: 'Expiring Soon' | 'Normal';
}

export const INVENTORY_KPI_STATS = {
  totalReagents: { value: 52, change: '6%', trend: 'up' as const, label: 'vs. last month' },
  totalSupplies: { value: 138, change: '12%', trend: 'up' as const, label: 'vs. last month' },
  totalEquipment: { value: 12, change: '0%', trend: 'neutral' as const, label: 'vs. last month' },
  lowStockItems: { value: 8, change: '33%', trend: 'up' as const, label: 'vs. last month', isAlert: true },
  expiringSoon: { value: 14, change: '75%', trend: 'up' as const, label: 'vs. last month' },
};

export const EXACT_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: 'inv-001',
    name: 'CBC Reagent (Sysmex)',
    category: 'Reagent',
    catalogId: 'RGT-001',
    batchNo: 'B2026-001',
    quantity: 5,
    unit: 'L',
    expiryDate: 'Apr 15, 2027',
    status: 'In Stock',
    department: 'Hematology',
  },
  {
    id: 'inv-002',
    name: 'Glucose Test Strips',
    category: 'Reagent',
    catalogId: 'RGT-002',
    batchNo: 'B2026-012',
    quantity: 12,
    unit: 'Box',
    expiryDate: 'May 20, 2027',
    status: 'In Stock',
    department: 'Biochemistry',
  },
  {
    id: 'inv-003',
    name: 'Urine Cups',
    category: 'Supply',
    catalogId: 'SUP-001',
    batchNo: 'B2026-045',
    quantity: 8,
    unit: 'Pack',
    expiryDate: 'Dec 10, 2026',
    status: 'Low Stock',
    department: 'Microbiology',
  },
  {
    id: 'inv-004',
    name: 'Pipette Tips (200μL)',
    category: 'Supply',
    catalogId: 'SUP-002',
    batchNo: 'B2026-033',
    quantity: 0,
    unit: 'Pack',
    expiryDate: 'Nov 15, 2026',
    status: 'Out of Stock',
    department: 'General Lab',
  },
  {
    id: 'inv-005',
    name: 'Blood Collection Tubes',
    category: 'Supply',
    catalogId: 'SUP-003',
    batchNo: 'B2026-021',
    quantity: 45,
    unit: 'Pack',
    expiryDate: 'Jan 30, 2027',
    status: 'In Stock',
    department: 'Phlebotomy',
  },
  {
    id: 'inv-006',
    name: 'Microscope Slides',
    category: 'Supply',
    catalogId: 'SUP-004',
    batchNo: 'B2026-017',
    quantity: 20,
    unit: 'Box',
    expiryDate: 'Feb 18, 2027',
    status: 'In Stock',
    department: 'Microbiology',
  },
  {
    id: 'inv-007',
    name: 'TSH Reagent',
    category: 'Reagent',
    catalogId: 'RGT-003',
    batchNo: 'B2026-007',
    quantity: 3,
    unit: 'L',
    expiryDate: 'Mar 05, 2027',
    status: 'Low Stock',
    department: 'Immunology',
  },
  {
    id: 'inv-008',
    name: 'Hematology Control',
    category: 'Reagent',
    catalogId: 'RGT-004',
    batchNo: 'B2026-009',
    quantity: 0,
    unit: 'Vial',
    expiryDate: 'Dec 01, 2026',
    status: 'Out of Stock',
    department: 'Hematology',
  },
  {
    id: 'inv-009',
    name: 'Centrifuge Tubes',
    category: 'Supply',
    catalogId: 'SUP-005',
    batchNo: 'B2026-030',
    quantity: 25,
    unit: 'Pack',
    expiryDate: 'Apr 12, 2027',
    status: 'In Stock',
    department: 'General Lab',
  },
  {
    id: 'inv-010',
    name: 'Printer Paper (Labels)',
    category: 'Supply',
    catalogId: 'SUP-006',
    batchNo: 'B2026-040',
    quantity: 6,
    unit: 'Roll',
    expiryDate: 'Oct 28, 2027',
    status: 'In Stock',
    department: 'Reception / Labeling',
  },
];

export const INVENTORY_ALERTS: InventoryAlert[] = [
  {
    id: 'alt-1',
    name: 'Pipette Tips (200μL)',
    subtitle: 'Out of stock - Reorder needed',
    status: 'Out of Stock',
    badgeType: 'red',
  },
  {
    id: 'alt-2',
    name: 'Hematology Control',
    subtitle: 'Out of stock - Reorder needed',
    status: 'Out of Stock',
    badgeType: 'red',
  },
  {
    id: 'alt-3',
    name: 'Urine Cups',
    subtitle: 'Low stock (8 remaining)',
    status: 'Low Stock',
    badgeType: 'amber',
  },
  {
    id: 'alt-4',
    name: 'TSH Reagent',
    subtitle: 'Low stock (3 remaining)',
    status: 'Low Stock',
    badgeType: 'amber',
  },
  {
    id: 'alt-5',
    name: 'CBC Reagent (Sysmex)',
    subtitle: 'Expires in 5 days (Apr 15, 2027)',
    status: 'Expiring Soon',
    badgeType: 'orange',
  },
];

export const RECENT_TRANSACTIONS: InventoryTransaction[] = [
  {
    id: 'txn-1',
    dateTime: 'Oct 19, 2026 09:45 AM',
    itemName: 'CBC Reagent',
    type: 'In',
    quantity: '+5 L',
    user: 'Dawit T.',
    notes: 'New stock received',
  },
  {
    id: 'txn-2',
    dateTime: 'Oct 19, 2026 08:32 AM',
    itemName: 'Pipette Tips (200μL)',
    type: 'Out',
    quantity: '-10 Pack',
    user: 'Dawit T.',
    notes: 'Used in testing',
  },
  {
    id: 'txn-3',
    dateTime: 'Oct 18, 2026 04:15 PM',
    itemName: 'Urine Cups',
    type: 'Out',
    quantity: '-20 Pack',
    user: 'Lydia K.',
    notes: 'Sample collection',
  },
  {
    id: 'txn-4',
    dateTime: 'Oct 18, 2026 11:20 AM',
    itemName: 'Blood Collection Tubes',
    type: 'In',
    quantity: '+10 Pack',
    user: 'Dawit T.',
    notes: 'New stock received',
  },
  {
    id: 'txn-5',
    dateTime: 'Oct 17, 2026 02:45 PM',
    itemName: 'TSH Reagent',
    type: 'Out',
    quantity: '-2 L',
    user: 'Samuel G.',
    notes: 'Testing',
  },
];

export const STOCK_LEVELS: StockLevelBar[] = [
  { name: 'CBC Reagent', percentage: 80, status: 'in-stock' },
  { name: 'Glucose Strips', percentage: 65, status: 'in-stock' },
  { name: 'Urine Cups', percentage: 15, status: 'low-stock' },
  { name: 'Pipette Tips', percentage: 0, status: 'out-of-stock' },
  { name: 'Blood Tubes', percentage: 72, status: 'in-stock' },
];

export const EXPIRY_MONITOR_ITEMS: ExpiryMonitorItem[] = [
  {
    id: 'exp-1',
    name: 'Hematology Control',
    expiryDate: 'Dec 01, 2026',
    daysLeft: 43,
    status: 'Expiring Soon',
  },
  {
    id: 'exp-2',
    name: 'Urine Cups',
    expiryDate: 'Dec 10, 2026',
    daysLeft: 52,
    status: 'Expiring Soon',
  },
  {
    id: 'exp-3',
    name: 'TSH Reagent',
    expiryDate: 'Mar 05, 2027',
    daysLeft: 136,
    status: 'Normal',
  },
  {
    id: 'exp-4',
    name: 'CBC Reagent',
    expiryDate: 'Apr 15, 2027',
    daysLeft: 177,
    status: 'Normal',
  },
  {
    id: 'exp-5',
    name: 'Blood Collection Tubes',
    expiryDate: 'Jan 30, 2027',
    daysLeft: 113,
    status: 'Normal',
  },
];

