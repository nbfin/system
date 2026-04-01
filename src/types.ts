/**
 * 自然美報價系統 資料型別定義
 */

export type Channel = '電商' | '實體門市' | '美容院' | '百貨專櫃' | '其他';

export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  createdAt: number;
}

export interface Quotation {
  id: string;
  channel: Channel;
  date: string;
  partNumber: string;
  productName: string;
  moq: number;
  amount: number; // 含稅金額
  cost: number; // 成本
  authorUid: string; // 新增作者 UID
  createdAt: number;
}

export interface QuotationFilters {
  search: string;
  channel: string;
  startDate: string;
  endDate: string;
}

export type SortKey = keyof Omit<Quotation, 'id' | 'createdAt'>;
export type SortOrder = 'asc' | 'desc';
