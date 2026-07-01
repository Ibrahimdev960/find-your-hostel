'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  createHostel,
  updateHostel,
  replaceSeatTypes,
  setHostelFacilities,
  hostelBasicsSchema,
  roomsSchema,
  hostelKeys,
  useFacilities,
  useHostelImages,
  useAddHostelImage,
  useRemoveHostelImage,
  useSetCoverImage,
  useSubmitHostel,
  type SeatTypeInput,
  type HostelWithRelations,
} from '@findyourhostel/shared/features/owner';
import { parseZodErrors, toast } from '@findyourhostel/shared';
import { uploadPublicImage } from '@/lib/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, Select } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeatTypeEditor, emptySeatType } from './SeatTypeEditor';

const STEPS = ['Basics', 'Rooms & Seats', 'Facilities & Rules', 'Pricing', 'Media'];

export function HostelWizard({
  ownerId,
  hostel,
}: {
  ownerId: string;
  hostel?: HostelWithRelations;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const facilities = useFacilities();
  const submitHostel = useSubmitHostel();

  const [hostelId, setHostelId] = useState<string | undefined>(hostel?.id);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [basics, setBasics] = useState({
    name: hostel?.name ?? '',
    hostel_type: (hostel?.hostel_type ?? 'boys') as 'boys' | 'girls' | 'co_living',
    nearest_institution: hostel?.nearest_institution ?? '',
    address: hostel?.address ?? '',
    city: hostel?.city ?? '',
    description: hostel?.description ?? '',
  });
  const [seats, setSeats] = useState<SeatTypeInput[]>(
    hostel?.seat_types?.length
      ? hostel.seat_types.map((s) => ({
          occupancy: s.occupancy,
          monthly_rent: Number(s.monthly_rent),
          total_seats: s.total_seats,
          is_ac: s.is_ac,
          attached_bath: s.attached_bath,
          discount_percent: Number(s.discount_percent),
        }))
      : [emptySeatType()]
  );
  const [rules, setRules] = useState({
    house_rules: hostel?.house_rules ?? '',
    curfew: hostel?.curfew ?? '',
    meal_plan: hostel?.meal_plan ?? '',
  });
  const [facilityIds, setFacilityIds] = useState<string[]>(
    hostel?.hostel_facilities?.map((f) => f.facility_id) ?? []
  );
  const [deposit, setDeposit] = useState<number>(Number(hostel?.security_deposit_months ?? 1));

  function validateStep(): boolean {
    setErrors({});
    if (step === 1) {
      const r = hostelBasicsSchema.safeParse({ ...basics });
      if (!r.success) return setErrors(parseZodErrors(r.error)), false;
    }
    if (step === 2) {
      const r = roomsSchema.safeParse({ seat_types: seats });
      if (!r.success) return setErrors(parseZodErrors(r.error)), false;
    }
    return true;
  }

  /** Create-or-update the hostel row + replace seat types & facilities. Returns the id. */
  async function persistDraft(): Promise<string> {
    const details = {
      name: basics.name,
      hostel_type: basics.hostel_type,
      nearest_institution: basics.nearest_institution || null,
      address: basics.address,
      city: basics.city,
      description: basics.description || null,
      house_rules: rules.house_rules || null,
      curfew: rules.curfew || null,
      meal_plan: rules.meal_plan || null,
      security_deposit_months: deposit,
    };

    let id = hostelId;
    if (id) {
      await updateHostel(id, details);
    } else {
      const created = await createHostel({ ...details, owner_id: ownerId, status: 'draft' });
      id = created.id;
      setHostelId(id);
    }
    await replaceSeatTypes(id, seats);
    await setHostelFacilities(id, facilityIds);

    void qc.invalidateQueries({ queryKey: hostelKeys.ownerList(ownerId) });
    void qc.invalidateQueries({ queryKey: hostelKeys.detail(id) });
    return id;
  }

  async function onContinue() {
    if (!validateStep()) return;
    // Persist when leaving Pricing (step 4) so the Media step has a hostel id.
    if (step === 4 && !hostelId) {
      setSaving(true);
      try {
        await persistDraft();
      } catch (e) {
        toast.error((e as Error).message);
        setSaving(false);
        return;
      }
      setSaving(false);
    }
    setStep((s) => Math.min(5, s + 1));
  }

  async function finish(submit: boolean) {
    setSaving(true);
    try {
      const id = await persistDraft();
      if (submit) await submitHostel.mutateAsync(id);
      else toast.success('Draft saved');
      router.push('/owner');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{hostel ? 'Edit hostel' : 'List your hostel'}</CardTitle>
        <ol className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={
                i + 1 === step
                  ? 'font-semibold text-primary'
                  : i + 1 < step
                    ? 'text-success'
                    : 'text-foreground-muted'
              }
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <Field label="Hostel name" error={errors.name}>
              <Input value={basics.name} onChange={(e) => setBasics({ ...basics, name: e.target.value })} />
            </Field>
            <Field label="Category" error={errors.hostel_type}>
              <Select
                value={basics.hostel_type}
                onChange={(e) =>
                  setBasics({ ...basics, hostel_type: e.target.value as typeof basics.hostel_type })
                }
              >
                <option value="boys">Boys</option>
                <option value="girls">Girls</option>
                <option value="co_living">Co-living / Family</option>
              </Select>
            </Field>
            <Field label="Nearest institution" error={errors.nearest_institution}>
              <Input
                value={basics.nearest_institution}
                onChange={(e) => setBasics({ ...basics, nearest_institution: e.target.value })}
              />
            </Field>
            <Field label="Address" error={errors.address}>
              <Input value={basics.address} onChange={(e) => setBasics({ ...basics, address: e.target.value })} />
            </Field>
            <Field label="City" error={errors.city}>
              <Input value={basics.city} onChange={(e) => setBasics({ ...basics, city: e.target.value })} />
            </Field>
            <Field label="Description" error={errors.description}>
              <Textarea
                value={basics.description}
                onChange={(e) => setBasics({ ...basics, description: e.target.value })}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <SeatTypeEditor rows={seats} onChange={setSeats} error={errors.seat_types} />
        )}

        {step === 3 && (
          <>
            <div>
              <span className="mb-2 block text-sm font-medium text-foreground-secondary">Facilities</span>
              {facilities.isLoading ? (
                <p className="text-sm text-foreground-muted">Loading…</p>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                  {facilities.data?.map((f) => (
                    <label key={f.id} className="flex items-center gap-2 text-sm text-foreground-secondary">
                      <input
                        type="checkbox"
                        checked={facilityIds.includes(f.id)}
                        onChange={(e) =>
                          setFacilityIds((ids) =>
                            e.target.checked ? [...ids, f.id] : ids.filter((x) => x !== f.id)
                          )
                        }
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Field label="House rules">
              <Textarea value={rules.house_rules} onChange={(e) => setRules({ ...rules, house_rules: e.target.value })} />
            </Field>
            <Field label="Curfew / timings">
              <Input value={rules.curfew} onChange={(e) => setRules({ ...rules, curfew: e.target.value })} />
            </Field>
            <Field label="Meal plan">
              <Input value={rules.meal_plan} onChange={(e) => setRules({ ...rules, meal_plan: e.target.value })} />
            </Field>
          </>
        )}

        {step === 4 && (
          <Field label="Security deposit (months of rent, refundable)" hint="Default 1 month">
            <Input
              type="number"
              min={0}
              max={6}
              value={deposit}
              onChange={(e) => setDeposit(Number(e.target.value))}
            />
          </Field>
        )}

        {step === 5 && hostelId && <MediaStep ownerId={ownerId} hostelId={hostelId} />}

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || saving}>
            Back
          </Button>
          {step < 5 ? (
            <Button onClick={onContinue} disabled={saving}>
              {saving ? 'Saving…' : 'Continue'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => finish(false)} disabled={saving}>
                Save draft
              </Button>
              <Button onClick={() => finish(true)} disabled={saving}>
                {saving ? 'Submitting…' : 'Submit for review'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MediaStep({ ownerId, hostelId }: { ownerId: string; hostelId: string }) {
  const images = useHostelImages(hostelId);
  const addImage = useAddHostelImage(hostelId);
  const removeImage = useRemoveHostelImage(hostelId);
  const setCover = useSetCoverImage(hostelId);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPublicImage('hostel-images', ownerId, 'gallery', file);
      await addImage.mutateAsync({ url, isCover: (images.data?.length ?? 0) === 0 });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-border px-4 py-3 text-sm text-foreground-secondary">
        {uploading ? 'Uploading…' : 'Add photo'}
        <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.data?.map((img) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-border">
            <Image
              src={img.url}
              alt=""
              width={200}
              height={140}
              className="h-28 w-full object-cover"
              unoptimized
            />
            <button
              type="button"
              onClick={() => removeImage.mutate(img.id)}
              className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white"
              aria-label="Remove photo"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setCover.mutate({ imageId: img.id, url: img.url })}
              className="absolute bottom-0 w-full bg-black/50 py-1 text-center text-xs text-white"
            >
              {img.is_cover ? '★ Cover' : 'Set as cover'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
