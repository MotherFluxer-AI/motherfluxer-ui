import React from 'react'
import { render as rtlRender, screen, waitFor } from '@testing-library/react'

// Re-export everything
export * from '@testing-library/react'
export { screen, waitFor }
export const render = rtlRender 