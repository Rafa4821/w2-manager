import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../components/DashboardPage'

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
