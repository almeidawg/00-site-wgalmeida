const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwukfmgrd';
const HERO_VIDEO_PUBLIC_ID = 'h6zftberxzqzf4mqpyyr';
const HERO_VIDEO_BASE_TRANSFORMS = [
  'f_auto',
  'q_auto:good',
  'vc_auto',
  'so_0',
  'c_fill',
  'g_auto',
];

const HERO_VIEWPORT_BREAKPOINTS = {
  phoneMax: 767,
  tabletMax: 1199,
};

const joinTransformations = (transformations = []) =>
  transformations.filter(Boolean).join('/');

export const buildCloudinaryImageUrl = (publicId, transformations = []) => {
  const parts = joinTransformations(transformations);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${parts}/${publicId}`;
};

export const buildCloudinaryVideoUrl = (publicId, transformations = []) => {
  const parts = joinTransformations(transformations);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${parts}/${publicId}`;
};

const buildHeroVideoProfile = (transformations = []) =>
  buildCloudinaryVideoUrl(HERO_VIDEO_PUBLIC_ID, [
    ...HERO_VIDEO_BASE_TRANSFORMS,
    ...transformations,
  ]);

const HERO_CLOUDINARY_VIDEO_PROFILES = {
  phonePortrait: buildHeroVideoProfile(['ar_9:16', 'w_720', 'h_1280']),
  phoneLandscape: buildHeroVideoProfile(['ar_16:9', 'w_1280']),
  tabletPortrait: buildHeroVideoProfile(['ar_3:4', 'w_1080', 'h_1440']),
  tabletLandscape: buildHeroVideoProfile(['ar_4:3', 'w_1600', 'h_1200']),
  desktopPortrait: buildHeroVideoProfile(['ar_4:5', 'w_1440', 'h_1800']),
  desktopLandscape: buildHeroVideoProfile(['ar_16:9', 'w_1920']),
};

export const HERO_MEDIA = {
  poster: '/images/hero-poster-1280.webp',
  profiles: HERO_CLOUDINARY_VIDEO_PROFILES,
  fallbackProfiles: HERO_CLOUDINARY_VIDEO_PROFILES,
};

HERO_MEDIA.mobile = HERO_MEDIA.profiles.phonePortrait;
HERO_MEDIA.desktop = HERO_MEDIA.profiles.desktopLandscape;

export const getHeroVideoProfile = ({ width = 0, height = 0 } = {}) => {
  const safeWidth = Number.isFinite(width) ? width : 0;
  const safeHeight = Number.isFinite(height) ? height : 0;
  const orientation = safeHeight > safeWidth ? 'portrait' : 'landscape';

  if (safeWidth <= HERO_VIEWPORT_BREAKPOINTS.phoneMax) {
    return orientation === 'portrait' ? 'phonePortrait' : 'phoneLandscape';
  }

  if (safeWidth <= HERO_VIEWPORT_BREAKPOINTS.tabletMax) {
    return orientation === 'portrait' ? 'tabletPortrait' : 'tabletLandscape';
  }

  return orientation === 'portrait' ? 'desktopPortrait' : 'desktopLandscape';
};

export const selectHeroVideoSrc = (viewport) => {
  const profile = getHeroVideoProfile(viewport);
  return HERO_MEDIA.profiles[profile] || HERO_MEDIA.fallbackProfiles[profile] || HERO_MEDIA.desktop;
};

export default {
  buildCloudinaryImageUrl,
  buildCloudinaryVideoUrl,
  HERO_MEDIA,
  getHeroVideoProfile,
  selectHeroVideoSrc,
};
