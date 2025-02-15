import React from 'react'
import { render } from '@testing-library/react'
import { act } from 'react'
import type { RenderOptions } from '@testing-library/react'

// Custom render function that uses React.act
const customRender = (ui: React.ReactElement, options = {}) => {
  return act(async () => {
    render(ui, options)
  })
}

// Add custom render function that includes providers
function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      // Add any providers your app needs here
      <>{children}</>
    )
  }
  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render } 