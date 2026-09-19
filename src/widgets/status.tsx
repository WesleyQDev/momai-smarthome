import type { JSX } from 'react'
import { useSmartHomeI18n } from '../i18n/index'
import type { WidgetProps } from './types'
import { isOnState, useStatusWidget } from './hooks/useStatusWidget'
import { WidgetLoading, WidgetState } from './components/WidgetState'

export default function SmarthomeStatusWidget({ isEditing = false }: WidgetProps): JSX.Element {
  const { t } = useSmartHomeI18n()
  const { loading, error, devices } = useStatusWidget(isEditing)

  if (loading) return <WidgetLoading message={t('widget.status.loading')} />
  if (error) return <WidgetState title={t('widget.status.title')} message={error} />

  const onCount = devices.filter((device) => isOnState(device.state)).length

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden p-3 gap-2">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-xs font-bold text-text">{t('widget.status.title')}</span>
        <span className="text-[11px] text-text-muted">
          {onCount} / {devices.length}
        </span>
      </div>
      {devices.length === 0 ? (
        <span className="text-[11px] text-text-muted">{t('widget.status.empty')}</span>
      ) : (
        <div className="flex flex-col gap-1.5 min-h-0 overflow-hidden">
          {devices.slice(0, 5).map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-bg/50 border border-border/20"
            >
              <span className="text-xs text-text truncate">{device.name}</span>
              <span className={isOnState(device.state) ? 'text-[10px] font-bold text-accent' : 'text-[10px] text-text-muted'}>
                {device.state}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
