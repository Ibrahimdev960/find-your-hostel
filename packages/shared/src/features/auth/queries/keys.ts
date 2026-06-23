import { queryRoots } from '../../../lib/queryKeys';

export const authKeys = {
  profile: (userId: string) => [queryRoots.profile, userId] as const,
  ownerProfile: (ownerId: string) => [queryRoots.profile, 'owner', ownerId] as const,
};
