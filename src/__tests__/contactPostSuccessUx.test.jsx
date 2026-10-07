import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  toast: vi.fn(),
  trackFormSubmit: vi.fn(),
}))

vi.mock('@/components/ResponsiveWebpImage', () => ({
  default: (props) => <img alt={props.alt || ''} />,
}))

vi.mock('@/components/SEO', () => ({
  default: () => null,
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mocks.toast }),
}))

vi.mock('@/lib/motion-lite', () => {
  const stripMotionProps = ({ initial, animate, transition, whileInView, viewport, ...props }) => props
  return {
    motion: {
      div: ({ children, ...props }) => <div {...stripMotionProps(props)}>{children}</div>,
      span: ({ children, ...props }) => <span {...stripMotionProps(props)}>{children}</span>,
      h1: ({ children, ...props }) => <h1 {...stripMotionProps(props)}>{children}</h1>,
      p: ({ children, ...props }) => <p {...stripMotionProps(props)}>{children}</p>,
    },
  }
})

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useTranslation: () => ({ t: (key) => key }),
  }
})

vi.mock('@/lib/analytics', () => ({
  trackFormSubmit: mocks.trackFormSubmit,
  trackWhatsappClick: vi.fn(),
}))

vi.mock('@/components/TurnstileWidget', () => ({
  TURNSTILE_SITE_KEY: 'fixture-site-key',
  default: ({ onVerify }) => (
    <button type="button" data-testid="turnstile-fixture" onClick={() => onVerify('fixture-token')}>
      verify
    </button>
  ),
}))

import Contact from '@/pages/Contact'

describe('Contact post-success UX', () => {
  beforeEach(() => {
    mocks.toast.mockReset()
    mocks.trackFormSubmit.mockReset()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ok: true, outcome: 'saved' }),
    }))
    window.turnstile = {
      reset: vi.fn(() => {
        throw new Error('reset failed after accepted contact')
      }),
    }
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    delete window.turnstile
  })

  it('keeps a successful submission successful even when Turnstile reset fails', async () => {
    const { container, getByTestId } = render(
      <MemoryRouter initialEntries={['/contato']}>
        <Contact />
      </MemoryRouter>,
    )

    fireEvent.change(container.querySelector('#contact-name'), { target: { value: 'QA Contact' } })
    fireEvent.change(container.querySelector('#contact-email'), { target: { value: 'qa@example.com' } })
    fireEvent.change(container.querySelector('#contact-message'), { target: { value: 'Mensagem QA' } })
    fireEvent.click(getByTestId('turnstile-fixture'))
    fireEvent.submit(container.querySelector('form'))

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1))

    const request = fetch.mock.calls[0]
    const payload = JSON.parse(request[1].body)
    expect(payload.context).toBe('contact')

    await waitFor(() => {
      expect(container.querySelector('#contact-name').value).toBe('')
      expect(container.querySelector('#contact-email').value).toBe('')
      expect(container.querySelector('#contact-message').value).toBe('')
    })

    expect(window.turnstile.reset).toHaveBeenCalledTimes(1)
    expect(mocks.trackFormSubmit).toHaveBeenCalledWith({
      formId: 'contact',
      status: 'success',
      context: 'contact',
    })
    expect(mocks.trackFormSubmit).not.toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error' }),
    )
    expect(mocks.toast).toHaveBeenCalledWith({
      title: 'contactPage.toast.successTitle',
      description: 'contactPage.toast.successDescription',
    })
    expect(mocks.toast).not.toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    )
  })
})