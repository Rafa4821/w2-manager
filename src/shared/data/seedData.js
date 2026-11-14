/**
 * Seed data for first-run initialization.
 *
 * All data here is entirely fictitious — no authentic personal information
 * (SSN, EIN, wages, etc.) is stored.  Masked SSNs and placeholder EINs
 * are used throughout.
 */
import { companyRepository } from '../repositories/companyRepository'
import { employeeRepository } from '../repositories/employeeRepository'
import { loadStore } from '../persistence'

const SEED_COMPANIES = [
  { name: 'Acme Corporation', ein: '12-3456789', address: '100 Main Street', city: 'New York', state: 'NY', zipCode: '10001', phone: '(212) 555-0100', email: 'hr@acmecorp.example', contactName: 'Alice Doe', stateEmployerId: 'NY-000001', status: 'active' },
  { name: 'Global Tech Solutions', ein: '98-7654321', address: '2500 Innovation Drive', city: 'San Francisco', state: 'CA', zipCode: '94105', phone: '(415) 555-0200', email: 'payroll@globaltech.example', contactName: 'Bob Roe', stateEmployerId: 'CA-000002', status: 'active' },
  { name: 'Sunrise Healthcare', ein: '55-1234567', address: '800 Medical Parkway', city: 'Houston', state: 'TX', zipCode: '77001', phone: '(713) 555-0300', email: 'admin@sunrisehc.example', contactName: 'Carla Moe', stateEmployerId: '', status: 'active' },
  { name: 'Metro Construction LLC', ein: '33-9876543', address: '450 Builder Blvd', city: 'Chicago', state: 'IL', zipCode: '60601', phone: '(312) 555-0400', email: 'office@metroconst.example', contactName: 'Dan Foe', stateEmployerId: 'IL-000004', status: 'active' },
  { name: 'Pacific Retail Group', ein: '77-1112233', address: '1200 Commerce Way', city: 'Los Angeles', state: 'CA', zipCode: '90001', phone: '(213) 555-0500', email: 'hr@pacificretail.example', contactName: 'Eve Woe', stateEmployerId: 'CA-000005', status: 'inactive' },
  { name: 'Eastern Financial Services', ein: '44-5556677', address: '700 Wall Street', city: 'Boston', state: 'MA', zipCode: '02101', phone: '(617) 555-0600', email: 'payroll@easternfs.example', contactName: 'Frank Zoe', stateEmployerId: 'MA-000006', status: 'active' },
]

const SEED_EMPLOYEES = [
  { firstName: 'John', lastName: 'Smith', ssn: '000-00-1234', email: 'john.smith@example.com', phone: '(212) 555-1001', address: '45 Park Avenue', city: 'New York', state: 'NY', zipCode: '10016', companyIndex: 0, position: 'Senior Engineer', department: 'Engineering', hireDate: '2022-03-15', status: 'active' },
  { firstName: 'Maria', lastName: 'Garcia', ssn: '000-00-5678', email: 'maria.garcia@example.com', phone: '(415) 555-2002', address: '1800 Mission St', city: 'San Francisco', state: 'CA', zipCode: '94110', companyIndex: 1, position: 'Product Manager', department: 'Product', hireDate: '2021-07-01', status: 'active' },
  { firstName: 'James', lastName: 'Wilson', ssn: '000-00-9012', email: 'james.wilson@example.com', phone: '(713) 555-3003', address: '320 Medical Center Dr', city: 'Houston', state: 'TX', zipCode: '77030', companyIndex: 2, position: 'Nurse Practitioner', department: 'Clinical', hireDate: '2020-11-10', status: 'active' },
  { firstName: 'Sarah', lastName: 'Johnson', ssn: '000-00-3456', email: 'sarah.j@example.com', phone: '(212) 555-4004', address: '78 Broadway', city: 'New York', state: 'NY', zipCode: '10006', companyIndex: 0, position: 'HR Director', department: 'Human Resources', hireDate: '2019-05-20', status: 'active' },
  { firstName: 'Robert', lastName: 'Chen', ssn: '000-00-7890', email: 'robert.chen@example.com', phone: '(415) 555-5005', address: '500 Folsom St', city: 'San Francisco', state: 'CA', zipCode: '94105', companyIndex: 1, position: 'Data Scientist', department: 'Analytics', hireDate: '2023-01-10', status: 'active' },
  { firstName: 'Emily', lastName: 'Davis', ssn: '000-00-2345', email: 'emily.davis@example.com', phone: '(312) 555-6006', address: '200 Lake Shore Dr', city: 'Chicago', state: 'IL', zipCode: '60611', companyIndex: 3, position: 'Project Manager', department: 'Operations', hireDate: '2022-08-01', status: 'active' },
  { firstName: 'Michael', lastName: 'Brown', ssn: '000-00-6789', email: 'michael.b@example.com', phone: '(713) 555-7007', address: '150 Westheimer Rd', city: 'Houston', state: 'TX', zipCode: '77006', companyIndex: 2, position: 'Physician', department: 'Clinical', hireDate: '2021-02-15', status: 'inactive' },
  { firstName: 'Lisa', lastName: 'Martinez', ssn: '000-00-0123', email: 'lisa.m@example.com', phone: '(213) 555-8008', address: '900 Wilshire Blvd', city: 'Los Angeles', state: 'CA', zipCode: '90017', companyIndex: 4, position: 'Store Manager', department: 'Retail', hireDate: '2023-04-01', status: 'active' },
]

export function seedIfEmpty() {
  const data = loadStore()

  // Only seed when the store is completely empty
  if (data.companies.length > 0 || data.employees.length > 0) return false

  // Seed companies
  const createdCompanies = companyRepository.bulkCreate(SEED_COMPANIES)

  // Seed employees (resolve companyIndex → real companyId)
  const employeesToCreate = SEED_EMPLOYEES.map(({ companyIndex, ...emp }) => ({
    ...emp,
    companyId: createdCompanies[companyIndex].id,
  }))
  employeeRepository.bulkCreate(employeesToCreate)

  return true
}
