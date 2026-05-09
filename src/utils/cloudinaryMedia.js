const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dwukfmgrd';

/**
 * IDs de vídeo mapeados conforme CLOUDINARY-PROJETOS-PORTFOLIO-MAP-2026-04-08.md
 * 
 * PROVA REAL:
 * ID: qjhkakyvjjesxqxijkah -> videohorizontal60segundos.mp4 (Nativo Horizontal)
 * ID: h6zftberxzqzf4mqpyyr -> videovertical30segundos.mp4 (Nativo Vertical)
 */
const HERO_VIDEO_HORIZONTAL_ID = 'qjhkakyvjjesxqxijkah';
const HERO_VIDEO_VERTICAL_ID = 'h6zftberxzqzf4mqpyyr';
const HERO_VIDEO_HORIZONTAL_VERSION = 'v1775539053';
const HERO_VIDEO_VERTICAL_VERSION = 'v1775539058';

const HERO_VIDEO_BASE_TRANSFORMS = [
  'f_auto',
  'q_auto:good',
  'vc_auto',
  'so_0',
];

const HERO_VIEWPORT_BREAKPOINTS = {
  phoneMax: 767,
  tabletMax: 1199,
};

const normalizeViewport = ({ width = 0, height = 0 } = {}) => {
  const safeWidth = Number.isFinite(width) ? width : 0;
  const safeHeight = Number.isFinite(height) ? height : 0;

  return {
    width: Math.max(0, Math.round(safeWidth)),
    height: Math.max(0, Math.round(safeHeight)),
  };
};

const joinTransformations = (transformations = []) =>
  transformations.filter(Boolean).join('/');

export const buildCloudinaryImageUrl = (publicId, transformations = []) => {
  const parts = joinTransformations(transformations);
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${parts}/${publicId}`;
};

export const buildCloudinaryVideoUrl = (publicId, transformations = [], version = '') => {
  const parts = joinTransformations(transformations);
  const versionPart = version ? `${version}/` : '';
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${parts}/${versionPart}${publicId}`;
};

const buildHeroVideoProfile = (publicId, version, transformations = []) => {
  // Garantir que c_fill, ar e g_center estejam no mesmo segmento para Cloudinary respeitar o crop
  const combined = ['c_fill', 'g_center', ...transformations].join(',');
  return buildCloudinaryVideoUrl(publicId, [
    ...HERO_VIDEO_BASE_TRANSFORMS,
    combined
  ], version);
};

const HERO_CLOUDINARY_VIDEO_PROFILES = {
  phonePortrait: buildHeroVideoProfile(HERO_VIDEO_VERTICAL_ID, HERO_VIDEO_VERTICAL_VERSION, ['ar_9:16', 'w_720', 'h_1280']),
  phoneLandscape: buildHeroVideoProfile(HERO_VIDEO_HORIZONTAL_ID, HERO_VIDEO_HORIZONTAL_VERSION, ['ar_16:9', 'w_1280', 'h_720']),
  tabletPortrait: buildHeroVideoProfile(HERO_VIDEO_VERTICAL_ID, HERO_VIDEO_VERTICAL_VERSION, ['ar_3:4', 'w_1080', 'h_1440']),
  tabletLandscape: buildHeroVideoProfile(HERO_VIDEO_HORIZONTAL_ID, HERO_VIDEO_HORIZONTAL_VERSION, ['ar_16:9', 'w_1600', 'h_900']),
  desktopPortrait: buildHeroVideoProfile(HERO_VIDEO_VERTICAL_ID, HERO_VIDEO_VERTICAL_VERSION, ['ar_4:5', 'w_1440', 'h_1800']),
  desktopLandscape: buildHeroVideoProfile(HERO_VIDEO_HORIZONTAL_ID, HERO_VIDEO_HORIZONTAL_VERSION, ['ar_16:9', 'w_1920']),
};

export const HERO_MEDIA = {
  poster: '/images/hero-poster-1280.webp',
  profiles: HERO_CLOUDINARY_VIDEO_PROFILES,
  fallbackProfiles: HERO_CLOUDINARY_VIDEO_PROFILES,
};

HERO_MEDIA.mobile = HERO_MEDIA.profiles.phonePortrait;
HERO_MEDIA.desktop = HERO_MEDIA.profiles.desktopLandscape;

export const getHeroVideoProfile = ({ width = 0, height = 0 } = {}) => {
  const { width: safeWidth, height: safeHeight } = normalizeViewport({ width, height });
  
  // REGRA ABSOLUTA: Se for Desktop (>= 1024px) ou se for modo Paisagem real em tablet/monitor, FORÇA landscape.
  if (safeWidth >= 1024 || (safeWidth > safeHeight && safeWidth > 640)) {
    return 'desktopLandscape';
  }

  // Portrait mode (Celulares e Tablets em pé)
  if (safeWidth <= HERO_VIEWPORT_BREAKPOINTS.phoneMax) {
    return 'phonePortrait';
  }

  // Tablets em pé ou telas quadradas menores
  return 'tabletPortrait';
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
