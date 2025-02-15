import React from 'react'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { RenderOptions } from '@testing-library/react'

// Add custom render function that includes providers
function render(
  ui: React.ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) {
  return act(async () => {
    rtlRender(ui, options)
  })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { render, screen, waitFor } 