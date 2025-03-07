import { render as rtlRender, screen, waitFor, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'

// Re-export everything
export * from '@testing-library/react'

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => rtlRender(ui, { ...options })

// Export customized render, screen, and waitFor
export { customRender as render, screen, waitFor } 