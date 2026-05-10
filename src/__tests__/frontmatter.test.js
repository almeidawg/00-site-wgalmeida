import { describe, expect, it } from 'vitest';

import { parseFrontmatter } from '@/utils/frontmatter';

describe('parseFrontmatter', () => {
  it('parses inline arrays so blog tags stay render-safe', () => {
    const { data } = parseFrontmatter(`---
title: "Guia"
tags: ["reforma", "obra", "2026"]
---
# Conteudo`);

    expect(data.tags).toEqual(['reforma', 'obra', '2026']);
  });

  it('keeps multiline arrays supported for legacy posts', () => {
    const { data } = parseFrontmatter(`---
title: "Guia"
tags:
  - arquitetura
  - interiores
---
# Conteudo`);

    expect(data.tags).toEqual(['arquitetura', 'interiores']);
  });
});
