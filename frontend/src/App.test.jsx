import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

import { App } from './App.jsx'

test('returns H1 "Dadcraft Dashboard"', () => {
    render(<App />)
    const header = screen.getByRole('heading')

    expect(header).toHaveTextContent('Dadcraft Dashboard')
})