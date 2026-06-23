import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addHostelImage, listHostelImages, removeHostelImage, setCoverImage } from '../api/imagesApi';
import { listFacilities, setHostelFacilities } from '../api/facilitiesApi';
import { facilityKeys, hostelKeys } from '../queries/keys';
import { STALE_TIME } from '../../../config/timing';
import { toast } from '../../../lib/toast';

export function useHostelImages(hostelId: string | undefined) {
  return useQuery({
    queryKey: hostelId ? [...hostelKeys.detail(hostelId), 'images'] : ['images', 'none'],
    queryFn: () => listHostelImages(hostelId as string),
    enabled: Boolean(hostelId),
    staleTime: STALE_TIME.short,
  });
}

export function useAddHostelImage(hostelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ url, isCover }: { url: string; isCover?: boolean }) =>
      addHostelImage(hostelId, url, isCover),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.detail(hostelId) }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveHostelImage(hostelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => removeHostelImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.detail(hostelId) }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSetCoverImage(hostelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ imageId, url }: { imageId: string; url: string }) =>
      setCoverImage(hostelId, imageId, url),
    onSuccess: () => {
      toast.success('Cover updated');
      void qc.invalidateQueries({ queryKey: hostelKeys.detail(hostelId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** The amenity catalog (cached long — rarely changes). */
export function useFacilities() {
  return useQuery({
    queryKey: facilityKeys.all,
    queryFn: () => listFacilities(),
    staleTime: STALE_TIME.long,
  });
}

export function useSetHostelFacilities(hostelId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (facilityIds: string[]) => setHostelFacilities(hostelId, facilityIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: hostelKeys.detail(hostelId) }),
    onError: (e: Error) => toast.error(e.message),
  });
}
