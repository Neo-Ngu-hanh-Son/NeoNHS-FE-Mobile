export type CheckinGalleryImage = {
  id: string;
  imageUrl: string;
  caption?: string | null;
  takenAt: string;
  destinationId?: string | null;
  destinationName?: string | null;
  parentPointId?: string | null;
  parentPointName?: string | null;
  checkinPointId: string;
  checkinPointName?: string | null;
};

// Proposed backend response contract for profile check-in gallery listing.
export type UserCheckinGalleryResponse = {
  items: CheckinGalleryImage[];
};
