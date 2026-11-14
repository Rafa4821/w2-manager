import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export function Modal({ isOpen, onClose, title, size = 'md', children, footer }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'tw:max-w-md',
    md: 'tw:max-w-lg',
    lg: 'tw:max-w-2xl',
    xl: 'tw:max-w-4xl',
  }

  return (
    <div
      ref={overlayRef}
      className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="tw:fixed tw:inset-0 tw:bg-black/50 tw:backdrop-blur-sm" />
      <div className={`tw:relative tw:bg-white tw:rounded-xl tw:shadow-2xl tw:w-full ${sizeClasses[size]} tw:max-h-[90vh] tw:flex tw:flex-col tw:animate-in tw:fade-in tw:zoom-in-95`}>
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
          <h2 className="tw:text-lg tw:font-semibold tw:text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="tw:p-1.5 tw:rounded-lg tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 tw:transition"
          >
            <X className="tw:h-5 tw:w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="tw:px-6 tw:py-4 tw:overflow-y-auto tw:flex-1">
          {children}
        </div>
        {/* Footer */}
        {footer && (
          <div className="tw:flex tw:items-center tw:justify-end tw:gap-2 tw:px-6 tw:py-4 tw:border-t tw:border-gray-100 tw:bg-gray-50/50 tw:rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
