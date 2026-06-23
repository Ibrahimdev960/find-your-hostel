'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare } from 'lucide-react';
import { useCommunityPosts, useCreatePost, useTogglePostLike } from '@findyourhostel/shared/hooks';
import { createPostSchema } from '@findyourhostel/shared/api';
import { useAuthStore, parseZodErrors, formatDate } from '@findyourhostel/shared';
import type { CommunityTopic } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

const TOPICS: (CommunityTopic | 'all')[] = ['all', 'general', 'area', 'budget', 'facilities', 'food', 'safety'];

export default function CommunityPage() {
  const { user, isLoading } = useRequireAuth();
  const userId = useAuthStore((s) => s.user?.id) ?? '';
  const [topic, setTopic] = useState<CommunityTopic | 'all'>('all');
  const posts = useCommunityPosts(topic === 'all' ? undefined : topic);
  const like = useTogglePostLike(userId);
  const [composing, setComposing] = useState(false);

  if (isLoading || !user) return <div className="p-10 text-sm text-neutral-500">Loading…</div>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Community</h1>
        <Button onClick={() => setComposing((v) => !v)}>{composing ? 'Close' : 'Ask a question'}</Button>
      </div>

      {composing && <CreatePostForm onDone={() => setComposing(false)} />}

      <div className="flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={cn(
              'rounded-full px-3 py-1 text-sm capitalize',
              topic === t ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-700'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {posts.isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : posts.data?.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-neutral-500">
            No posts here yet. Start the conversation!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.data?.map((p) => {
            const liked = p.post_likes.length > 0;
            return (
              <Card key={p.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 capitalize text-neutral-600">
                      {p.topic}
                    </span>
                    <span>{p.is_anonymous ? 'Anonymous' : p.author_name ?? 'User'}</span>
                    <span>· {formatDate(p.created_at)}</span>
                  </div>
                  <Link href={`/community/${p.id}`}>
                    <h2 className="mt-1 font-semibold text-neutral-900 hover:text-brand-700">{p.title}</h2>
                    <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">{p.body}</p>
                  </Link>
                  <div className="mt-2 flex items-center gap-4 text-sm text-neutral-500">
                    <button
                      type="button"
                      onClick={() => like.mutate({ postId: p.id, liked: !liked })}
                      className={cn('inline-flex items-center gap-1', liked && 'text-danger')}
                    >
                      <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {p.like_count}
                    </button>
                    <Link href={`/community/${p.id}`} className="inline-flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" /> {p.reply_count}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}

function CreatePostForm({ onDone }: { onDone: () => void }) {
  const create = useCreatePost();
  const [form, setForm] = useState({ topic: 'general', title: '', body: '', is_anonymous: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = createPostSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(parseZodErrors(parsed.error));
      return;
    }
    setErrors({});
    create.mutate(parsed.data, { onSuccess: onDone });
  };

  return (
    <Card>
      <CardContent className="py-4">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Topic" htmlFor="topic">
              <Select
                id="topic"
                value={form.topic}
                onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))}
              >
                {['general', 'area', 'budget', 'facilities', 'food', 'safety'].map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <label className="mt-6 flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={form.is_anonymous}
                onChange={(e) => setForm((f) => ({ ...f, is_anonymous: e.target.checked }))}
              />
              Post anonymously
            </label>
          </div>
          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Question" htmlFor="body" error={errors.body}>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            />
          </Field>
          <Button type="submit" size="sm" disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
