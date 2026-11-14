import { useState } from 'react'
import { Save, Sun, Moon, Globe, Calendar, Shield, Database, Bell } from 'lucide-react'
import { PageHeader, FormField } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'

export function SettingsPage() {
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [general, setGeneral] = useState({
    companyName: 'W2 Manager',
    adminEmail: 'admin@w2manager.com',
    phone: '(555) 123-4567',
    timezone: 'America/New_York',
  })
  const [appearance, setAppearance] = useState({ theme: 'light', density: 'comfortable' })
  const [notifications, setNotifications] = useState({ emailAlerts: true, documentReminders: true, weeklyReport: false })
  const [taxDefaults, setTaxDefaults] = useState({ defaultTaxYear: '2024', defaultState: 'NY', autoCalculate: true })

  const handleGeneralChange = (name, value) => setGeneral((p) => ({ ...p, [name]: value }))
  const handleTaxChange = (name, value) => setTaxDefaults((p) => ({ ...p, [name]: value }))

  const handleSave = (section) => {
    addNotification({ type: 'success', title: 'Settings Saved', message: `${section} settings have been updated.` })
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure application preferences" />

      <div className="tw:max-w-3xl tw:space-y-6">
        {/* General */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
            <Globe className="tw:h-5 tw:w-5 tw:text-gray-400" />
            <div>
              <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">General</h3>
              <p className="tw:text-xs tw:text-gray-500">Basic application settings</p>
            </div>
          </div>
          <div className="tw:p-6">
            <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
              <FormField label="Organization Name" name="companyName" value={general.companyName} onChange={handleGeneralChange} />
              <FormField label="Admin Email" name="adminEmail" type="email" value={general.adminEmail} onChange={handleGeneralChange} />
              <FormField label="Phone" name="phone" value={general.phone} onChange={handleGeneralChange} />
              <FormField label="Timezone" name="timezone" type="select" value={general.timezone} onChange={handleGeneralChange} options={[
                { value: 'America/New_York', label: 'Eastern (ET)' },
                { value: 'America/Chicago', label: 'Central (CT)' },
                { value: 'America/Denver', label: 'Mountain (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
              ]} />
            </div>
            <div className="tw:flex tw:justify-end tw:pt-2">
              <button onClick={() => handleSave('General')} className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
                <Save className="tw:h-4 tw:w-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
            <Sun className="tw:h-5 tw:w-5 tw:text-gray-400" />
            <div>
              <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Appearance</h3>
              <p className="tw:text-xs tw:text-gray-500">Customize the look and feel</p>
            </div>
          </div>
          <div className="tw:p-6">
            <div className="tw:flex tw:gap-3 tw:mb-4">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setAppearance((p) => ({ ...p, theme: value }))}
                  className={`tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-3 tw:rounded-lg tw:border tw:text-sm tw:font-medium tw:transition tw:flex-1 tw:justify-center ${
                    appearance.theme === value
                      ? 'tw:border-indigo-300 tw:bg-indigo-50 tw:text-indigo-700'
                      : 'tw:border-gray-200 tw:text-gray-600 hover:tw:bg-gray-50'
                  }`}
                >
                  <Icon className="tw:h-4 tw:w-4" /> {label}
                </button>
              ))}
            </div>
            <div className="tw:flex tw:gap-3">
              {['comfortable', 'compact'].map((d) => (
                <button
                  key={d}
                  onClick={() => setAppearance((p) => ({ ...p, density: d }))}
                  className={`tw:px-4 tw:py-2 tw:rounded-lg tw:border tw:text-sm tw:font-medium tw:transition tw:flex-1 tw:capitalize ${
                    appearance.density === d
                      ? 'tw:border-indigo-300 tw:bg-indigo-50 tw:text-indigo-700'
                      : 'tw:border-gray-200 tw:text-gray-600 hover:tw:bg-gray-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="tw:flex tw:justify-end tw:pt-4">
              <button onClick={() => handleSave('Appearance')} className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
                <Save className="tw:h-4 tw:w-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Tax Defaults */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
            <Calendar className="tw:h-5 tw:w-5 tw:text-gray-400" />
            <div>
              <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Tax Defaults</h3>
              <p className="tw:text-xs tw:text-gray-500">Default values for W2 document generation</p>
            </div>
          </div>
          <div className="tw:p-6">
            <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
              <FormField label="Default Tax Year" name="defaultTaxYear" type="select" value={taxDefaults.defaultTaxYear} onChange={handleTaxChange} options={[
                { value: '2024', label: '2024' }, { value: '2023', label: '2023' }, { value: '2022', label: '2022' },
              ]} />
              <FormField label="Default State" name="defaultState" value={taxDefaults.defaultState} onChange={handleTaxChange} placeholder="e.g. NY" />
            </div>
            <label className="tw:flex tw:items-center tw:gap-3 tw:mt-2 tw:cursor-pointer">
              <input
                type="checkbox"
                checked={taxDefaults.autoCalculate}
                onChange={(e) => setTaxDefaults((p) => ({ ...p, autoCalculate: e.target.checked }))}
                className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500"
              />
              <span className="tw:text-sm tw:text-gray-700">Auto-calculate tax withholdings</span>
            </label>
            <div className="tw:flex tw:justify-end tw:pt-4">
              <button onClick={() => handleSave('Tax Defaults')} className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
                <Save className="tw:h-4 tw:w-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
            <Bell className="tw:h-5 tw:w-5 tw:text-gray-400" />
            <div>
              <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Notifications</h3>
              <p className="tw:text-xs tw:text-gray-500">Manage alert preferences</p>
            </div>
          </div>
          <div className="tw:p-6 tw:space-y-3">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive email notifications for important events' },
              { key: 'documentReminders', label: 'Document Reminders', desc: 'Get reminded about pending W2 documents' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly summary of activity' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="tw:flex tw:items-start tw:justify-between tw:p-3 tw:rounded-lg hover:tw:bg-gray-50 tw:cursor-pointer tw:transition">
                <div>
                  <p className="tw:text-sm tw:font-medium tw:text-gray-900">{label}</p>
                  <p className="tw:text-xs tw:text-gray-500">{desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[key]}
                  onChange={(e) => setNotifications((p) => ({ ...p, [key]: e.target.checked }))}
                  className="tw:h-4 tw:w-4 tw:mt-0.5 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500"
                />
              </label>
            ))}
            <div className="tw:flex tw:justify-end tw:pt-2">
              <button onClick={() => handleSave('Notification')} className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
                <Save className="tw:h-4 tw:w-4" /> Save Changes
              </button>
            </div>
          </div>
        </section>

        {/* Data & Security */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:mb-8">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
            <Shield className="tw:h-5 tw:w-5 tw:text-gray-400" />
            <div>
              <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Data & Security</h3>
              <p className="tw:text-xs tw:text-gray-500">Manage your data and security settings</p>
            </div>
          </div>
          <div className="tw:p-6">
            <div className="tw:flex tw:flex-wrap tw:gap-3">
              <button className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
                <Database className="tw:h-4 tw:w-4" /> Export All Data
              </button>
              <button className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-rose-600 tw:bg-white tw:border tw:border-rose-200 tw:rounded-lg hover:tw:bg-rose-50 tw:transition">
                Clear Local Data
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
