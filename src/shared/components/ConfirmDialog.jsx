import { Modal } from './Modal'
import { AlertTriangle } from 'lucide-react'

export function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', variant = 'danger' }) {
  const btnClass = variant === 'danger'
    ? 'tw:bg-rose-600 hover:tw:bg-rose-700 tw:text-white'
    : 'tw:bg-indigo-600 hover:tw:bg-indigo-700 tw:text-white'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className={`tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:rounded-lg tw:transition ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="tw:flex tw:items-start tw:gap-4">
        <div className="tw:p-2 tw:bg-rose-100 tw:rounded-full tw:flex-shrink-0">
          <AlertTriangle className="tw:h-5 tw:w-5 tw:text-rose-600" />
        </div>
        <p className="tw:text-sm tw:text-gray-600">{message}</p>
      </div>
    </Modal>
  )
}
