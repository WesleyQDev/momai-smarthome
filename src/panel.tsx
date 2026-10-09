import React from 'react'
import { DeviceControlCardContent } from './components/DeviceControlContent'
import { SmartHomeStyles } from './styles'
import { SmartHomeI18nProvider, useSmartHomeI18n } from './i18n'
import { extFetch } from './shared/hostApi'

function SmartHomePanelInner(props: any) {
  const data = props?.data || props
  const device = data?.device
  const { t } = useSmartHomeI18n()

  const handleClose = () => {
    const closeOverlay = (window as any)?.momaiAPI?.closeOverlay || (window as any)?.api?.closeOverlay
    if (typeof closeOverlay === 'function') {
      try {
        closeOverlay({ overlayId: device?.id })
      } catch {}
    }
  }

  return (
    <>
      <SmartHomeStyles />
      {!device ? (
        <div
          className="sh-modal-detail"
          style={{
            WebkitAppRegion: 'drag',
            padding: '24px',
            textAlign: 'center',
            color: '#fff',
            position: 'relative'
          } as any}
        >
          <button
            className="sh-modal-close-btn"
            style={{ WebkitAppRegion: 'no-drag', cursor: 'pointer', zIndex: 99999 } as any}
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
          >
            ✕
          </button>
          <p style={{ fontSize: '14px', color: '#9aa0a6', margin: '20px 0 0' }}>
            {t('panel.noDevice')}
          </p>
        </div>
      ) : (
        <DeviceControlCardContent
          device={device}
          allDevices={data?.allDevices || []}
          onClose={handleClose}
          callServiceApi={async (domain, service, serviceData, providerType) => {
            const winApi = (window as any).api || (window as any).momaiAPI
            if (typeof winApi?.callService === 'function') {
              return winApi.callService(domain, service, serviceData, providerType || 'homeassistant')
            }
            return extFetch('/extensions/momai-smarthome/command', {
              toolName: 'callService',
              args: { domain, service, data: serviceData, providerType: providerType || 'homeassistant' }
            })
          }}
          isOverlay={true}
        />
      )}
    </>
  )
}

export function SmartHomePanel(props: any) {
  return (
    <SmartHomeI18nProvider>
      <SmartHomePanelInner {...props} />
    </SmartHomeI18nProvider>
  )
}

const registerRenderer = (type: string, component: any) => {
  if (typeof window !== 'undefined' && (window as any).__skillRendererRegistry?.registerRenderer) {
    ;(window as any).__skillRendererRegistry.registerRenderer(type, component)
  }
}

registerRenderer('momaismarthome-panel', SmartHomePanel)
export default SmartHomePanel
