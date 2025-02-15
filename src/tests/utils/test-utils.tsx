import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'

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
export { render } 