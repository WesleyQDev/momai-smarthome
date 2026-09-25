import type { JSX } from 'react'
import { translateSh, useSmartHomeI18n } from '../i18n/index'
import type { WidgetProps } from './types'
import { isOnState, useStatusWidget } from './hooks/useStatusWidget'
import {
  isStatusConfigCustomized,
  resolveStatusLimit,
  STATUS_LIMIT_CHOICES,
  type StatusConfig
} from './statusCustomization'
import { WidgetLoading, WidgetState } from './components/WidgetState'

export default function SmarthomeStatusWidget({
  config,
  isEditing = false
}: WidgetProps<StatusConfig>): JSX.Element {
  const { t } = useSmartHomeI18n()
  const { loading, error, devices } = useStatusWidget(isEditing)
  const onlyOn = config?.onlyOn === true
  const limit = resolveStatusLimit(config)

  if (loading) return <WidgetLoading message={t('widget.status.loading')} />
  if (error) return <WidgetState title={t('widget.status.title')} message={error} />

  const onCount = devices.filter((device) => isOnState(device.state)).length
  const visible = devices
    .filter((device) => !onlyOn || isOnState(device.state))
    .slice(0, limit)

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
          {visible.map((device) => (
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

SmarthomeStatusWidget.customization = {
  isCustomized: (config?: Record<string, unknown>) => isStatusConfigCustomized(config),
  title: translateSh('widget.status.customizeTitle'),
  defaults: {},
  options: [
    {
      key: 'onlyOn',
      kind: 'toggle',
      label: translateSh('widget.status.onlyOn')
    },
    {
      key: 'limit',
      kind: 'select',
      label: translateSh('widget.status.limit'),
      options: STATUS_LIMIT_CHOICES.map((value) => ({ value, label: value }))
    }
  ]
}
