/**
 * Seed data for first-run initialization.
 *
 * Companies are real employer names/addresses used for W-2 generation.
 * No employee records are seeded — users create their own.
 */
import { companyRepository } from '../repositories/companyRepository'
import { loadStore } from '../persistence'

const SEED_COMPANIES = [
  { name: 'RAMS RPG', ein: '00-0000001', address: '7121 GRAND NATIONAL DR', address2: 'SUITE 104', city: 'ORLANDO', state: 'FL', zipCode: '32819', status: 'active' },
  { name: 'ASPEN TECHNICAL STAFFING INC', ein: '00-0000002', address: '700 E DIEHL RD STE 105', city: 'NAPERVILLE', state: 'IL', zipCode: '60563-4813', status: 'active' },
  { name: 'LOENBRO, LLC.', ein: '00-0000003', address: '12250 N. PECOS ST. SUITE 500', city: 'WESTMINSTER', state: 'CO', zipCode: '80234', status: 'active' },
  { name: 'HELIX ELECTRIC', ein: '00-0000004', address: '224 N 143RD AVENUE', address2: 'SUITE A', city: 'GOODYEAR', state: 'AZ', zipCode: '85338', status: 'active' },
  { name: 'Gea Electric TX LLC', ein: '00-0000005', address: '450 El Dorado BLVD', city: 'Webster', state: 'TX', zipCode: '77598', status: 'active' },
  { name: 'MMR Constructors Inc', ein: '00-0000006', address: '15961 Airline Highway', city: 'Baton Rouge', state: 'LA', zipCode: '70817', status: 'active' },
  { name: 'Finish Line Staffing LLC', ein: '00-0000007', address: '139 S. English Station', address2: 'Suite 220', city: 'Louisville', state: 'KY', zipCode: '40245', status: 'active' },
  { name: 'M.C. DEAN INC.', ein: '00-0000008', address: '1765 GREENSBORO STATION PLACE', city: 'TYSONS', state: 'VA', zipCode: '22102', status: 'active' },
  { name: 'PROTRADES STAFFING LLC', ein: '00-0000009', address: '2635 S BAHAMA DR', city: 'GILBERT', state: 'AZ', zipCode: '85295', status: 'active' },
  { name: 'DSE ELECTRICAL SERVICE AND MAINTENANCE, INC', ein: '00-0000010', address: '540 E HORATIO AV ST 301A', city: 'MAITLAND', state: 'FL', zipCode: '32751', status: 'active' },
  { name: 'THE INDUSTRIAL COMPANY', ein: '00-0000011', address: '1550 MIKE FAHEY ST', city: 'OMAHA', state: 'NE', zipCode: '68102', status: 'active' },
  { name: 'DELTA DIVERSIFIED ENTERPRISES INC', ein: '00-0000012', address: '425 WEST GEMINI DRIVE', city: 'TEMPE', state: 'AZ', zipCode: '85283-1709', status: 'active' },
  { name: 'QUALITY PLUS SERVICES INC.', ein: '00-0000013', address: '2929 QUALITY DRIVE', city: 'PETERSBURG', state: 'VA', zipCode: '23805', status: 'active' },
  { name: 'Scale and Change LLC', ein: '00-0000014', address: '2224 Barlass Dr', city: 'Rockwall', state: 'TX', zipCode: '75087', status: 'active' },
  { name: 'SILENT AIRE COMPANY', ein: '00-0000015', address: '280 E GERMANN RD', city: 'GILBERT', state: 'AZ', zipCode: '85297', status: 'active' },
]

export function seedIfEmpty() {
  const data = loadStore()

  // Only seed when the store is completely empty
  if (data.companies.length > 0 || data.employees.length > 0) return false

  companyRepository.bulkCreate(SEED_COMPANIES)

  return true
}
