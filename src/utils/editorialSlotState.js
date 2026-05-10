const METADATA_FIELDS = ['alt', 'caption', 'sectionTitle', 'sectionId'];

const pickMetadataFields = (slot = {}) => Object.fromEntries(
  METADATA_FIELDS
    .map((field) => [field, typeof slot?.[field] === 'string' ? slot[field] : ''])
    .filter(([, value]) => value)
);

export const stripSlotSourceFields = (slot = {}) => {
  const metadata = pickMetadataFields(slot);
  return Object.keys(metadata).length ? metadata : null;
};

export const createCloudinarySlotState = (existingSlot = {}, info = {}, uploadedAt = new Date().toISOString()) => ({
  ...pickMetadataFields(existingSlot),
  publicId: info.public_id,
  secureUrl: info.secure_url,
  source: 'cloudinary',
  originalFilename: info.original_filename || '',
  uploadedAt,
});

export const createExternalSlotState = (existingSlot = {}, image = {}, uploadedAt = new Date().toISOString()) => ({
  ...pickMetadataFields(existingSlot),
  src: image.src,
  source: image.source || 'remote',
  unsplashPhotoId: image.unsplashPhotoId || '',
  pageUrl: image.pageUrl || '',
  originalUrl: image.originalUrl || image.src,
  uploadedAt,
});
