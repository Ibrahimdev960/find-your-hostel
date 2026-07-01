'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import {
  useCommunityPost,
  usePostReplies,
  useReplyToPost,
  useTogglePostLike,
} from '@findyourhostel/shared/hooks';
import { useAuthStore, formatDate } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, isLoading } = useRequireAuth();
  const userId = useAuthStore((s) => s.user?.id) ?? '';

  const post = useCommunityPost(id);
  const replies = usePostReplies(id);
  const reply = useReplyToPost(id);
  const like = useTogglePostLike(userId);

  const [body, setBody] = useState('');
  const [anon, setAnon] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    reply.mutate({ body: body.trim(), isAnonymous: anon }, { onSuccess: () => setBody('') });
  };

  if (isLoading || !user || post.isLoading) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Post" useBackNavigation backFallbackHref="/community" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!post.data) {
    return (
      <div className="space-y-4 pb-8">
        <PageHeader title="Post not found" useBackNavigation backFallbackHref="/community" />
        <Panel className="items-center px-6 py-12 text-center">
          <p className="text-sm text-foreground-muted">
            This post no longer exists.{' '}
            <Link href="/community" className="text-primary hover:underline">
              Back to community
            </Link>
          </p>
        </Panel>
      </div>
    );
  }

  const p = post.data;
  const liked = p.post_likes.length > 0;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title={p.title} useBackNavigation backFallbackHref="/community" />

      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs text-foreground-muted">
          <Badge tone="primary" className="capitalize">
            {p.topic}
          </Badge>
          <span>{p.is_anonymous ? 'Anonymous' : (p.author_name ?? 'User')}</span>
          <span>· {formatDate(p.created_at)}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-foreground-secondary">{p.body}</p>
        <button
          type="button"
          onClick={() => like.mutate({ postId: p.id, liked: !liked })}
          className={cn(
            'mt-4 inline-flex items-center gap-1 text-sm text-foreground-muted transition hover:text-error',
            liked && 'text-error'
          )}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {p.like_count}
        </button>
      </Panel>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-foreground">
          Replies {p.reply_count > 0 ? `(${p.reply_count})` : ''}
        </h2>

        <Panel className="mb-4 p-4 sm:p-5">
          <form onSubmit={submit} className="space-y-3">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your answer…"
              className="min-h-20"
            />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={anon} onCheckedChange={setAnon} aria-label="Reply anonymously" />
                <span className="text-sm text-foreground-secondary">Reply anonymously</span>
              </div>
              <Button type="submit" disabled={reply.isPending || !body.trim()}>
                Reply
              </Button>
            </div>
          </form>
        </Panel>

        {replies.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : replies.data?.length === 0 ? (
          <p className="text-sm text-foreground-muted">No replies yet — be the first.</p>
        ) : (
          <div className="space-y-3">
            {replies.data?.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <span>{r.is_anonymous ? 'Anonymous' : (r.author_name ?? 'User')}</span>
                  <span>· {formatDate(r.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground-secondary">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
