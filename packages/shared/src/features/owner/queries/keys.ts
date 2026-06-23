import { queryRoots } from '../../../lib/queryKeys';

export const hostelKeys = {
  all: [queryRoots.hostels] as const,
  ownerList: (ownerId: string) => [queryRoots.hostels, 'owner', ownerId] as const,
  detail: (id: string) => [queryRoots.hostels, 'detail', id] as const,
  pending: () => [queryRoots.hostels, 'admin', 'pending'] as const,
};

export const facilityKeys = {
  all: ['facilities'] as const,
};
