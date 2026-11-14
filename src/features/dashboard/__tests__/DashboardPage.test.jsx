import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../components/DashboardPage'

// The DashboardPage reads from repositories which read from localStorage
beforeEach(() => {
  // Provide a minimal store so the component can load
  window.localStorage.setItem('w2manager_data', JSON.stringify({
    companies: [], employees: [], w2Documents: [], templates: [],
  }))
  window.localStorage.setItem('w2manager_meta', JSON.stringify({ schemaVersion: 1 }))
})

describe('DashboardPage', () => {
  it('renders stat cards', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Active Companies')).toBeInTheDocument()
    expect(screen.getByText('Total Employees')).toBeInTheDocument()
    expect(screen.getByText('W2 Documents')).toBeInTheDocument()
  })

  it('renders recent documents section', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Recent Documents')).toBeInTheDocument()
  })

  it('renders recent activity section', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    )
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })
})
