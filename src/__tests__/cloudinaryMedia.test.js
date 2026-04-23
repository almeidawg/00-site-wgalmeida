import { describe, expect, it } from 'vitest';

import { getHeroVideoProfile, selectHeroVideoSrc, HERO_MEDIA } from '@/utils/cloudinaryMedia';

describe('hero video media selection', () => {
  it('returns portrait profiles for narrow portrait viewports', () => {
    expect(getHeroVideoProfile({ width: 390, height: 844 })).toBe('phonePortrait');
    expect(getHeroVideoProfile({ width: 834, height: 1112 })).toBe('tabletPortrait');
    expect(getHeroVideoProfile({ width: 1200, height: 1600 })).toBe('desktopPortrait');
  });

  it('returns landscape profiles for wide landscape viewports', () => {
    expect(getHeroVideoProfile({ width: 844, height: 390 })).toBe('tabletLandscape');
    expect(getHeroVideoProfile({ width: 1440, height: 900 })).toBe('desktopLandscape');
  });

  it('maps the selected profile to the expected video url', () => {
    expect(selectHeroVideoSrc({ width: 390, height: 844 })).toBe(HERO_MEDIA.profiles.phonePortrait);
    expect(selectHeroVideoSrc({ width: 1366, height: 768 })).toBe(HERO_MEDIA.profiles.desktopLandscape);
    expect(HERO_MEDIA.profiles.phonePortrait).toContain('/videos/hero/hero-mobile.mp4');
    expect(HERO_MEDIA.profiles.desktopLandscape).toContain('/videos/hero/hero-desktop.mp4');
  });
});
