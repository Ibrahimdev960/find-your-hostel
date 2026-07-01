'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageSquare, Users } from 'lucide-react';
import { useCommunityPosts, useCreatePost, useTogglePostLike } from '@findyourhostel/shared/hooks';
import { createPostSchema } from '@findyourhostel/shared/api';
import { useAuthStore, parseZodErrors, formatDate } from '@findyourhostel/shared';
import type { CommunityTopic } from '@findyourhostel/shared';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageHeader } from '@/components/layout/PageHeader';
import { FilterTabs, type FilterTab } from '@/components/layout/FilterTabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { PanelSection } from '@/components/ui/panel';
import { Switch } from '@/components/ui/switch';
import { Field, Select } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/cn';

const TOPICS: FilterTab<CommunityTopic | 'all'>[] = [
  { value: 'all', label: 'All' },
  { value: 'general', label: 'General' },
  { value: 'area', label: 'Area' },
  { value: 'budget', label: 'Budget' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'food', label: 'Food' },
  { value: 'safety', label: 'Safety' },
];

export default function CommunityPage() {
  const { user, isLoading } = useRequireAuth();
  const userId = useAuthStore((s) => s.user?.id) ?? '';
  const [topic, setTopic] = useState<CommunityTopic | 'all'>('all');
  const posts = useCommunityPosts(topic === 'all' ? undefined : topic);
  const like = useTogglePostLike(userId);
  const [composing, setComposing] = useState(false);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Community"
        subtitle="Ask and answer questions about areas, budgets, food, and safety."
        actionLabel={composing ? 'Close' : 'Ask a question'}
        onAction={() => setComposing((v) => !v)}
      >
        <FilterTabs tabs={TOPICS} value={topic} onChange={setTopic} />
      </PageHeader>

      {composing && <CreatePostForm onDone={() => setComposing(false)} />}

      {isLoading || !user || posts.isLoading ? (
        <SkeletonList count={4} />
      ) : posts.data?.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No posts here yet"
          description="Be the first to start the conversation on this topic."
          action={<Button onClick={() => setComposing(true)}>Ask a question</Button>}
        />
      ) : (
        <div className="space-y-3">
          {posts.data?.map((p) => {
            const liked = p.post_likes.length > 0;
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Badge tone="primary" className="capitalize">
                    {p.topic}
                  </Badge>
                  <span>{p.is_anonymous ? 'Anonymous' : (p.author_name ?? 'User')}</span>
                  <span>· {formatDate(p.created_at)}</span>
                </div>
                <Link href={`/community/${p.id}`}>
                  <h2 className="mt-2 font-semibold text-foreground hover:text-primary">{p.title}</h2>
                  <p className="mt-0.5 line-clamp-2 text-sm text-foreground-muted">{p.body}</p>
                </Link>
                <div className="mt-3 flex items-center gap-4 text-sm text-foreground-muted">
                  <button
                    type="button"
                    onClick={() => like.mutate({ postId: p.id, liked: !liked })}
                    className={cn('inline-flex items-center gap-1 transition hover:text-error', liked && 'text-error')}
                  >
                    <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} /> {p.like_count}
                  </button>
                  <Link href={`/community/${p.id}`} className="inline-flex items-center gap-1 hover:text-foreground">
                    <MessageSquare className="h-4 w-4" /> {p.reply_count}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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
    <PanelSection title="Ask a question">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="flex items-center justify-between gap-2 sm:mt-7">
            <span className="text-sm text-foreground-secondary">Post anonymously</span>
            <Switch
              checked={form.is_anonymous}
              onCheckedChange={(v) => setForm((f) => ({ ...f, is_anonymous: v }))}
              aria-label="Post anonymously"
            />
          </div>
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
        <div className="flex justify-end">
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post question'}
          </Button>
        </div>
      </form>
    </PanelSection>
  );
}
