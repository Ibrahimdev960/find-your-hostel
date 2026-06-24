'use client';

import { useState } from 'react';
import {
  useAdminReviews,
  useSetReviewHidden,
  useAdminPosts,
  useDeletePost,
} from '@findyourhostel/shared/hooks';
import { formatDate } from '@findyourhostel/shared';
import { Button } from '@/components/ui/button';

type Tab = 'reviews' | 'posts';

/** Admin · Content moderation (M13) — hide reviews, delete community posts. */
export default function ContentPage() {
  const [tab, setTab] = useState<Tab>('reviews');

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Content moderation</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Hide abusive reviews (drops them from ratings) and remove community posts.
        </p>
      </div>

      <div className="flex gap-2">
        {(['reviews', 'posts'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? 'bg-brand-600 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'reviews' ? <ReviewsPanel /> : <PostsPanel />}
    </main>
  );
}

function ReviewsPanel() {
  const reviews = useAdminReviews();
  const setHidden = useSetReviewHidden();

  if (reviews.isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (!reviews.data?.length)
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
        No reviews yet.
      </div>
    );

  return (
    <div className="space-y-3">
      {reviews.data.map((r) => (
        <div
          key={r.id}
          className={`rounded-xl border p-4 ${
            r.is_hidden ? 'border-danger/20 bg-danger/5' : 'border-neutral-200 bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{r.rating_overall}★</span>
                <span className="text-sm text-neutral-500">
                  {r.reviewer_name || 'Anonymous'} · {formatDate(r.created_at)}
                </span>
                {r.is_hidden && (
                  <span className="rounded bg-danger/10 px-1.5 py-0.5 text-xs font-medium text-danger">
                    Hidden
                  </span>
                )}
              </div>
              {r.comment && <p className="mt-1 text-sm text-neutral-700">{r.comment}</p>}
              {r.owner_response && (
                <p className="mt-1 text-sm text-neutral-500">↳ Owner: {r.owner_response}</p>
              )}
            </div>
            <Button
              size="sm"
              variant={r.is_hidden ? 'outline' : 'destructive'}
              disabled={setHidden.isPending}
              onClick={() => setHidden.mutate({ reviewId: r.id, hidden: !r.is_hidden })}
            >
              {r.is_hidden ? 'Restore' : 'Hide'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function PostsPanel() {
  const posts = useAdminPosts();
  const remove = useDeletePost();

  if (posts.isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (!posts.data?.length)
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
        No community posts yet.
      </div>
    );

  return (
    <div className="space-y-3">
      {posts.data.map((p) => (
        <div key={p.id} className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                  {p.topic}
                </span>
                <span className="truncate font-medium text-neutral-900">{p.title}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.body}</p>
              <p className="mt-1 text-xs text-neutral-400">
                {p.is_anonymous ? 'Anonymous' : p.author_name || 'Unknown'} ·{' '}
                {formatDate(p.created_at)} · {p.like_count} likes · {p.reply_count} replies
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm('Delete this post? This cannot be undone.')) remove.mutate(p.id);
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
