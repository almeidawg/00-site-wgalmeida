import React from 'react'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('TurnstileWidget lifecycle', () => {
  let widgetOptions

  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'fixture-site-key')
    widgetOptions = undefined
    window.turnstile = {
      render: vi.fn((_container, options) => {
        widgetOptions = options
        return 'fixture-widget'
      }),
      remove: vi.fn(),
      reset: vi.fn(),
    }
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    delete window.turnstile
    document.getElementById('wg-turnstile-script')?.remove()
  })

  it('does not recreate the widget when parent callbacks change', async () => {
    const verifyFirst = vi.fn()
    const expireFirst = vi.fn()
    const verifyLatest = vi.fn()
    const expireLatest = vi.fn()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { default: TurnstileWidget } = await import('@/components/TurnstileWidget')
    const view = render(
      <TurnstileWidget
        label="anti-spam"
        onVerify={verifyFirst}
        onExpire={expireFirst}
      />,
    )

    await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1))
    expect(window.turnstile.remove).not.toHaveBeenCalled()

    view.rerender(
      <TurnstileWidget
        label="anti-spam atualizado"
        onVerify={verifyLatest}
        onExpire={expireLatest}
      />,
    )

    await act(async () => {})
    expect(window.turnstile.render).toHaveBeenCalledTimes(1)
    expect(window.turnstile.remove).not.toHaveBeenCalled()

    act(() => widgetOptions.callback('fresh-token'))
    expect(verifyFirst).not.toHaveBeenCalled()
    expect(verifyLatest).toHaveBeenCalledWith('fresh-token')

    let handled
    act(() => {
      handled = widgetOptions['error-callback']('110620')
    })
    expect(handled).toBe(true)
    expect(expireFirst).not.toHaveBeenCalled()
    expect(expireLatest).toHaveBeenCalledWith({ type: 'error', code: '110620' })
    expect(warn).toHaveBeenCalledWith('[WG Turnstile] challenge error', '110620')

    view.unmount()
    expect(window.turnstile.remove).toHaveBeenCalledTimes(1)
    expect(window.turnstile.remove).toHaveBeenCalledWith('fixture-widget')
  })

  it('reports timeout without remounting the widget', async () => {
    const onExpire = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { default: TurnstileWidget } = await import('@/components/TurnstileWidget')
    render(<TurnstileWidget label="anti-spam" onVerify={vi.fn()} onExpire={onExpire} />)

    await waitFor(() => expect(window.turnstile.render).toHaveBeenCalledTimes(1))

    act(() => widgetOptions['timeout-callback']())
    expect(onExpire).toHaveBeenCalledWith({ type: 'timeout' })
    expect(window.turnstile.render).toHaveBeenCalledTimes(1)
    expect(window.turnstile.remove).not.toHaveBeenCalled()
  })
})
