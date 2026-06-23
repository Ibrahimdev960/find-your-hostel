'use client';

import Link from 'next/link';
import { useAuthStore } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/notifications/NotificationBell';

/** Auth-aware header actions for the landing page. */
export function HomeNav() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div className="h-10" />;

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          {user.role === 'owner' && (
            <Button asChild variant="outline" size="sm">
              <Link href="/owner">Owner dashboard</Link>
            </Button>
          )}
          {user.role === 'student' && (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/requests">Requests</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/saved">Saved</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/bookings">My bookings</Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href="/community">Community</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/messages">Messages</Link>
          </Button>
          <NotificationBell />
          <Button asChild size="sm">
            <Link href="/profile">Profile</Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Get started</Link>
          </Button>
        </>
      )}
    </div>
  );
}
