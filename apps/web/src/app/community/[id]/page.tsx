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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (post.isLoading) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;
  if (!post.data) {
    return (
      <div className="p-10 text-center text-sm text-neutral-500">
        Post not found.{' '}
        <Link href="/community" className="text-brand-600 hover:underline">
          Community
        </Link>
      </div>
    );
  }

  const p = post.data;
  const liked = p.post_likes.length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    reply.mutate({ body: body.trim(), isAnonymous: anon }, { onSuccess: () => setBody('') });
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-8 space-y-6">
      <Link href="/community" className="text-sm text-brand-600 hover:underline">
        ← Community
      </Link>

      <div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="rounded bg-neutral-100 px-1.5 py-0.5 capitalize text-neutral-600">{p.topic}</span>
          <span>{p.is_anonymous ? 'Anonymous' : p.author_name ?? 'User'}</span>
          <span>· {formatDate(p.created_at)}</span>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-neutral-900">{p.title}</h1>
        <p className="mt-2 whitespace-pre-wrap text-neutral-700">{p.body}</p>
        <button
          type="button"
          onClick={() => like.mutate({ postId: p.id, liked: !liked })}
          className={cn('mt-3 inline-flex items-center gap-1 text-sm text-neutral-500', liked && 'text-danger')}
        >
          <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {p.like_count}
        </button>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-neutral-900">
          Replies {p.reply_count > 0 ? `(${p.reply_count})` : ''}
        </h2>

        <form onSubmit={submit} className="mb-4 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your answer…"
            className="min-h-16"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              Reply anonymously
            </label>
            <Button type="submit" size="sm" disabled={reply.isPending || !body.trim()}>
              Reply
            </Button>
          </div>
        </form>

        {replies.isLoading ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : replies.data?.length === 0 ? (
          <p className="text-sm text-neutral-500">No replies yet.</p>
        ) : (
          <div className="space-y-3">
            {replies.data?.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span>{r.is_anonymous ? 'Anonymous' : r.author_name ?? 'User'}</span>
                    <span>· {formatDate(r.created_at)}</span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{r.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
