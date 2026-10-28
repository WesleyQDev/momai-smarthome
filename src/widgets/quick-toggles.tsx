import type { JSX } from 'react'
import { useSmartHomeI18n } from '../i18n/index'
import type { WidgetProps } from './types'
import { isOnState } from './hooks/useStatusWidget'
import { useQuickTogglesWidget, type QuickTogglesConfig } from './hooks/useQuickTogglesWidget'
import { WidgetLoading, WidgetState } from './components/WidgetState'

function ToggleSwitch({ on }: { on: boolean }): JSX.Element {
  return (
    <span
      className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 flex items-center ${
        on ? 'bg-accent' : 'bg-input border border-border/60'
      }`}
    >
      <span
        className={`block w-4 h-4 rounded-full transition-transform ${
          on ? 'translate-x-4 bg-bg' : 'translate-x-0 bg-text-muted'
        }`}
      />
    </span>
  )
}

export default function SmarthomeQuickTogglesWidget({
  config,
  isEditing = false
}: WidgetProps<QuickTogglesConfig>): JSX.Element {
  const { t } = useSmartHomeI18n()
  const entityIds = config?.entityIds ?? []
  const { loading, error, rows, toggle } = useQuickTogglesWidget(isEditing, entityIds)

  if (entityIds.length === 0) {
    return <WidgetState title={t('widget.toggles.title')} message={t('widget.toggles.needsSetup')} />
  }

  if (loading) return <WidgetLoading message={t('widget.toggles.loading')} />
  if (error) return <WidgetState title={t('widget.toggles.title')} message={error} />

  return (
    <div className="w-full h-full flex flex-col min-h-0 overflow-hidden p-3 gap-1.5 smarthome-widget-container">
      <div className={`flex items-center justify-between shrink-0 widget-header-row ${isEditing ? 'pr-14' : ''}`}>
        <span className="text-xs font-bold text-text truncate">{t('widget.toggles.title')}</span>
      </div>
      <div className="flex flex-col gap-1.5 min-h-0 overflow-hidden">
        {rows.map((device) => {
          const on = isOnState(device.state)
          return (
            <button
              key={device.id}
              type="button"
              disabled={device.pending || isEditing}
              onClick={() => void toggle(device)}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-card border border-border/40 hover:border-accent/40 text-left disabled:opacity-60 transition-colors smarthome-device-item"
            >
              <span className="text-xs text-text truncate">{device.name}</span>
              <ToggleSwitch on={on} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
