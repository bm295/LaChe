export interface MenuItem { id: string; name: string; price: number; }
export interface MenuRepository { findById(id: string): Promise<MenuItem | undefined>; }
