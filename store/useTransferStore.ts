import { create } from 'zustand';

export type TransferDirection = 'sending' | 'receiving';
export type TransferStatus = 'active' | 'done';

export interface TransferItem {
  id: string;
  name: string;
  size: number;
  direction: TransferDirection;
  progress: number;
  status: TransferStatus;
}

interface TransferStore {
  sendProgress: number;
  items: TransferItem[];
  setSendProgress: (progress: number) => void;
  upsertTransfer: (item: TransferItem) => void;
  updateTransferProgress: (id: string, progress: number) => void;
  markTransferDone: (id: string) => void;
  clearAll: () => void;
}

export const useTransferStore = create<TransferStore>((set) => ({
  sendProgress: 0,
  items: [],

  setSendProgress: (progress) => set({ sendProgress: progress }),

  upsertTransfer: (item) =>
    set((state) => {
      const index = state.items.findIndex((x) => x.id === item.id);
      if (index === -1) return { items: [item, ...state.items] };
      const next = [...state.items];
      next[index] = item;
      return { items: next };
    }),

  updateTransferProgress: (id, progress) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, progress } : item)),
    })),

  markTransferDone: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, progress: 100, status: 'done' } : item,
      ),
    })),

  clearAll: () => set({ sendProgress: 0, items: [] }),
}));
