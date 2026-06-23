'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@findyourhostel/shared';
import { useStartConversation } from '@findyourhostel/shared/hooks';
import { Button } from '@/components/ui/button';

/** Starts (or reuses) a conversation with a hostel's owner, then opens the thread. */
export function MessageOwnerButton({ ownerId, hostelId }: { ownerId: string; hostelId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const start = useStartConversation();

  // Hide for guests and for the owner viewing their own listing.
  if (!user || user.id === ownerId) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={start.isPending}
      onClick={() =>
        start.mutate(
          { otherId: ownerId, hostelId },
          { onSuccess: (conversationId) => router.push(`/messages/${conversationId}`) }
        )
      }
    >
      <MessageCircle className="h-4 w-4" /> Message owner
    </Button>
  );
}
