import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ColorPicker from '@/components/moodboard/ColorPicker';
import StyleCard from '@/components/moodboard/StyleCard';

describe('moodboard nested keyboard controls', () => {
  it('does not let the style card cancel keyboard activation of the favorite button', () => {
    const onSelect = vi.fn();
    const onFavorite = vi.fn();
    const style = {
      id: 'boho',
      slug: 'boho',
      name: 'Boho',
      image: '/images/estilos/boho.webp',
      tags: ['acolhedor'],
    };

    render(
      <StyleCard
        style={style}
        isSelected={false}
        onSelect={onSelect}
        onFavorite={onFavorite}
      />
    );

    const favoriteButton = screen.getByRole('button', {
      name: 'Adicionar Boho dos favoritos',
    });

    expect(fireEvent.keyDown(favoriteButton, { key: 'Enter', code: 'Enter' })).toBe(true);
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(favoriteButton);
    expect(onFavorite).toHaveBeenCalledWith(style);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not let the color swatch cancel keyboard activation of the remove button', () => {
    const onColorsChange = vi.fn();

    render(
      <ColorPicker
        selectedColors={['#112233']}
        onColorsChange={onColorsChange}
      />
    );

    const removeButton = screen.getByRole('button', {
      name: 'Remover cor #112233',
    });

    expect(fireEvent.keyDown(removeButton, { key: ' ', code: 'Space' })).toBe(true);
    expect(onColorsChange).not.toHaveBeenCalled();

    fireEvent.click(removeButton);
    expect(onColorsChange).toHaveBeenCalledWith([]);
  });
});
