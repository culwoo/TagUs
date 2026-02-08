import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Location {
  name: string;
  station: string;
  boxNumber: string;
}

interface LocationStore {
  location: Location;
  setLocation: (location: Location) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    set => ({
      location: {
        name: '현재위치',
        station: '서울역 4호선',
        boxNumber: '분실물 보관함 230번',
      },
      setLocation: location => set({ location }),
    }),
    {
      name: 'tagus-location-storage',
    }
  )
);
