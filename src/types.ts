// Type definitions for shop data
export type Status = "休"|"完売"|"○"|"△";
export type Store = "赤坂本店"|"赤坂見附店"|"サカス店"|"溜池店"|"弁慶橋店";

export type StoreAvailability = Record<Store, Status>;

export interface DayAvailability {
  date: string;
  stores: StoreAvailability;
}

export interface AvailabilityRow {
  timestamp: string;
  date: string;
  stores: StoreAvailability;
}

export const SHOP_NAMES: Store[] = [
  '赤坂本店',
  '赤坂見附店', 
  'サカス店',
  '溜池店',
  '弁慶橋店',
] as const;
