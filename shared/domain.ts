export type ItemStatus = 'safe' | 'lost' | 'found';

export interface ItemLocation {
  label: string;
  station: string;
  boxNumber: string;
  updatedAt: number;
}

export interface Item {
  id: number;
  name: string;
  image: string;
  storagePath?: string;
  location: ItemLocation;
  status: ItemStatus;
  createdAt: number;
  updatedAt: number;
}

export const createDefaultItemLocation = (timestamp = Date.now()): ItemLocation => ({
  label: '미지정',
  station: '',
  boxNumber: '',
  updatedAt: timestamp,
});

export const normalizeItem = (
  input: Partial<Item> & Pick<Item, 'id' | 'name' | 'image'>,
  fallbackLocation?: Partial<ItemLocation>
): Item => {
  const now = Date.now();
  const location: ItemLocation = {
    ...createDefaultItemLocation(input.updatedAt ?? now),
    ...(fallbackLocation ?? {}),
    ...(input.location ?? {}),
    updatedAt: input.location?.updatedAt ?? fallbackLocation?.updatedAt ?? input.updatedAt ?? now,
  };

  return {
    id: input.id,
    name: input.name,
    image: input.image,
    storagePath: input.storagePath,
    status: input.status ?? 'safe',
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    location,
  };
};
