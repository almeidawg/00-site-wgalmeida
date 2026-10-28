import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Login from '@/pages/Login'

vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ user: null, signIn: vi.fn() }),
}))
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))
vi.mock('@/components/SEO', () => ({ default: () => null }))
vi.mock('@/lib/motion-lite', () => ({
  motion: { div: ({ children }) => <div>{children}</div> },
}))

describe('Login accessibility', () => {
  it('associates labels with email and password fields', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })
})
