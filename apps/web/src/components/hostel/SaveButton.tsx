'use client';

import { Bookmark } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { useSavedHostelIds, useToggleSaved } from '@findyourhostel/shared/hooks';
import { Button } from '@/components/ui/button';

/** Toggle a hostel in the signed-in user's private shortlist. */
export function SaveButton({ hostelId }: { hostelId: string }) {
  const user = useAuthStore((s) => s.user);
  const ids = useSavedHostelIds(user?.id);
  const toggle = useToggleSaved(user?.id ?? '');

  if (!user) return null;
  const saved = ids.data?.includes(hostelId) ?? false;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={toggle.isPending}
      onClick={() => toggle.mutate({ hostelId, saved: !saved })}
    >
      <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save'}
    </Button>
  );
}
