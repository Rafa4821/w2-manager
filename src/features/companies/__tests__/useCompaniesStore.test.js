import { describe, it, expect, beforeEach } from 'vitest'
import { useCompaniesStore } from '../store/useCompaniesStore'

describe('useCompaniesStore', () => {
  beforeEach(() => {
    useCompaniesStore.setState({ companies: [], selectedCompany: null })
  })

  it('starts with empty companies', () => {
    const state = useCompaniesStore.getState()
    expect(state.companies).toEqual([])
  })

  it('adds a company', () => {
    const company = { id: '1', name: 'Test Corp', ein: '12-3456789' }
    useCompaniesStore.getState().addCompany(company)
    const state = useCompaniesStore.getState()
    expect(state.companies).toHaveLength(1)
    expect(state.companies[0].name).toBe('Test Corp')
  })

  it('removes a company', () => {
    const company = { id: '1', name: 'Test Corp', ein: '12-3456789' }
    useCompaniesStore.getState().addCompany(company)
    useCompaniesStore.getState().removeCompany('1')
    const state = useCompaniesStore.getState()
    expect(state.companies).toHaveLength(0)
  })
})
