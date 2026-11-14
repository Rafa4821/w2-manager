import { describe, it, expect, beforeEach } from 'vitest'
import { useCompaniesStore } from '../store/useCompaniesStore'

describe('useCompaniesStore', () => {
  beforeEach(() => {
    // Reset localStorage and store state before each test
    window.localStorage.removeItem('w2manager_data')
    window.localStorage.removeItem('w2manager_meta')
    useCompaniesStore.setState({ companies: [], error: null })
  })

  it('starts with empty companies', () => {
    const state = useCompaniesStore.getState()
    expect(state.companies).toEqual([])
  })

  it('creates a company via repository', () => {
    const data = {
      name: 'Test Corp', ein: '12-3456789',
      address: '100 Main St', city: 'New York', state: 'NY', zipCode: '10001',
      phone: '', email: '', contactName: '', stateEmployerId: '', status: 'active',
    }
    const created = useCompaniesStore.getState().create(data)
    const state = useCompaniesStore.getState()
    expect(state.companies).toHaveLength(1)
    expect(state.companies[0].name).toBe('Test Corp')
    expect(created.id).toBeTruthy()
  })

  it('removes a company via repository', () => {
    const data = {
      name: 'Test Corp', ein: '12-3456789',
      address: '100 Main St', city: 'New York', state: 'NY', zipCode: '10001',
      phone: '', email: '', contactName: '', stateEmployerId: '', status: 'active',
    }
    const created = useCompaniesStore.getState().create(data)
    useCompaniesStore.getState().remove(created.id)
    const state = useCompaniesStore.getState()
    expect(state.companies).toHaveLength(0)
  })
})
