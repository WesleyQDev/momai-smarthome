// src/panel.tsx
import React5 from "react";

// src/components/DeviceControlContent.tsx
import React3, { useState as useState2, useRef } from "react";

// src/i18n/index.tsx
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// src/i18n/locales/pt-BR.json
var pt_BR_default = {
  "panel.noDevice": "Nenhum dispositivo selecionado para exibi\xE7\xE3o.",
  "panel.timeout": "O servidor do MomAI n\xE3o respondeu (timeout). Verifique se o app est\xE1 rodando.",
  "panel.networkError": "Falha de rede ao falar com o servidor",
  "panel.serviceError": "Erro ao executar servi\xE7o:",
  "connect.title": "Conectar ao Home Assistant",
  "connect.description": "Informe a URL do seu servidor Home Assistant e um Long-Lived Access Token.",
  "connect.urlLabel": "URL do Home Assistant",
  "connect.urlLabelAlt": "URL do Servidor",
  "connect.tokenLabel": "Long-Lived Access Token",
  "connect.showToken": "Mostrar token",
  "connect.hideToken": "Ocultar token",
  "connect.connecting": "Conectando...",
  "connect.connect": "Conectar",
  "connect.connectHA": "Conectar ao Home Assistant",
  "connect.cancel": "Cancelar",
  "connect.disconnect": "Desconectar",
  "connect.reconnect": "Reconectar",
  "connect.syncing": "Sincronizando...",
  "connect.resync": "Resincronizar",
  "connect.tryReconnect": "Tentar Reconectar Agora",
  "connect.tryReconnecting": "Tentando Reconectar...",
  "auth.subtitle": "Conecte seus dispositivos inteligentes ao MomAI informando o endere\xE7o do seu servidor local ou remoto.",
  "auth.loading": "Carregando...",
  "status.connected": "Conectado",
  "status.disconnected": "Offline",
  "status.unavailable": "Home Assistant Indispon\xEDvel",
  "status.unavailableSub": "N\xE3o foi poss\xEDvel estabelecer conex\xE3o com o servidor. Verifique se o Home Assistant est\xE1 ligado e acess\xEDvel na rede.",
  "status.autoSaved": "Salvo automaticamente",
  "status.autoSavedHint": "As a\xE7\xF5es s\xE3o salvas automaticamente.",
  "status.saving": "Salvando\u2026",
  "status.saveError": "Erro ao salvar. Tente novamente.",
  "status.loading": "Carregando\u2026",
  "domains.light": "Ilumina\xE7\xE3o",
  "domains.switch": "Interruptor",
  "domains.fan": "Ventilador",
  "domains.cover": "Persiana",
  "domains.lock": "Fechadura",
  "domains.climate": "Climatiza\xE7\xE3o",
  "domains.sensor": "Sensor",
  "domains.binarySensor": "Sensor Bin\xE1rio",
  "domains.mediaPlayer": "M\xEDdia / TV",
  "domains.camera": "C\xE2mera",
  "domains.vacuum": "Aspirador",
  "domains.scene": "Cena",
  "domains.automation": "Automa\xE7\xE3o",
  "domains.alarm": "Alarme",
  "domains.remote": "Controle Remoto",
  "domains.sun": "Sol",
  "domains.weather": "Clima",
  "device.on": "Ligado",
  "device.off": "Desligado",
  "device.active": "Ativo",
  "device.inactive": "Inativo",
  "device.open": "Aberto",
  "device.closed": "Fechado",
  "device.locked": "Bloqueado",
  "device.unlocked": "Desbloqueado",
  "device.trancado": "Trancado",
  "device.destrancado": "Destrancado",
  "device.playing": "Reproduzindo",
  "device.paused": "Pausado",
  "device.online": "Online",
  "device.offline": "Offline",
  "device.unavailable": "Indispon\xEDvel",
  "device.controlable": "Control\xE1veis",
  "device.sensors": "Sensores & Status",
  "device.current": "atual",
  "control.brightness": "Brilho",
  "control.color": "Cor",
  "control.temperature": "Temperatura",
  "control.volume": "Volume",
  "control.playPause": "Play/Pause",
  "filter.allDevices": "Todos os dispositivos",
  "filter.selectOther": "Selecione outro filtro acima para visualizar seus dispositivos.",
  "clock.devicesOn": "{active} de {total} dispositivos ligados",
  "sun.day": "Dia (Acima do Horizonte)",
  "sun.night": "Noite (Abaixo do Horizonte)",
  "sun.rise": "Nascer",
  "sun.set": "P\xF4r do Sol",
  "actions.title": "A\xE7\xF5es",
  "actions.description": "A\xE7\xF5es executadas automaticamente quando um dispositivo mudar de estado. Defina o gatilho de cada a\xE7\xE3o (ex.: luz da sala ligou \u2192 enviar mensagem no WhatsApp).",
  "actions.addAction": "+ Adicionar a\xE7\xE3o",
  "actions.cancel": "Cancelar",
  "actions.noAutomation": "Nenhuma automa\xE7\xE3o. Campos dispon\xEDveis:",
  "actions.noExtension": "Nenhuma extens\xE3o com a\xE7\xF5es instalada",
  "actions.noDevice": "Nenhum dispositivo nesta categoria",
  "actions.trigger": "Gatilho (quando executar)",
  "actions.device": "Dispositivo",
  "actions.room": "C\xF4modo",
  "actions.anyRoom": "Qualquer",
  "actions.state": "Estado",
  "actions.anyState": "Qualquer",
  "actions.anyStateHint": "Deixe vazio para rodar com qualquer mudan\xE7a de estado.",
  "actions.targetExt": "Extens\xE3o alvo",
  "actions.actionLabel": "A\xE7\xE3o",
  "actions.prefilled": "(pr\xE9-preenchido)",
  "actions.useAction": "Usar esta a\xE7\xE3o",
  "actions.saveChanges": "Salvar altera\xE7\xF5es",
  "actions.when": "Quando:",
  "actions.close": "Fechar",
  "param.device": "Dispositivo",
  "param.action": "A\xE7\xE3o",
  "param.brightness": "Brilho",
  "param.color": "Cor",
  "param.temperature": "Temperatura",
  "param.domain": "Dom\xEDnio",
  "param.service": "Servi\xE7o",
  "param.data": "Dados",
  "param.room": "C\xF4modo",
  "param.camera": "C\xE2mera",
  "param.monitor": "Monitor",
  "param.label": "R\xF3tulo",
  "param.contact": "Contato ou n\xFAmero",
  "param.message": "Mensagem",
  "param.image": "Imagem",
  "tool.sendMessage": "Enviar mensagem",
  "tool.controlDevice": "Controlar dispositivo",
  "tool.setLightColor": "Cor da luz",
  "tool.controlTV": "Controle da TV",
  "tool.controlClimate": "Controlar clima",
  "tool.haService": "Servi\xE7o da casa",
  "tool.listDevices": "Listar dispositivos",
  "tool.queryDevice": "Consultar dispositivo",
  "tool.captureSnapshot": "Capturar print",
  "tool.startMonitoring": "Iniciar monitoramento",
  "tool.listContacts": "Listar contatos",
  "tool.getHistory": "Hist\xF3rico",
  "state.on": "Ligado",
  "state.off": "Desligado",
  "placeholder.deviceName": "Dispositivo",
  "placeholder.deviceState": "Estado",
  "placeholder.deviceRoom": "C\xF4modo",
  "placeholder.entityId": "Entidade",
  "placeholder.image": "Imagem",
  "search.typeToSearch": "Digite para buscar\u2026",
  "search.typeNameOrNumber": "Digite nome ou n\xFAmero",
  "contextMenu.openControl": "Abrir controle",
  "contextMenu.turnOff": "Desligar",
  "contextMenu.turnOn": "Ligar",
  "contextMenu.copyName": "Copiar nome",
  "contextMenu.copyEntityId": "Copiar ID da entidade",
  "categories.lighting": "Ilumina\xE7\xE3o & RGB",
  "categories.climate": "Climatiza\xE7\xE3o",
  "categories.locks": "Fechaduras & Sensores",
  "categories.media": "M\xEDdia & Smart TVs",
  "errors.connectFailed": "Falha ao conectar",
  "errors.disconnectFailed": "Falha ao desconectar",
  "errors.reconnectFailed": "Falha ao tentar reconectar",
  "errors.serverUnavailable": "Servidor indispon\xEDvel ou offline",
  "remote.home": "Menu In\xEDcio (Home)",
  "remote.inputs": "Entradas de v\xEDdeo (Outputs / HDMI / TV)",
  "remote.prev": "Faixa anterior / Voltar m\xEDdia",
  "remote.playPause": "Pausar/Iniciar reprodu\xE7\xE3o",
  "remote.next": "Pr\xF3xima faixa / Avan\xE7ar m\xEDdia",
  "remote.play": "Iniciar reprodu\xE7\xE3o",
  "remote.pause": "Pausar reprodu\xE7\xE3o",
  "remote.back": "Voltar",
  "remote.youtube": "Abrir YouTube",
  "remote.powerOn": "Ligar TV",
  "remote.powerOff": "Desligar TV",
  "remote.mute": "Silenciar (Mudo)",
  "remote.unmute": "Restaurar som (Desmudar)",
  "remote.volDown": "Diminuir volume",
  "remote.volUp": "Aumentar volume",
  "remote.navUp": "Navegar para cima",
  "remote.navDown": "Navegar para baixo",
  "remote.navLeft": "Navegar para esquerda",
  "remote.navRight": "Navegar para direita",
  "remote.confirm": "Confirmar / OK",
  "remote.switchToInput": "Alternar para entrada {src}",
  "remote.defaultRoom": "Sala",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Umidade",
  "weather.pressure": "Press\xE3o",
  "weather.wind": "Vento",
  "weather.unknown": "desconhecido",
  "light.on": "Luz ligada",
  "light.off": "Luz desligada",
  "device.status": "Status do Dispositivo",
  "device.statusOn": "Ativo / Ligado",
  "device.statusOff": "Inativo / Desligado",
  "device.turnOn": "Ligar Dispositivo",
  "device.turnOff": "Desligar Dispositivo",
  "device.humidity": "Umidade",
  "device.value": "Valor",
  "device.noRoom": "C\xF4modo",
  "color.warmOrange": "Laranja Quente",
  "color.softAmber": "\xC2mbar Suave",
  "color.warmWhite": "Branco Quente",
  "color.pureWhite": "Branco Puro",
  "color.iceBlue": "Azul Gelo",
  "color.softPurple": "Roxo Suave",
  "color.pastelPink": "Rosa Pastel",
  "color.coralRed": "Coral Vermelho",
  "actions.edit": "Editar",
  "actions.remove": "Remover"
};

// src/i18n/locales/en-US.json
var en_US_default = {
  "panel.noDevice": "No device selected for display.",
  "panel.timeout": "MomAI server did not respond (timeout). Check if the app is running.",
  "panel.networkError": "Network error communicating with the server",
  "panel.serviceError": "Error executing service:",
  "connect.title": "Connect to Home Assistant",
  "connect.description": "Enter your Home Assistant server URL and a Long-Lived Access Token.",
  "connect.urlLabel": "Home Assistant URL",
  "connect.urlLabelAlt": "Server URL",
  "connect.tokenLabel": "Long-Lived Access Token",
  "connect.showToken": "Show token",
  "connect.hideToken": "Hide token",
  "connect.connecting": "Connecting...",
  "connect.connect": "Connect",
  "connect.connectHA": "Connect to Home Assistant",
  "connect.cancel": "Cancel",
  "connect.disconnect": "Disconnect",
  "connect.reconnect": "Reconnect",
  "connect.syncing": "Syncing...",
  "connect.resync": "Resync",
  "connect.tryReconnect": "Try Reconnecting Now",
  "connect.tryReconnecting": "Trying to Reconnect...",
  "auth.subtitle": "Connect your smart devices to MomAI by entering your local or remote server address.",
  "auth.loading": "Loading...",
  "status.connected": "Connected",
  "status.disconnected": "Offline",
  "status.unavailable": "Home Assistant Unavailable",
  "status.unavailableSub": "Could not establish a connection to the server. Check if Home Assistant is on and accessible on the network.",
  "status.autoSaved": "Auto-saved",
  "status.autoSavedHint": "Actions are saved automatically.",
  "status.saving": "Saving\u2026",
  "status.saveError": "Error saving. Please try again.",
  "status.loading": "Loading\u2026",
  "domains.light": "Lighting",
  "domains.switch": "Switch",
  "domains.fan": "Fan",
  "domains.cover": "Cover",
  "domains.lock": "Lock",
  "domains.climate": "Climate",
  "domains.sensor": "Sensor",
  "domains.binarySensor": "Binary Sensor",
  "domains.mediaPlayer": "Media / TV",
  "domains.camera": "Camera",
  "domains.vacuum": "Vacuum",
  "domains.scene": "Scene",
  "domains.automation": "Automation",
  "domains.alarm": "Alarm",
  "domains.remote": "Remote",
  "domains.sun": "Sun",
  "domains.weather": "Weather",
  "device.on": "On",
  "device.off": "Off",
  "device.active": "Active",
  "device.inactive": "Inactive",
  "device.open": "Open",
  "device.closed": "Closed",
  "device.locked": "Locked",
  "device.unlocked": "Unlocked",
  "device.trancado": "Locked",
  "device.destrancado": "Unlocked",
  "device.playing": "Playing",
  "device.paused": "Paused",
  "device.online": "Online",
  "device.offline": "Offline",
  "device.unavailable": "Unavailable",
  "device.controlable": "Controllable",
  "device.sensors": "Sensors & Status",
  "device.current": "current",
  "control.brightness": "Brightness",
  "control.color": "Color",
  "control.temperature": "Temperature",
  "control.volume": "Volume",
  "control.playPause": "Play/Pause",
  "filter.allDevices": "All devices",
  "filter.selectOther": "Select another filter above to view your devices.",
  "clock.devicesOn": "{active} of {total} devices on",
  "sun.day": "Day (Above Horizon)",
  "sun.night": "Night (Below Horizon)",
  "sun.rise": "Sunrise",
  "sun.set": "Sunset",
  "actions.title": "Actions",
  "actions.description": "Actions executed automatically when a device changes state. Define each action's trigger (e.g., living room light turned on \u2192 send WhatsApp message).",
  "actions.addAction": "+ Add action",
  "actions.cancel": "Cancel",
  "actions.noAutomation": "No automations. Available fields:",
  "actions.noExtension": "No extension with actions installed",
  "actions.noDevice": "No devices in this category",
  "actions.trigger": "Trigger (when to run)",
  "actions.device": "Device",
  "actions.room": "Room",
  "actions.anyRoom": "Any",
  "actions.state": "State",
  "actions.anyState": "Any",
  "actions.anyStateHint": "Leave empty to run on any state change.",
  "actions.targetExt": "Target extension",
  "actions.actionLabel": "Action",
  "actions.prefilled": "(pre-filled)",
  "actions.useAction": "Use this action",
  "actions.saveChanges": "Save changes",
  "actions.when": "When:",
  "actions.close": "Close",
  "param.device": "Device",
  "param.action": "Action",
  "param.brightness": "Brightness",
  "param.color": "Color",
  "param.temperature": "Temperature",
  "param.domain": "Domain",
  "param.service": "Service",
  "param.data": "Data",
  "param.room": "Room",
  "param.camera": "Camera",
  "param.monitor": "Monitor",
  "param.label": "Label",
  "param.contact": "Contact or number",
  "param.message": "Message",
  "param.image": "Image",
  "tool.sendMessage": "Send message",
  "tool.controlDevice": "Control device",
  "tool.setLightColor": "Light color",
  "tool.controlTV": "TV control",
  "tool.controlClimate": "Climate control",
  "tool.haService": "Home service",
  "tool.listDevices": "List devices",
  "tool.queryDevice": "Query device",
  "tool.captureSnapshot": "Capture screenshot",
  "tool.startMonitoring": "Start monitoring",
  "tool.listContacts": "List contacts",
  "tool.getHistory": "History",
  "state.on": "On",
  "state.off": "Off",
  "placeholder.deviceName": "Device",
  "placeholder.deviceState": "State",
  "placeholder.deviceRoom": "Room",
  "placeholder.entityId": "Entity",
  "placeholder.image": "Image",
  "search.typeToSearch": "Type to search\u2026",
  "search.typeNameOrNumber": "Type name or number",
  "contextMenu.openControl": "Open control",
  "contextMenu.turnOff": "Turn off",
  "contextMenu.turnOn": "Turn on",
  "contextMenu.copyName": "Copy name",
  "contextMenu.copyEntityId": "Copy entity ID",
  "categories.lighting": "Lighting & RGB",
  "categories.climate": "Climate",
  "categories.locks": "Locks & Sensors",
  "categories.media": "Media & Smart TVs",
  "errors.connectFailed": "Failed to connect",
  "errors.disconnectFailed": "Failed to disconnect",
  "errors.reconnectFailed": "Failed to reconnect",
  "errors.serverUnavailable": "Server unavailable or offline",
  "remote.home": "Home Menu (Home)",
  "remote.inputs": "Video inputs (Outputs / HDMI / TV)",
  "remote.prev": "Previous track / Media back",
  "remote.playPause": "Pause/Start playback",
  "remote.next": "Next track / Media forward",
  "remote.play": "Start playback",
  "remote.pause": "Pause playback",
  "remote.back": "Back",
  "remote.youtube": "Open YouTube",
  "remote.powerOn": "Turn on TV",
  "remote.powerOff": "Turn off TV",
  "remote.mute": "Mute",
  "remote.unmute": "Unmute",
  "remote.volDown": "Decrease volume",
  "remote.volUp": "Increase volume",
  "remote.navUp": "Navigate up",
  "remote.navDown": "Navigate down",
  "remote.navLeft": "Navigate left",
  "remote.navRight": "Navigate right",
  "remote.confirm": "Confirm / OK",
  "remote.switchToInput": "Switch to input {src}",
  "remote.defaultRoom": "Living room",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Humidity",
  "weather.pressure": "Pressure",
  "weather.wind": "Wind",
  "weather.unknown": "unknown",
  "light.on": "Light on",
  "light.off": "Light off",
  "device.status": "Device Status",
  "device.statusOn": "Active / On",
  "device.statusOff": "Inactive / Off",
  "device.turnOn": "Turn On Device",
  "device.turnOff": "Turn Off Device",
  "device.humidity": "Humidity",
  "device.value": "Value",
  "device.noRoom": "Room",
  "color.warmOrange": "Warm Orange",
  "color.softAmber": "Soft Amber",
  "color.warmWhite": "Warm White",
  "color.pureWhite": "Pure White",
  "color.iceBlue": "Ice Blue",
  "color.softPurple": "Soft Purple",
  "color.pastelPink": "Pastel Pink",
  "color.coralRed": "Coral Red",
  "actions.edit": "Edit",
  "actions.remove": "Remove"
};

// src/i18n/locales/es.json
var es_default = {
  "panel.noDevice": "Ning\xFAn dispositivo seleccionado para mostrar.",
  "panel.timeout": "El servidor de MomAI no respondi\xF3 (timeout). Verifique si la app est\xE1 ejecut\xE1ndose.",
  "panel.networkError": "Error de red al comunicarse con el servidor",
  "panel.serviceError": "Error al ejecutar el servicio:",
  "connect.title": "Conectar a Home Assistant",
  "connect.description": "Ingrese la URL de su servidor Home Assistant y un Long-Lived Access Token.",
  "connect.urlLabel": "URL de Home Assistant",
  "connect.urlLabelAlt": "URL del Servidor",
  "connect.tokenLabel": "Long-Lived Access Token",
  "connect.showToken": "Mostrar token",
  "connect.hideToken": "Ocultar token",
  "connect.connecting": "Conectando...",
  "connect.connect": "Conectar",
  "connect.connectHA": "Conectar a Home Assistant",
  "connect.cancel": "Cancelar",
  "connect.disconnect": "Desconectar",
  "connect.reconnect": "Reconectar",
  "connect.syncing": "Sincronizando...",
  "connect.resync": "Resincronizar",
  "connect.tryReconnect": "Intentar Reconectar Ahora",
  "connect.tryReconnecting": "Intentando Reconectar...",
  "auth.subtitle": "Conecta tus dispositivos inteligentes a MomAI ingresando la direcci\xF3n de tu servidor local o remoto.",
  "auth.loading": "Cargando...",
  "status.connected": "Conectado",
  "status.disconnected": "Sin conexi\xF3n",
  "status.unavailable": "Home Assistant No Disponible",
  "status.unavailableSub": "No se pudo establecer conexi\xF3n con el servidor. Verifique que Home Assistant est\xE9 encendido y accesible en la red.",
  "status.autoSaved": "Guardado autom\xE1ticamente",
  "status.autoSavedHint": "Las acciones se guardan autom\xE1ticamente.",
  "status.saving": "Guardando\u2026",
  "status.saveError": "Error al guardar. Int\xE9ntelo de nuevo.",
  "status.loading": "Cargando\u2026",
  "domains.light": "Iluminaci\xF3n",
  "domains.switch": "Interruptor",
  "domains.fan": "Ventilador",
  "domains.cover": "Persiana",
  "domains.lock": "Cerradura",
  "domains.climate": "Climatizaci\xF3n",
  "domains.sensor": "Sensor",
  "domains.binarySensor": "Sensor Binario",
  "domains.mediaPlayer": "Medios / TV",
  "domains.camera": "C\xE1mara",
  "domains.vacuum": "Aspiradora",
  "domains.scene": "Escena",
  "domains.automation": "Automatizaci\xF3n",
  "domains.alarm": "Alarma",
  "domains.remote": "Control Remoto",
  "domains.sun": "Sol",
  "domains.weather": "Clima",
  "device.on": "Encendido",
  "device.off": "Apagado",
  "device.active": "Activo",
  "device.inactive": "Inactivo",
  "device.open": "Abierto",
  "device.closed": "Cerrado",
  "device.locked": "Bloqueado",
  "device.unlocked": "Desbloqueado",
  "device.trancado": "Trancado",
  "device.destrancado": "Destrancado",
  "device.playing": "Reproduciendo",
  "device.paused": "Pausado",
  "device.online": "En l\xEDnea",
  "device.offline": "Sin conexi\xF3n",
  "device.unavailable": "No disponible",
  "device.controlable": "Controlables",
  "device.sensors": "Sensores y Estado",
  "device.current": "actual",
  "control.brightness": "Brillo",
  "control.color": "Color",
  "control.temperature": "Temperatura",
  "control.volume": "Volumen",
  "control.playPause": "Reproducir/Pausar",
  "filter.allDevices": "Todos los dispositivos",
  "filter.selectOther": "Seleccione otro filtro arriba para ver sus dispositivos.",
  "clock.devicesOn": "{active} de {total} dispositivos encendidos",
  "sun.day": "D\xEDa (Sobre el Horizonte)",
  "sun.night": "Noche (Bajo el Horizonte)",
  "sun.rise": "Amanecer",
  "sun.set": "Atardecer",
  "actions.title": "Acciones",
  "actions.description": "Acciones ejecutadas autom\xE1ticamente cuando un dispositivo cambia de estado. Defina el disparador de cada acci\xF3n (ej.: luz de la sala encendida \u2192 enviar mensaje por WhatsApp).",
  "actions.addAction": "+ Agregar acci\xF3n",
  "actions.cancel": "Cancelar",
  "actions.noAutomation": "Sin automatizaciones. Campos disponibles:",
  "actions.noExtension": "Ninguna extensi\xF3n con acciones instalada",
  "actions.noDevice": "Sin dispositivos en esta categor\xEDa",
  "actions.trigger": "Disparador (cu\xE1ndo ejecutar)",
  "actions.device": "Dispositivo",
  "actions.room": "Habitaci\xF3n",
  "actions.anyRoom": "Cualquiera",
  "actions.state": "Estado",
  "actions.anyState": "Cualquiera",
  "actions.anyStateHint": "Deje vac\xEDo para ejecutar en cualquier cambio de estado.",
  "actions.targetExt": "Extensi\xF3n destino",
  "actions.actionLabel": "Acci\xF3n",
  "actions.prefilled": "(pre-rellenado)",
  "actions.useAction": "Usar esta acci\xF3n",
  "actions.saveChanges": "Guardar cambios",
  "actions.when": "Cuando:",
  "actions.close": "Cerrar",
  "param.device": "Dispositivo",
  "param.action": "Acci\xF3n",
  "param.brightness": "Brillo",
  "param.color": "Color",
  "param.temperature": "Temperatura",
  "param.domain": "Dominio",
  "param.service": "Servicio",
  "param.data": "Datos",
  "param.room": "Habitaci\xF3n",
  "param.camera": "C\xE1mara",
  "param.monitor": "Monitor",
  "param.label": "Etiqueta",
  "param.contact": "Contacto o n\xFAmero",
  "param.message": "Mensaje",
  "param.image": "Imagen",
  "tool.sendMessage": "Enviar mensaje",
  "tool.controlDevice": "Controlar dispositivo",
  "tool.setLightColor": "Color de luz",
  "tool.controlTV": "Control de TV",
  "tool.controlClimate": "Control de clima",
  "tool.haService": "Servicio del hogar",
  "tool.listDevices": "Listar dispositivos",
  "tool.queryDevice": "Consultar dispositivo",
  "tool.captureSnapshot": "Capturar pantalla",
  "tool.startMonitoring": "Iniciar monitoreo",
  "tool.listContacts": "Listar contactos",
  "tool.getHistory": "Historial",
  "state.on": "Encendido",
  "state.off": "Apagado",
  "placeholder.deviceName": "Dispositivo",
  "placeholder.deviceState": "Estado",
  "placeholder.deviceRoom": "Habitaci\xF3n",
  "placeholder.entityId": "Entidad",
  "placeholder.image": "Imagen",
  "search.typeToSearch": "Escriba para buscar\u2026",
  "search.typeNameOrNumber": "Escriba nombre o n\xFAmero",
  "contextMenu.openControl": "Abrir control",
  "contextMenu.turnOff": "Apagar",
  "contextMenu.turnOn": "Encender",
  "contextMenu.copyName": "Copiar nombre",
  "contextMenu.copyEntityId": "Copiar ID de entidad",
  "categories.lighting": "Iluminaci\xF3n y RGB",
  "categories.climate": "Climatizaci\xF3n",
  "categories.locks": "Cerraduras y Sensores",
  "categories.media": "Medios y Smart TVs",
  "errors.connectFailed": "Error al conectar",
  "errors.disconnectFailed": "Error al desconectar",
  "errors.reconnectFailed": "Error al reconectar",
  "errors.serverUnavailable": "Servidor no disponible o sin conexi\xF3n",
  "remote.home": "Men\xFA Inicio (Home)",
  "remote.inputs": "Entradas de video (Outputs / HDMI / TV)",
  "remote.prev": "Pista anterior / Retroceder",
  "remote.playPause": "Pausar/Iniciar reproducci\xF3n",
  "remote.next": "Pista siguiente / Avanzar",
  "remote.play": "Iniciar reproducci\xF3n",
  "remote.pause": "Pausar reproducci\xF3n",
  "remote.back": "Volver",
  "remote.youtube": "Abrir YouTube",
  "remote.powerOn": "Encender TV",
  "remote.powerOff": "Apagar TV",
  "remote.mute": "Silenciar",
  "remote.unmute": "Restaurar sonido",
  "remote.volDown": "Bajar volumen",
  "remote.volUp": "Subir volumen",
  "remote.navUp": "Navegar hacia arriba",
  "remote.navDown": "Navegar hacia abajo",
  "remote.navLeft": "Navegar a la izquierda",
  "remote.navRight": "Navegar a la derecha",
  "remote.confirm": "Confirmar / OK",
  "remote.switchToInput": "Cambiar a la entrada {src}",
  "remote.defaultRoom": "Sala",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Humedad",
  "weather.pressure": "Presi\xF3n",
  "weather.wind": "Viento",
  "weather.unknown": "desconocido",
  "light.on": "Luz encendida",
  "light.off": "Luz apagada",
  "device.status": "Estado del Dispositivo",
  "device.statusOn": "Activo / Encendido",
  "device.statusOff": "Inactivo / Apagado",
  "device.turnOn": "Encender Dispositivo",
  "device.turnOff": "Apagar Dispositivo",
  "device.humidity": "Humedad",
  "device.value": "Valor",
  "device.noRoom": "Habitaci\xF3n",
  "color.warmOrange": "Naranja C\xE1lido",
  "color.softAmber": "\xC1mbar Suave",
  "color.warmWhite": "Blanco C\xE1lido",
  "color.pureWhite": "Blanco Puro",
  "color.iceBlue": "Azul Hielo",
  "color.softPurple": "Morado Suave",
  "color.pastelPink": "Rosa Pastel",
  "color.coralRed": "Rojo Coral",
  "actions.edit": "Editar",
  "actions.remove": "Eliminar"
};

// src/i18n/locales/de.json
var de_default = {
  "panel.noDevice": "Kein Ger\xE4t zur Anzeige ausgew\xE4hlt.",
  "panel.timeout": "MomAI-Server hat nicht geantwortet (Timeout). Pr\xFCfe, ob die App l\xE4uft.",
  "panel.networkError": "Netzwerkfehler bei der Kommunikation mit dem Server",
  "panel.serviceError": "Fehler beim Ausf\xFChren des Dienstes:",
  "connect.title": "Mit Home Assistant verbinden",
  "connect.description": "Gib die URL deines Home Assistant-Servers und ein Long-Lived Access Token ein.",
  "connect.urlLabel": "Home Assistant-URL",
  "connect.urlLabelAlt": "Server-URL",
  "connect.tokenLabel": "Long-Lived Access Token",
  "connect.showToken": "Token anzeigen",
  "connect.hideToken": "Token ausblenden",
  "connect.connecting": "Verbinde...",
  "connect.connect": "Verbinden",
  "connect.connectHA": "Mit Home Assistant verbinden",
  "connect.cancel": "Abbrechen",
  "connect.disconnect": "Trennen",
  "connect.reconnect": "Erneut verbinden",
  "connect.syncing": "Synchronisiere...",
  "connect.resync": "Erneut synchronisieren",
  "connect.tryReconnect": "Jetzt erneut verbinden",
  "connect.tryReconnecting": "Verbinde erneut...",
  "auth.subtitle": "Verbinde deine Smart-Ger\xE4te mit MomAI, indem du die Adresse deines lokalen oder Remote-Servers eingibst.",
  "auth.loading": "L\xE4dt...",
  "status.connected": "Verbunden",
  "status.disconnected": "Offline",
  "status.unavailable": "Home Assistant nicht verf\xFCgbar",
  "status.unavailableSub": "Es konnte keine Verbindung zum Server hergestellt werden. Pr\xFCfe, ob Home Assistant eingeschaltet und im Netzwerk erreichbar ist.",
  "status.autoSaved": "Automatisch gespeichert",
  "status.autoSavedHint": "Aktionen werden automatisch gespeichert.",
  "status.saving": "Speichert\u2026",
  "status.saveError": "Fehler beim Speichern. Bitte versuche es erneut.",
  "status.loading": "L\xE4dt\u2026",
  "domains.light": "Beleuchtung",
  "domains.switch": "Schalter",
  "domains.fan": "Ventilator",
  "domains.cover": "Abdeckung",
  "domains.lock": "Schloss",
  "domains.climate": "Klima",
  "domains.sensor": "Sensor",
  "domains.binarySensor": "Bin\xE4rsensor",
  "domains.mediaPlayer": "Medien / TV",
  "domains.camera": "Kamera",
  "domains.vacuum": "Staubsauger",
  "domains.scene": "Szene",
  "domains.automation": "Automatisierung",
  "domains.alarm": "Alarm",
  "domains.remote": "Fernbedienung",
  "domains.sun": "Sonne",
  "domains.weather": "Wetter",
  "device.on": "Ein",
  "device.off": "Aus",
  "device.active": "Aktiv",
  "device.inactive": "Inaktiv",
  "device.open": "Offen",
  "device.closed": "Geschlossen",
  "device.locked": "Verriegelt",
  "device.unlocked": "Entriegelt",
  "device.trancado": "Verriegelt",
  "device.destrancado": "Entriegelt",
  "device.playing": "Wiedergabe",
  "device.paused": "Pausiert",
  "device.online": "Online",
  "device.offline": "Offline",
  "device.unavailable": "Nicht verf\xFCgbar",
  "device.controlable": "Steuerbar",
  "device.sensors": "Sensoren & Status",
  "device.current": "aktuell",
  "control.brightness": "Helligkeit",
  "control.color": "Farbe",
  "control.temperature": "Temperatur",
  "control.volume": "Lautst\xE4rke",
  "control.playPause": "Play/Pause",
  "filter.allDevices": "Alle Ger\xE4te",
  "filter.selectOther": "W\xE4hle oben einen anderen Filter, um deine Ger\xE4te anzuzeigen.",
  "clock.devicesOn": "{active} von {total} Ger\xE4ten eingeschaltet",
  "sun.day": "Tag (\xFCber dem Horizont)",
  "sun.night": "Nacht (unter dem Horizont)",
  "sun.rise": "Sonnenaufgang",
  "sun.set": "Sonnenuntergang",
  "actions.title": "Aktionen",
  "actions.description": "Aktionen, die automatisch ausgef\xFChrt werden, wenn ein Ger\xE4t seinen Zustand \xE4ndert. Lege den Ausl\xF6ser jeder Aktion fest (z. B. Wohnzimmerlicht eingeschaltet \u2192 WhatsApp-Nachricht senden).",
  "actions.addAction": "+ Aktion hinzuf\xFCgen",
  "actions.cancel": "Abbrechen",
  "actions.noAutomation": "Keine Automatisierungen. Verf\xFCgbare Felder:",
  "actions.noExtension": "Keine Erweiterung mit Aktionen installiert",
  "actions.noDevice": "Keine Ger\xE4te in dieser Kategorie",
  "actions.trigger": "Ausl\xF6ser (wann ausf\xFChren)",
  "actions.device": "Ger\xE4t",
  "actions.room": "Raum",
  "actions.anyRoom": "Beliebig",
  "actions.state": "Zustand",
  "actions.anyState": "Beliebig",
  "actions.anyStateHint": "Leer lassen, um bei jeder Zustands\xE4nderung auszuf\xFChren.",
  "actions.targetExt": "Zielerweiterung",
  "actions.actionLabel": "Aktion",
  "actions.prefilled": "(vorausgef\xFCllt)",
  "actions.useAction": "Diese Aktion verwenden",
  "actions.saveChanges": "\xC4nderungen speichern",
  "actions.when": "Wenn:",
  "actions.close": "Schlie\xDFen",
  "param.device": "Ger\xE4t",
  "param.action": "Aktion",
  "param.brightness": "Helligkeit",
  "param.color": "Farbe",
  "param.temperature": "Temperatur",
  "param.domain": "Dom\xE4ne",
  "param.service": "Dienst",
  "param.data": "Daten",
  "param.room": "Raum",
  "param.camera": "Kamera",
  "param.monitor": "Monitor",
  "param.label": "Bezeichnung",
  "param.contact": "Kontakt oder Nummer",
  "param.message": "Nachricht",
  "param.image": "Bild",
  "tool.sendMessage": "Nachricht senden",
  "tool.controlDevice": "Ger\xE4t steuern",
  "tool.setLightColor": "Lichtfarbe",
  "tool.controlTV": "TV-Steuerung",
  "tool.controlClimate": "Klimasteuerung",
  "tool.haService": "Home-Dienst",
  "tool.listDevices": "Ger\xE4te auflisten",
  "tool.queryDevice": "Ger\xE4t abfragen",
  "tool.captureSnapshot": "Screenshot aufnehmen",
  "tool.startMonitoring": "\xDCberwachung starten",
  "tool.listContacts": "Kontakte auflisten",
  "tool.getHistory": "Verlauf",
  "state.on": "Ein",
  "state.off": "Aus",
  "placeholder.deviceName": "Ger\xE4t",
  "placeholder.deviceState": "Zustand",
  "placeholder.deviceRoom": "Raum",
  "placeholder.entityId": "Entit\xE4t",
  "placeholder.image": "Bild",
  "search.typeToSearch": "Zum Suchen tippen\u2026",
  "search.typeNameOrNumber": "Name oder Nummer eingeben",
  "contextMenu.openControl": "Steuerung \xF6ffnen",
  "contextMenu.turnOff": "Ausschalten",
  "contextMenu.turnOn": "Einschalten",
  "contextMenu.copyName": "Namen kopieren",
  "contextMenu.copyEntityId": "Entit\xE4ts-ID kopieren",
  "categories.lighting": "Beleuchtung & RGB",
  "categories.climate": "Klima",
  "categories.locks": "Schl\xF6sser & Sensoren",
  "categories.media": "Medien & Smart-TVs",
  "errors.connectFailed": "Verbindung fehlgeschlagen",
  "errors.disconnectFailed": "Trennen fehlgeschlagen",
  "errors.reconnectFailed": "Erneutes Verbinden fehlgeschlagen",
  "errors.serverUnavailable": "Server nicht verf\xFCgbar oder offline",
  "remote.home": "Home-Men\xFC (Home)",
  "remote.inputs": "Videoeing\xE4nge (Outputs / HDMI / TV)",
  "remote.prev": "Vorheriger Titel / Medien zur\xFCck",
  "remote.playPause": "Wiedergabe pausieren/starten",
  "remote.next": "N\xE4chster Titel / Medien vor",
  "remote.play": "Wiedergabe starten",
  "remote.pause": "Wiedergabe pausieren",
  "remote.back": "Zur\xFCck",
  "remote.youtube": "YouTube \xF6ffnen",
  "remote.powerOn": "TV einschalten",
  "remote.powerOff": "TV ausschalten",
  "remote.mute": "Stummschalten",
  "remote.unmute": "Stummschaltung aufheben",
  "remote.volDown": "Lautst\xE4rke verringern",
  "remote.volUp": "Lautst\xE4rke erh\xF6hen",
  "remote.navUp": "Nach oben navigieren",
  "remote.navDown": "Nach unten navigieren",
  "remote.navLeft": "Nach links navigieren",
  "remote.navRight": "Nach rechts navigieren",
  "remote.confirm": "Best\xE4tigen / OK",
  "remote.switchToInput": "Zu Eingang {src} wechseln",
  "remote.defaultRoom": "Wohnzimmer",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Luftfeuchtigkeit",
  "weather.pressure": "Luftdruck",
  "weather.wind": "Wind",
  "weather.unknown": "unbekannt",
  "light.on": "Licht ein",
  "light.off": "Licht aus",
  "device.status": "Ger\xE4testatus",
  "device.statusOn": "Aktiv / Ein",
  "device.statusOff": "Inaktiv / Aus",
  "device.turnOn": "Ger\xE4t einschalten",
  "device.turnOff": "Ger\xE4t ausschalten",
  "device.humidity": "Luftfeuchtigkeit",
  "device.value": "Wert",
  "device.noRoom": "Raum",
  "color.warmOrange": "Warmes Orange",
  "color.softAmber": "Sanftes Bernstein",
  "color.warmWhite": "Warmwei\xDF",
  "color.pureWhite": "Reinwei\xDF",
  "color.iceBlue": "Eisblau",
  "color.softPurple": "Sanftes Violett",
  "color.pastelPink": "Pastellrosa",
  "color.coralRed": "Korallenrot",
  "actions.edit": "Bearbeiten",
  "actions.remove": "Entfernen"
};

// src/i18n/locales/fr.json
var fr_default = {
  "panel.noDevice": "Aucun appareil s\xE9lectionn\xE9 pour l'affichage.",
  "panel.timeout": "Le serveur MomAI n'a pas r\xE9pondu (d\xE9lai d\xE9pass\xE9). V\xE9rifiez que l'application est en cours d'ex\xE9cution.",
  "panel.networkError": "Erreur r\xE9seau lors de la communication avec le serveur",
  "panel.serviceError": "Erreur lors de l'ex\xE9cution du service :",
  "connect.title": "Se connecter \xE0 Home Assistant",
  "connect.description": "Saisissez l'URL de votre serveur Home Assistant et un jeton d'acc\xE8s longue dur\xE9e.",
  "connect.urlLabel": "URL de Home Assistant",
  "connect.urlLabelAlt": "URL du serveur",
  "connect.tokenLabel": "Jeton d'acc\xE8s longue dur\xE9e",
  "connect.showToken": "Afficher le jeton",
  "connect.hideToken": "Masquer le jeton",
  "connect.connecting": "Connexion...",
  "connect.connect": "Se connecter",
  "connect.connectHA": "Se connecter \xE0 Home Assistant",
  "connect.cancel": "Annuler",
  "connect.disconnect": "Se d\xE9connecter",
  "connect.reconnect": "Se reconnecter",
  "connect.syncing": "Synchronisation...",
  "connect.resync": "Resynchroniser",
  "connect.tryReconnect": "R\xE9essayer la connexion",
  "connect.tryReconnecting": "Tentative de reconnexion...",
  "auth.subtitle": "Connectez vos appareils intelligents \xE0 MomAI en saisissant l'adresse de votre serveur local ou distant.",
  "auth.loading": "Chargement...",
  "status.connected": "Connect\xE9",
  "status.disconnected": "Hors ligne",
  "status.unavailable": "Home Assistant indisponible",
  "status.unavailableSub": "Impossible d'\xE9tablir la connexion au serveur. V\xE9rifiez que Home Assistant est allum\xE9 et accessible sur le r\xE9seau.",
  "status.autoSaved": "Enregistr\xE9 automatiquement",
  "status.autoSavedHint": "Les actions sont enregistr\xE9es automatiquement.",
  "status.saving": "Enregistrement\u2026",
  "status.saveError": "Erreur d'enregistrement. Veuillez r\xE9essayer.",
  "status.loading": "Chargement\u2026",
  "domains.light": "\xC9clairage",
  "domains.switch": "Interrupteur",
  "domains.fan": "Ventilateur",
  "domains.cover": "Volet",
  "domains.lock": "Serrure",
  "domains.climate": "Climatisation",
  "domains.sensor": "Capteur",
  "domains.binarySensor": "Capteur binaire",
  "domains.mediaPlayer": "M\xE9dia / TV",
  "domains.camera": "Cam\xE9ra",
  "domains.vacuum": "Aspirateur",
  "domains.scene": "Sc\xE8ne",
  "domains.automation": "Automatisation",
  "domains.alarm": "Alarme",
  "domains.remote": "T\xE9l\xE9commande",
  "domains.sun": "Soleil",
  "domains.weather": "M\xE9t\xE9o",
  "device.on": "Allum\xE9",
  "device.off": "\xC9teint",
  "device.active": "Actif",
  "device.inactive": "Inactif",
  "device.open": "Ouvert",
  "device.closed": "Ferm\xE9",
  "device.locked": "Verrouill\xE9",
  "device.unlocked": "D\xE9verrouill\xE9",
  "device.trancado": "Verrouill\xE9",
  "device.destrancado": "D\xE9verrouill\xE9",
  "device.playing": "Lecture en cours",
  "device.paused": "En pause",
  "device.online": "En ligne",
  "device.offline": "Hors ligne",
  "device.unavailable": "Indisponible",
  "device.controlable": "Contr\xF4lable",
  "device.sensors": "Capteurs et \xE9tat",
  "device.current": "actuel",
  "control.brightness": "Luminosit\xE9",
  "control.color": "Couleur",
  "control.temperature": "Temp\xE9rature",
  "control.volume": "Volume",
  "control.playPause": "Lecture/Pause",
  "filter.allDevices": "Tous les appareils",
  "filter.selectOther": "S\xE9lectionnez un autre filtre ci-dessus pour voir vos appareils.",
  "clock.devicesOn": "{active} appareil(s) allum\xE9(s) sur {total}",
  "sun.day": "Jour (au-dessus de l'horizon)",
  "sun.night": "Nuit (sous l'horizon)",
  "sun.rise": "Lever du soleil",
  "sun.set": "Coucher du soleil",
  "actions.title": "Actions",
  "actions.description": "Actions ex\xE9cut\xE9es automatiquement lorsqu'un appareil change d'\xE9tat. D\xE9finissez le d\xE9clencheur de chaque action (ex. : lumi\xE8re du salon allum\xE9e \u2192 envoyer un message WhatsApp).",
  "actions.addAction": "+ Ajouter une action",
  "actions.cancel": "Annuler",
  "actions.noAutomation": "Aucune automatisation. Champs disponibles :",
  "actions.noExtension": "Aucune extension avec actions install\xE9e",
  "actions.noDevice": "Aucun appareil dans cette cat\xE9gorie",
  "actions.trigger": "D\xE9clencheur (quand ex\xE9cuter)",
  "actions.device": "Appareil",
  "actions.room": "Pi\xE8ce",
  "actions.anyRoom": "Toutes",
  "actions.state": "\xC9tat",
  "actions.anyState": "Tous",
  "actions.anyStateHint": "Laissez vide pour ex\xE9cuter \xE0 tout changement d'\xE9tat.",
  "actions.targetExt": "Extension cible",
  "actions.actionLabel": "Action",
  "actions.prefilled": "(pr\xE9-rempli)",
  "actions.useAction": "Utiliser cette action",
  "actions.saveChanges": "Enregistrer les modifications",
  "actions.when": "Quand :",
  "actions.close": "Fermer",
  "param.device": "Appareil",
  "param.action": "Action",
  "param.brightness": "Luminosit\xE9",
  "param.color": "Couleur",
  "param.temperature": "Temp\xE9rature",
  "param.domain": "Domaine",
  "param.service": "Service",
  "param.data": "Donn\xE9es",
  "param.room": "Pi\xE8ce",
  "param.camera": "Cam\xE9ra",
  "param.monitor": "Moniteur",
  "param.label": "Libell\xE9",
  "param.contact": "Contact ou num\xE9ro",
  "param.message": "Message",
  "param.image": "Image",
  "tool.sendMessage": "Envoyer un message",
  "tool.controlDevice": "Contr\xF4ler l'appareil",
  "tool.setLightColor": "Couleur de lumi\xE8re",
  "tool.controlTV": "Contr\xF4le TV",
  "tool.controlClimate": "Contr\xF4le du climat",
  "tool.haService": "Service maison",
  "tool.listDevices": "Lister les appareils",
  "tool.queryDevice": "Interroger l'appareil",
  "tool.captureSnapshot": "Capturer l'\xE9cran",
  "tool.startMonitoring": "D\xE9marrer la surveillance",
  "tool.listContacts": "Lister les contacts",
  "tool.getHistory": "Historique",
  "state.on": "Allum\xE9",
  "state.off": "\xC9teint",
  "placeholder.deviceName": "Appareil",
  "placeholder.deviceState": "\xC9tat",
  "placeholder.deviceRoom": "Pi\xE8ce",
  "placeholder.entityId": "Entit\xE9",
  "placeholder.image": "Image",
  "search.typeToSearch": "Tapez pour rechercher\u2026",
  "search.typeNameOrNumber": "Tapez un nom ou un num\xE9ro",
  "contextMenu.openControl": "Ouvrir le contr\xF4le",
  "contextMenu.turnOff": "\xC9teindre",
  "contextMenu.turnOn": "Allumer",
  "contextMenu.copyName": "Copier le nom",
  "contextMenu.copyEntityId": "Copier l'ID d'entit\xE9",
  "categories.lighting": "\xC9clairage et RVB",
  "categories.climate": "Climatisation",
  "categories.locks": "Serrures et capteurs",
  "categories.media": "M\xE9dias et Smart TV",
  "errors.connectFailed": "\xC9chec de la connexion",
  "errors.disconnectFailed": "\xC9chec de la d\xE9connexion",
  "errors.reconnectFailed": "\xC9chec de la reconnexion",
  "errors.serverUnavailable": "Serveur indisponible ou hors ligne",
  "remote.home": "Menu d'accueil (Home)",
  "remote.inputs": "Entr\xE9es vid\xE9o (Outputs / HDMI / TV)",
  "remote.prev": "Piste pr\xE9c\xE9dente / Retour m\xE9dia",
  "remote.playPause": "Mettre en pause/D\xE9marrer la lecture",
  "remote.next": "Piste suivante / Avancer",
  "remote.play": "D\xE9marrer la lecture",
  "remote.pause": "Mettre la lecture en pause",
  "remote.back": "Retour",
  "remote.youtube": "Ouvrir YouTube",
  "remote.powerOn": "Allumer le t\xE9l\xE9viseur",
  "remote.powerOff": "\xC9teindre le t\xE9l\xE9viseur",
  "remote.mute": "Couper le son",
  "remote.unmute": "R\xE9tablir le son",
  "remote.volDown": "Baisser le volume",
  "remote.volUp": "Augmenter le volume",
  "remote.navUp": "Naviguer vers le haut",
  "remote.navDown": "Naviguer vers le bas",
  "remote.navLeft": "Naviguer vers la gauche",
  "remote.navRight": "Naviguer vers la droite",
  "remote.confirm": "Confirmer / OK",
  "remote.switchToInput": "Basculer vers l'entr\xE9e {src}",
  "remote.defaultRoom": "Salon",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Humidit\xE9",
  "weather.pressure": "Pression",
  "weather.wind": "Vent",
  "weather.unknown": "inconnu",
  "light.on": "Lumi\xE8re allum\xE9e",
  "light.off": "Lumi\xE8re \xE9teinte",
  "device.status": "\xC9tat de l'appareil",
  "device.statusOn": "Actif / Allum\xE9",
  "device.statusOff": "Inactif / \xC9teint",
  "device.turnOn": "Allumer l'appareil",
  "device.turnOff": "\xC9teindre l'appareil",
  "device.humidity": "Humidit\xE9",
  "device.value": "Valeur",
  "device.noRoom": "Pi\xE8ce",
  "color.warmOrange": "Orange chaud",
  "color.softAmber": "Ambre doux",
  "color.warmWhite": "Blanc chaud",
  "color.pureWhite": "Blanc pur",
  "color.iceBlue": "Bleu glac\xE9",
  "color.softPurple": "Violet doux",
  "color.pastelPink": "Rose pastel",
  "color.coralRed": "Rouge corail",
  "actions.edit": "Modifier",
  "actions.remove": "Supprimer"
};

// src/i18n/locales/it.json
var it_default = {
  "panel.noDevice": "Nessun dispositivo selezionato per la visualizzazione.",
  "panel.timeout": "Il server MomAI non ha risposto (timeout). Verifica che l'app sia in esecuzione.",
  "panel.networkError": "Errore di rete nella comunicazione con il server",
  "panel.serviceError": "Errore durante l'esecuzione del servizio:",
  "connect.title": "Connetti a Home Assistant",
  "connect.description": "Inserisci l'URL del tuo server Home Assistant e un token di accesso a lunga durata.",
  "connect.urlLabel": "URL di Home Assistant",
  "connect.urlLabelAlt": "URL del server",
  "connect.tokenLabel": "Token di accesso a lunga durata",
  "connect.showToken": "Mostra token",
  "connect.hideToken": "Nascondi token",
  "connect.connecting": "Connessione...",
  "connect.connect": "Connetti",
  "connect.connectHA": "Connetti a Home Assistant",
  "connect.cancel": "Annulla",
  "connect.disconnect": "Disconnetti",
  "connect.reconnect": "Riconnetti",
  "connect.syncing": "Sincronizzazione...",
  "connect.resync": "Risincronizza",
  "connect.tryReconnect": "Riprova a connetterti ora",
  "connect.tryReconnecting": "Tentativo di riconnessione...",
  "auth.subtitle": "Collega i tuoi dispositivi smart a MomAI inserendo l'indirizzo del tuo server locale o remoto.",
  "auth.loading": "Caricamento...",
  "status.connected": "Connesso",
  "status.disconnected": "Offline",
  "status.unavailable": "Home Assistant non disponibile",
  "status.unavailableSub": "Impossibile stabilire la connessione al server. Verifica che Home Assistant sia acceso e raggiungibile in rete.",
  "status.autoSaved": "Salvato automaticamente",
  "status.autoSavedHint": "Le azioni vengono salvate automaticamente.",
  "status.saving": "Salvataggio\u2026",
  "status.saveError": "Errore di salvataggio. Riprova.",
  "status.loading": "Caricamento\u2026",
  "domains.light": "Illuminazione",
  "domains.switch": "Interruttore",
  "domains.fan": "Ventilatore",
  "domains.cover": "Tapparella",
  "domains.lock": "Serratura",
  "domains.climate": "Clima",
  "domains.sensor": "Sensore",
  "domains.binarySensor": "Sensore binario",
  "domains.mediaPlayer": "Media / TV",
  "domains.camera": "Fotocamera",
  "domains.vacuum": "Aspirapolvere",
  "domains.scene": "Scena",
  "domains.automation": "Automazione",
  "domains.alarm": "Allarme",
  "domains.remote": "Telecomando",
  "domains.sun": "Sole",
  "domains.weather": "Meteo",
  "device.on": "Acceso",
  "device.off": "Spento",
  "device.active": "Attivo",
  "device.inactive": "Inattivo",
  "device.open": "Aperto",
  "device.closed": "Chiuso",
  "device.locked": "Bloccato",
  "device.unlocked": "Sbloccato",
  "device.trancado": "Bloccato",
  "device.destrancado": "Sbloccato",
  "device.playing": "In riproduzione",
  "device.paused": "In pausa",
  "device.online": "Online",
  "device.offline": "Offline",
  "device.unavailable": "Non disponibile",
  "device.controlable": "Controllabile",
  "device.sensors": "Sensori e stato",
  "device.current": "attuale",
  "control.brightness": "Luminosit\xE0",
  "control.color": "Colore",
  "control.temperature": "Temperatura",
  "control.volume": "Volume",
  "control.playPause": "Play/Pausa",
  "filter.allDevices": "Tutti i dispositivi",
  "filter.selectOther": "Seleziona un altro filtro qui sopra per visualizzare i dispositivi.",
  "clock.devicesOn": "{active} di {total} dispositivi accesi",
  "sun.day": "Giorno (sopra l'orizzonte)",
  "sun.night": "Notte (sotto l'orizzonte)",
  "sun.rise": "Alba",
  "sun.set": "Tramonto",
  "actions.title": "Azioni",
  "actions.description": "Azioni eseguite automaticamente quando un dispositivo cambia stato. Definisci il trigger di ogni azione (es. luce del soggiorno accesa \u2192 invia messaggio WhatsApp).",
  "actions.addAction": "+ Aggiungi azione",
  "actions.cancel": "Annulla",
  "actions.noAutomation": "Nessuna automazione. Campi disponibili:",
  "actions.noExtension": "Nessuna estensione con azioni installata",
  "actions.noDevice": "Nessun dispositivo in questa categoria",
  "actions.trigger": "Trigger (quando eseguire)",
  "actions.device": "Dispositivo",
  "actions.room": "Stanza",
  "actions.anyRoom": "Qualsiasi",
  "actions.state": "Stato",
  "actions.anyState": "Qualsiasi",
  "actions.anyStateHint": "Lascia vuoto per eseguire a ogni cambio di stato.",
  "actions.targetExt": "Estensione di destinazione",
  "actions.actionLabel": "Azione",
  "actions.prefilled": "(precompilato)",
  "actions.useAction": "Usa questa azione",
  "actions.saveChanges": "Salva modifiche",
  "actions.when": "Quando:",
  "actions.close": "Chiudi",
  "param.device": "Dispositivo",
  "param.action": "Azione",
  "param.brightness": "Luminosit\xE0",
  "param.color": "Colore",
  "param.temperature": "Temperatura",
  "param.domain": "Dominio",
  "param.service": "Servizio",
  "param.data": "Dati",
  "param.room": "Stanza",
  "param.camera": "Fotocamera",
  "param.monitor": "Monitor",
  "param.label": "Etichetta",
  "param.contact": "Contatto o numero",
  "param.message": "Messaggio",
  "param.image": "Immagine",
  "tool.sendMessage": "Invia messaggio",
  "tool.controlDevice": "Controlla dispositivo",
  "tool.setLightColor": "Colore luce",
  "tool.controlTV": "Controllo TV",
  "tool.controlClimate": "Controllo clima",
  "tool.haService": "Servizio casa",
  "tool.listDevices": "Elenca dispositivi",
  "tool.queryDevice": "Interroga dispositivo",
  "tool.captureSnapshot": "Cattura schermata",
  "tool.startMonitoring": "Avvia monitoraggio",
  "tool.listContacts": "Elenca contatti",
  "tool.getHistory": "Cronologia",
  "state.on": "Acceso",
  "state.off": "Spento",
  "placeholder.deviceName": "Dispositivo",
  "placeholder.deviceState": "Stato",
  "placeholder.deviceRoom": "Stanza",
  "placeholder.entityId": "Entit\xE0",
  "placeholder.image": "Immagine",
  "search.typeToSearch": "Digita per cercare\u2026",
  "search.typeNameOrNumber": "Digita nome o numero",
  "contextMenu.openControl": "Apri controllo",
  "contextMenu.turnOff": "Spegni",
  "contextMenu.turnOn": "Accendi",
  "contextMenu.copyName": "Copia nome",
  "contextMenu.copyEntityId": "Copia ID entit\xE0",
  "categories.lighting": "Illuminazione e RGB",
  "categories.climate": "Clima",
  "categories.locks": "Serrature e sensori",
  "categories.media": "Media e Smart TV",
  "errors.connectFailed": "Connessione non riuscita",
  "errors.disconnectFailed": "Disconnessione non riuscita",
  "errors.reconnectFailed": "Riconnessione non riuscita",
  "errors.serverUnavailable": "Server non disponibile o offline",
  "remote.home": "Menu Home (Home)",
  "remote.inputs": "Ingressi video (Outputs / HDMI / TV)",
  "remote.prev": "Traccia precedente / Indietro",
  "remote.playPause": "Metti in pausa/Avvia riproduzione",
  "remote.next": "Traccia successiva / Avanti",
  "remote.play": "Avvia riproduzione",
  "remote.pause": "Metti in pausa",
  "remote.back": "Indietro",
  "remote.youtube": "Apri YouTube",
  "remote.powerOn": "Accendi TV",
  "remote.powerOff": "Spegni TV",
  "remote.mute": "Silenzia",
  "remote.unmute": "Riattiva audio",
  "remote.volDown": "Abbassa volume",
  "remote.volUp": "Alza volume",
  "remote.navUp": "Naviga verso l'alto",
  "remote.navDown": "Naviga verso il basso",
  "remote.navLeft": "Naviga a sinistra",
  "remote.navRight": "Naviga a destra",
  "remote.confirm": "Conferma / OK",
  "remote.switchToInput": "Passa all'ingresso {src}",
  "remote.defaultRoom": "Soggiorno",
  "remote.smartRemote": "Smart Remote",
  "weather.humidity": "Umidit\xE0",
  "weather.pressure": "Pressione",
  "weather.wind": "Vento",
  "weather.unknown": "sconosciuto",
  "light.on": "Luce accesa",
  "light.off": "Luce spenta",
  "device.status": "Stato dispositivo",
  "device.statusOn": "Attivo / Acceso",
  "device.statusOff": "Inattivo / Spento",
  "device.turnOn": "Accendi dispositivo",
  "device.turnOff": "Spegni dispositivo",
  "device.humidity": "Umidit\xE0",
  "device.value": "Valore",
  "device.noRoom": "Stanza",
  "color.warmOrange": "Arancione caldo",
  "color.softAmber": "Ambra tenue",
  "color.warmWhite": "Bianco caldo",
  "color.pureWhite": "Bianco puro",
  "color.iceBlue": "Blu ghiaccio",
  "color.softPurple": "Viola tenue",
  "color.pastelPink": "Rosa pastello",
  "color.coralRed": "Rosso corallo",
  "actions.edit": "Modifica",
  "actions.remove": "Rimuovi"
};

// src/i18n/index.tsx
var dictionaries = {
  "pt-BR": pt_BR_default,
  "en-US": en_US_default,
  es: es_default,
  de: de_default,
  fr: fr_default,
  it: it_default
};
var DEFAULT_LOCALE = "pt-BR";
function resolveBaseLocale(navLang) {
  const base = (navLang || "").split("-")[0].toLowerCase();
  if (base === "pt") return "pt-BR";
  if (base === "en") return "en-US";
  if (base === "es") return "es";
  if (base === "de") return "de";
  if (base === "fr") return "fr";
  if (base === "it") return "it";
  return DEFAULT_LOCALE;
}
function getInitialLocale() {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("momai_locale");
      if (saved && dictionaries[saved]) return saved;
      if (saved) return resolveBaseLocale(saved);
      const navLang = navigator?.language || "";
      if (navLang) return resolveBaseLocale(navLang);
    }
  } catch {
  }
  return DEFAULT_LOCALE;
}
var SmartHomeI18nContext = createContext({
  locale: DEFAULT_LOCALE,
  t: (key) => key
});
function SmartHomeI18nProvider({ children }) {
  const [locale, setLocale] = useState(getInitialLocale);
  useEffect(() => {
    const handler = (e) => {
      const ce = e;
      if (ce?.detail?.locale) setLocale(ce.detail.locale);
    };
    const storageHandler = (e) => {
      if (e.key === "momai_locale" && e.newValue) {
        setLocale(resolveBaseLocale(e.newValue));
      }
    };
    window.addEventListener("momai:locale-changed", handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("momai:locale-changed", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);
  const t = useCallback(
    (key, vars) => {
      const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE] || {};
      let text = dict[key] || dictionaries[DEFAULT_LOCALE]?.[key] || key;
      if (vars) {
        for (const [varKey, varValue] of Object.entries(vars)) {
          text = text.replaceAll(`{${varKey}}`, String(varValue));
        }
      }
      return text;
    },
    [locale]
  );
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return /* @__PURE__ */ React.createElement(SmartHomeI18nContext.Provider, { value }, children);
}
function useSmartHomeI18n() {
  return useContext(SmartHomeI18nContext);
}

// src/components/SvgIcons.tsx
import React2 from "react";
var SvgHome = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }), /* @__PURE__ */ React2.createElement("polyline", { points: "9 22 9 12 15 12 15 22" }));
var SvgLight = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M9 18h6" }), /* @__PURE__ */ React2.createElement("path", { d: "M10 22h4" }), /* @__PURE__ */ React2.createElement("path", { d: "M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.55.59 2.94 1.5 4 .76.76 1.23 1.52 1.41 2.5" }));
var SvgSwitch = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2v10" }), /* @__PURE__ */ React2.createElement("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }));
var SvgFan = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 9C10 3 6 4 6 7c0 3 4 5 6 2z" }), /* @__PURE__ */ React2.createElement("path", { d: "M15 12c6 2 5 6 2 6-3 0-5-4-2-6z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 15c2 6 6 5 6 2 0-3-4-5-6-2z" }), /* @__PURE__ */ React2.createElement("path", { d: "M9 12C3 10 4 6 7 6c3 0 5 4 2 6z" }));
var SvgCover = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2" }), /* @__PURE__ */ React2.createElement("line", { x1: "3", y1: "9", x2: "21", y2: "9" }), /* @__PURE__ */ React2.createElement("line", { x1: "3", y1: "15", x2: "21", y2: "15" }), /* @__PURE__ */ React2.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "21" }));
var SvgLock = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2", ry: "2" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }));
var SvgClimate = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" }));
var SvgSensor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("line", { x1: "18", y1: "20", x2: "18", y2: "10" }), /* @__PURE__ */ React2.createElement("line", { x1: "12", y1: "20", x2: "12", y2: "4" }), /* @__PURE__ */ React2.createElement("line", { x1: "6", y1: "20", x2: "6", y2: "14" }));
var SvgBinarySensor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M4.93 4.93a10 10 0 0 1 14.14 0" }), /* @__PURE__ */ React2.createElement("path", { d: "M7.76 7.76a6 6 0 0 1 8.48 0" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "2", fill: color }), /* @__PURE__ */ React2.createElement("path", { d: "M12 14v8" }));
var SvgTv = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "2", y: "7", width: "20", height: "13", rx: "2", ry: "2" }), /* @__PURE__ */ React2.createElement("polyline", { points: "17 2 12 7 7 2" }));
var SvgCamera = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "13", r: "4" }));
var SvgVacuum = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "9" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 3v3" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 18v3" }));
var SvgScene = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }));
var SvgAutomation = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" }));
var SvgAlarm = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }));
var SvgSun = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" }));
var SvgMoon = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" }));
var SvgWeather = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" }));
var SvgRemote = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "6", y: "2", width: "12", height: "20", rx: "4" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "7", r: "1.5" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "11", r: "1.5" }), /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "15", r: "1.5" }), /* @__PURE__ */ React2.createElement("line", { x1: "9", y1: "18", x2: "15", y2: "18" }));
var SvgDrop = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" }));
var SvgBattery = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "1", y: "6", width: "18", height: "12", rx: "2", ry: "2" }), /* @__PURE__ */ React2.createElement("line", { x1: "23", y1: "11", x2: "23", y2: "13" }), /* @__PURE__ */ React2.createElement("line", { x1: "5", y1: "10", x2: "13", y2: "10" }));
var SvgZap = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "13 2 3 14 12 14 11 22 21 10 12 10 13 2" }));
var SvgGauge = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2a10 10 0 1 0 10 10H12V2z" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 12L2.5 7.5" }));
var SvgMotion = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "5", r: "2" }), /* @__PURE__ */ React2.createElement("path", { d: "M14 10l-2-2-4 3 2 4 4-2" }), /* @__PURE__ */ React2.createElement("path", { d: "M8 21l3-6 3 2 2 4" }));
var SvgDoor = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M3 21h18" }), /* @__PURE__ */ React2.createElement("path", { d: "M6 21V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17" }), /* @__PURE__ */ React2.createElement("circle", { cx: "14", cy: "12", r: "1", fill: color }));
var SvgClock = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React2.createElement("polyline", { points: "12 6 12 12 16 14" }));
var SvgWind = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" }));
var SvgAlert = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" }), /* @__PURE__ */ React2.createElement("line", { x1: "12", y1: "9", x2: "12", y2: "13" }), /* @__PURE__ */ React2.createElement("line", { x1: "12", y1: "17", x2: "12.01", y2: "17", strokeWidth: "3" }));
var SvgSignal = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M2 20h.01", strokeWidth: "3" }), /* @__PURE__ */ React2.createElement("path", { d: "M7 20v-4" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 20v-8" }), /* @__PURE__ */ React2.createElement("path", { d: "M17 20v-12" }), /* @__PURE__ */ React2.createElement("path", { d: "M22 20V4" }));
var SvgSunrise = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2v6" }), /* @__PURE__ */ React2.createElement("path", { d: "M4.93 10.93l1.41 1.41" }), /* @__PURE__ */ React2.createElement("path", { d: "M17.66 12.34l1.41-1.41" }), /* @__PURE__ */ React2.createElement("path", { d: "M2 18h20" }), /* @__PURE__ */ React2.createElement("path", { d: "M20 18a8 8 0 1 0-16 0" }));
var SvgSunset = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 10v6" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 16l-3-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M12 16l3-3" }), /* @__PURE__ */ React2.createElement("path", { d: "M2 18h20" }), /* @__PURE__ */ React2.createElement("path", { d: "M20 18a8 8 0 1 0-16 0" }));
var SvgPlay = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "5 3 19 12 5 21 5 3" }));
var SvgPause = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React2.createElement("rect", { x: "6", y: "4", width: "4", height: "16", rx: "1" }), /* @__PURE__ */ React2.createElement("rect", { x: "14", y: "4", width: "4", height: "16", rx: "1" }));
var SvgPrev = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "19 20 9 12 19 4 19 20" }), /* @__PURE__ */ React2.createElement("line", { x1: "5", y1: "19", x2: "5", y2: "5", stroke: color, strokeWidth: "3", strokeLinecap: "round" }));
var SvgNext = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: color, stroke: "none", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "5 4 15 12 5 20 5 4" }), /* @__PURE__ */ React2.createElement("line", { x1: "19", y1: "5", x2: "19", y2: "19", stroke: color, strokeWidth: "3", strokeLinecap: "round" }));
var SvgMute = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React2.createElement("path", { d: "M15.54 8.46a5 5 0 0 1 0 7.07" }));
var SvgMuteStrikethrough = ({ size = 20, className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "#ef4444", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React2.createElement("line", { x1: "23", y1: "9", x2: "17", y2: "15" }), /* @__PURE__ */ React2.createElement("line", { x1: "17", y1: "9", x2: "23", y2: "15" }), /* @__PURE__ */ React2.createElement("line", { x1: "2", y1: "2", x2: "22", y2: "22", stroke: "#ef4444", strokeWidth: "2.5" }));
var SvgVolDown = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React2.createElement("line", { x1: "16", y1: "12", x2: "22", y2: "12" }));
var SvgVolUp = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polygon", { points: "11 5 6 9 2 9 2 15 6 15 11 19 11 5" }), /* @__PURE__ */ React2.createElement("path", { d: "M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" }));
var SvgPower = ({ size = 20, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("path", { d: "M12 2v10" }), /* @__PURE__ */ React2.createElement("path", { d: "M18.36 6.64a9 9 0 1 1-12.73 0" }));
var SvgBack = ({ size = 18, color = "currentColor", className = "", style }) => /* @__PURE__ */ React2.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round", className, style }, /* @__PURE__ */ React2.createElement("polyline", { points: "15 18 9 12 15 6" }));
var SvgYoutube = ({ style }) => /* @__PURE__ */ React2.createElement("svg", { width: "68", height: "30", viewBox: "0 0 120 60", style: { display: "block", borderRadius: "4px", ...style } }, /* @__PURE__ */ React2.createElement("rect", { width: "120", height: "60", rx: "8", fill: "white" }), /* @__PURE__ */ React2.createElement("g", { transform: "matrix(.223746 0 0 .223746 4.958506 17.693975)" }, /* @__PURE__ */ React2.createElement("path", { d: "M154.3 17.5c-1.8-6.7-7.1-12-13.8-13.8C128.4.4 79.7.4 79.7.4S31 .5 18.9 3.8c-6.7 1.8-12 7.1-13.8 13.8C1.9 29.7 1.9 55 1.9 55s0 25.3 3.3 37.5c1.8 6.7 7.1 12 13.8 13.8 12.1 3.3 60.8 3.3 60.8 3.3s48.7 0 60.8-3.3c6.7-1.8 12-7.1 13.8-13.8 3.3-12.1 3.3-37.5 3.3-37.5s-.1-25.3-3.4-37.5z", fill: "red" }), /* @__PURE__ */ React2.createElement("path", { d: "M104.6 55L64.2 31.6v46.8z", fill: "#fff" }), /* @__PURE__ */ React2.createElement("g", { fill: "#282828" }, /* @__PURE__ */ React2.createElement("path", { d: "M227.9 99.7c-3.1-2.1-5.3-5.3-6.6-9.7s-1.9-10.2-1.9-17.5v-9.9c0-7.3.7-13.3 2.2-17.7 1.5-4.5 3.8-7.7 7-9.7s7.3-3.1 12.4-3.1c5 0 9.1 1 12.1 3.1s5.3 5.3 6.7 9.7 2.1 10.3 2.1 17.6v9.9c0 7.3-.7 13.1-2.1 17.5s-3.6 7.6-6.7 9.7c-3.1 2-7.3 3.1-12.5 3.1-5.4.1-9.6-1-12.7-3zM245.2 89c.9-2.2 1.3-5.9 1.3-10.9V56.8c0-4.9-.4-8.5-1.3-10.7-.9-2.3-2.4-3.4-4.5-3.4s-3.5 1.1-4.4 3.4-1.3 5.8-1.3 10.7v21.3c0 5 .4 8.7 1.2 10.9s2.3 3.3 4.5 3.3c2.1 0 3.6-1.1 4.5-3.3zm219.2-16.3v3.5l.4 9.9c.3 2.2.8 3.8 1.6 4.8s2.1 1.5 3.8 1.5c2.3 0 3.9-.9 4.7-2.7.9-1.8 1.3-4.8 1.4-8.9l13.3.8c.1.6.1 1.4.1 2.4 0 6.3-1.7 11-5.2 14.1s-8.3 4.7-14.6 4.7c-7.6 0-12.9-2.4-15.9-7.1s-4.6-12.1-4.6-22V61.6c0-10.2 1.6-17.7 4.7-22.4 3.2-4.7 8.6-7.1 16.2-7.1 5.3 0 9.3 1 12.1 2.9s4.8 4.9 6 9 1.7 9.7 1.7 16.9v11.7h-25.7zm2-28.8c-.8 1-1.3 2.5-1.6 4.7s-.4 5.5-.4 10v4.9h11.2v-4.9c0-4.4-.1-7.7-.4-10s-.8-3.9-1.6-4.8-2-1.4-3.6-1.4c-1.7.1-2.9.6-3.6 1.5zM190.5 71.4L173 8.2h15.3l6.1 28.6c1.6 7.1 2.7 13.1 3.5 18h.4c.5-3.6 1.7-9.5 3.5-17.9l6.3-28.7h15.3l-17.7 63.1v30.3h-15.1V71.4z" }), /* @__PURE__ */ React2.createElement("path", { d: "M311.5 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z" }), /* @__PURE__ */ React2.createElement("path", { d: "M390.4 33.4v68.3h-12l-1.3-8.4h-.3c-3.3 6.3-8.2 9.5-14.7 9.5-4.5 0-7.9-1.5-10-4.5-2.2-3-3.2-7.6-3.2-13.9v-51h15.4v50.1c0 3 .3 5.2 1 6.5s1.8 1.9 3.3 1.9c1.3 0 2.6-.4 3.8-1.2s2.1-1.9 2.7-3.1V33.4z" }), /* @__PURE__ */ React2.createElement("path", { d: "M353.3 20.6H338v81.1h-15V20.6h-15.3V8.2h45.5v12.4zm87.9 23.7c-.9-4.3-2.4-7.4-4.5-9.4-2.1-1.9-4.9-2.9-8.6-2.9-2.8 0-5.5.8-7.9 2.4-2.5 1.6-4.3 3.7-5.7 6.3h-.1v-36h-14.8v96.9h12.7l1.6-6.5h.3c1.2 2.3 3 4.1 5.3 5.5a16.26 16.26 0 0 0 7.9 2c5.2 0 9-2.4 11.5-7.2 2.4-4.8 3.7-12.3 3.7-22.4V62.2c0-7.6-.5-13.6-1.4-17.9zm-14.1 27.9c0 5-.2 8.9-.6 11.7s-1.1 4.8-2.1 6-2.3 1.8-3.9 1.8c-1.3 0-2.6-.3-3.5-.9s-1.9-1.5-2.6-2.7V49.3c.5-1.9 1.4-3.4 2.7-4.6s2.6-1.8 4.1-1.8c1.6 0 2.8.6 3.6 1.8.9 1.2 1.4 3.3 1.8 6.2.3 2.9.5 7 .5 12.4z" }))));
var SvgColorWheel = ({ size = 22 }) => /* @__PURE__ */ React2.createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)", border: "2px solid rgba(255,255,255,0.8)", boxSizing: "border-box" } });
var SvgTemp = ({ size = 22 }) => /* @__PURE__ */ React2.createElement("div", { style: { width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg, #ff9e3b, #60a5fa)", border: "2px solid rgba(255,255,255,0.8)", boxSizing: "border-box" } });
function getDomainSvgIcon(domain, size = 20, color = "currentColor") {
  switch (domain.toLowerCase()) {
    case "light":
      return /* @__PURE__ */ React2.createElement(SvgLight, { size, color });
    case "switch":
      return /* @__PURE__ */ React2.createElement(SvgSwitch, { size, color });
    case "fan":
      return /* @__PURE__ */ React2.createElement(SvgFan, { size, color });
    case "cover":
      return /* @__PURE__ */ React2.createElement(SvgCover, { size, color });
    case "lock":
      return /* @__PURE__ */ React2.createElement(SvgLock, { size, color });
    case "climate":
      return /* @__PURE__ */ React2.createElement(SvgClimate, { size, color });
    case "sensor":
      return /* @__PURE__ */ React2.createElement(SvgSensor, { size, color });
    case "binary_sensor":
      return /* @__PURE__ */ React2.createElement(SvgBinarySensor, { size, color });
    case "media_player":
      return /* @__PURE__ */ React2.createElement(SvgTv, { size, color });
    case "camera":
      return /* @__PURE__ */ React2.createElement(SvgCamera, { size, color });
    case "vacuum":
      return /* @__PURE__ */ React2.createElement(SvgVacuum, { size, color });
    case "scene":
      return /* @__PURE__ */ React2.createElement(SvgScene, { size, color });
    case "automation":
      return /* @__PURE__ */ React2.createElement(SvgAutomation, { size, color });
    case "alarm_control_panel":
      return /* @__PURE__ */ React2.createElement(SvgAlarm, { size, color });
    case "sun":
      return /* @__PURE__ */ React2.createElement(SvgSun, { size, color });
    case "weather":
      return /* @__PURE__ */ React2.createElement(SvgWeather, { size, color });
    case "remote":
      return /* @__PURE__ */ React2.createElement(SvgRemote, { size, color });
    default:
      return /* @__PURE__ */ React2.createElement(SvgAutomation, { size, color });
  }
}
function getDynamicSvgIcon(device, size = 20, color = "currentColor") {
  const dc = (device.attributes?.deviceClass || device.state?.deviceClass || "").toLowerCase();
  const domain = device.domain.toLowerCase();
  const name = device.name.toLowerCase();
  if (dc === "temperature") return /* @__PURE__ */ React2.createElement(SvgClimate, { size, color });
  if (dc === "humidity" || dc === "moisture") return /* @__PURE__ */ React2.createElement(SvgDrop, { size, color });
  if (dc === "battery") return /* @__PURE__ */ React2.createElement(SvgBattery, { size, color });
  if (dc === "power" || dc === "energy" || dc === "voltage" || dc === "current") return /* @__PURE__ */ React2.createElement(SvgZap, { size, color });
  if (dc === "pressure") return /* @__PURE__ */ React2.createElement(SvgGauge, { size, color });
  if (dc === "illuminance") return /* @__PURE__ */ React2.createElement(SvgSun, { size, color });
  if (dc === "motion" || dc === "occupancy" || dc === "presence") return /* @__PURE__ */ React2.createElement(SvgMotion, { size, color });
  if (dc === "door" || dc === "window" || dc === "opening" || dc === "garage_door") return /* @__PURE__ */ React2.createElement(SvgDoor, { size, color });
  if (dc === "lock") return /* @__PURE__ */ React2.createElement(SvgLock, { size, color });
  if (dc === "timestamp" || dc === "date") return /* @__PURE__ */ React2.createElement(SvgClock, { size, color });
  if (dc === "speed" || dc === "wind_speed") return /* @__PURE__ */ React2.createElement(SvgWind, { size, color });
  if (dc === "gas" || dc === "co" || dc === "co2" || dc === "smoke") return /* @__PURE__ */ React2.createElement(SvgAlert, { size, color });
  if (dc === "signal_strength") return /* @__PURE__ */ React2.createElement(SvgSignal, { size, color });
  if (name.includes("amanhecer") || name.includes("dawn") || name.includes("nascer")) return /* @__PURE__ */ React2.createElement(SvgSunrise, { size, color });
  if (name.includes("anoitecer") || name.includes("dusk") || name.includes("p\xF4r") || name.includes("por do sol")) return /* @__PURE__ */ React2.createElement(SvgSunset, { size, color });
  if (name.includes("meio-dia") || name.includes("noon")) return /* @__PURE__ */ React2.createElement(SvgSun, { size, color });
  if (name.includes("meia-noite") || name.includes("midnight")) return /* @__PURE__ */ React2.createElement(SvgMoon, { size, color });
  if (name.includes("bateria") || name.includes("battery")) return /* @__PURE__ */ React2.createElement(SvgBattery, { size, color });
  if (name.includes("temp")) return /* @__PURE__ */ React2.createElement(SvgClimate, { size, color });
  if (name.includes("umidade") || name.includes("humidity")) return /* @__PURE__ */ React2.createElement(SvgDrop, { size, color });
  if (name.includes("vento") || name.includes("wind")) return /* @__PURE__ */ React2.createElement(SvgWind, { size, color });
  if (name.includes("pressao") || name.includes("press\xE3o")) return /* @__PURE__ */ React2.createElement(SvgGauge, { size, color });
  if (name.includes("luz") || name.includes("lamp") || name.includes("light")) return /* @__PURE__ */ React2.createElement(SvgLight, { size, color });
  if (name.includes("tv") || name.includes("televisao") || name.includes("television")) return /* @__PURE__ */ React2.createElement(SvgTv, { size, color });
  return getDomainSvgIcon(domain, size, color);
}

// src/components/DeviceControlContent.tsx
function volumeToPercent(volume) {
  if (volume === null || volume === void 0 || !Number.isFinite(volume)) return 0;
  return Math.max(0, Math.min(100, Math.round(volume * 100)));
}
var DOMAIN_KEYS = {
  light: "domains.light",
  switch: "domains.switch",
  fan: "domains.fan",
  cover: "domains.cover",
  lock: "domains.lock",
  climate: "domains.climate",
  sensor: "domains.sensor",
  binary_sensor: "domains.binarySensor",
  media_player: "domains.mediaPlayer",
  camera: "domains.camera",
  vacuum: "domains.vacuum",
  scene: "domains.scene",
  automation: "domains.automation",
  alarm_control_panel: "domains.alarm",
  remote: "domains.remote",
  sun: "domains.sun",
  weather: "domains.weather"
};
function getDomainLabel(domain, t) {
  const key = DOMAIN_KEYS[domain];
  return key ? t(key) : domain;
}
var CONTROLLABLE_DOMAINS_LIST = [
  "light",
  "switch",
  "fan",
  "cover",
  "lock",
  "climate",
  "media_player",
  "vacuum",
  "alarm_control_panel",
  "camera",
  "automation",
  "scene",
  "remote"
];
var CONTROLLABLE_DOMAINS = CONTROLLABLE_DOMAINS_LIST;
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    r = hue2rgb(h / 360 + 1 / 3);
    g = hue2rgb(h / 360);
    b = hue2rgb(h / 360 - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function ColorWheelPicker({ selectedHex, onChange }) {
  const wheelRef = useRef(null);
  const [handlePos, setHandlePos] = useState2({ x: 170, y: 170 });
  const handlePointer = (e) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    const radius = rect.width / 2;
    const dist = Math.min(radius - 12, Math.sqrt(x * x + y * y));
    const angle = Math.atan2(x, -y);
    const posX = centerX + dist * Math.sin(angle);
    const posY = centerY - dist * Math.cos(angle);
    setHandlePos({ x: posX, y: posY });
    let hue = (angle * (180 / Math.PI) + 360) % 360;
    let sat = dist / (radius - 12);
    const rgb = hslToRgb(hue, sat, 0.5);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    onChange(rgb, hex);
  };
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      ref: wheelRef,
      className: "sh-color-wheel",
      style: { WebkitAppRegion: "no-drag" },
      onPointerDown: handlePointer,
      onPointerMove: (e) => {
        if (e.buttons === 1) handlePointer(e);
      }
    },
    /* @__PURE__ */ React3.createElement("div", { className: "sh-color-wheel-handle", style: { left: `${handlePos.x}px`, top: `${handlePos.y}px` } })
  );
}
function DeviceControlCardContent({
  device,
  allDevices = [],
  onClose,
  onToggle,
  callServiceApi,
  isOverlay = false
}) {
  const { t } = useSmartHomeI18n();
  const [currentDevice, setCurrentDevice] = useState2(device);
  const isUserInteractingRef = React3.useRef(false);
  const brightnessRef = React3.useRef(currentDevice.state?.brightness ?? 94);
  const isOnRef = React3.useRef(Boolean(currentDevice.state?.on));
  const tempPctRef = React3.useRef(85);
  const selectedRgbHexRef = React3.useRef("#f97316");
  const interactionResetTimerRef = React3.useRef(null);
  React3.useEffect(() => {
    if (!isUserInteractingRef.current) {
      setCurrentDevice(device);
    }
  }, [device]);
  const effectiveAllDevices = React3.useMemo(() => {
    const list = [...allDevices || []];
    const rels = currentDevice.attributes?.relatedEntities || device.attributes?.relatedEntities || [];
    for (const r of rels) {
      if (r && r.id && !list.some((d) => d.id === r.id)) {
        list.push(r);
      }
    }
    return list;
  }, [allDevices, currentDevice, device]);
  const volumeDevice = currentDevice.domain === "media_player" ? currentDevice : effectiveAllDevices.find((candidate) => candidate.domain === "media_player" && (candidate.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim() || candidate.id === currentDevice.id)) || currentDevice;
  const [brightness, setBrightnessState] = useState2(currentDevice.state?.brightness ?? 94);
  const [tempPct, setTempPctState] = useState2(85);
  const [activeTab, setActiveTab] = useState2("brightness");
  const [selectedRgbHex, setSelectedRgbHex] = useState2("#f97316");
  const [isOn, setIsOn] = useState2(Boolean(currentDevice.state?.on));
  const [isPlaying, setIsPlaying] = useState2(true);
  const [isMuted, setIsMuted] = useState2(false);
  const [showInputSelector, setShowInputSelector] = useState2(false);
  const initialVolumePercent = volumeToPercent(volumeDevice.state?.volume);
  const [volumePercent, setVolumePercent] = useState2(initialVolumePercent);
  const volumePercentRef = useRef(initialVolumePercent);
  const [activeVolumeButton, setActiveVolumeButton] = useState2(null);
  const volumeFeedbackTimerRef = useRef(null);
  React3.useEffect(() => {
    if (isUserInteractingRef.current) return;
    if (currentDevice.state?.on !== void 0) {
      setIsOn(Boolean(currentDevice.state.on));
      isOnRef.current = Boolean(currentDevice.state.on);
    }
    if (currentDevice.state?.brightness != null) {
      setBrightnessState(currentDevice.state.brightness);
      brightnessRef.current = currentDevice.state.brightness;
    }
    if (currentDevice.state?.hexColor) {
      setSelectedRgbHex(currentDevice.state.hexColor);
      selectedRgbHexRef.current = currentDevice.state.hexColor;
    } else if (Array.isArray(currentDevice.state?.rgbColor) && currentDevice.state.rgbColor.length === 3) {
      const rgb = currentDevice.state.rgbColor;
      const hex = `#${rgb[0].toString(16).padStart(2, "0")}${rgb[1].toString(16).padStart(2, "0")}${rgb[2].toString(16).padStart(2, "0")}`;
      setSelectedRgbHex(hex);
      selectedRgbHexRef.current = hex;
    }
    if (currentDevice.state?.colorTempKelvin) {
      const pct = Math.max(0, Math.min(100, Math.round((6500 - currentDevice.state.colorTempKelvin) / (6500 - 2e3) * 100)));
      setTempPctState(pct);
      tempPctRef.current = pct;
    }
    if (currentDevice.domain === "media_player") {
      if (currentDevice.state?.isPlaying !== void 0) {
        setIsPlaying(currentDevice.state.isPlaying);
      } else if (currentDevice.state?.rawState) {
        setIsPlaying(currentDevice.state.rawState === "playing");
      }
      if (currentDevice.state?.isMuted !== void 0) {
        setIsMuted(Boolean(currentDevice.state.isMuted));
      }
    }
  }, [currentDevice]);
  React3.useEffect(() => {
    if (volumeDevice.state?.volume === null || volumeDevice.state?.volume === void 0) return;
    const nextVolumePercent = volumeToPercent(volumeDevice.state.volume);
    volumePercentRef.current = nextVolumePercent;
    setVolumePercent(nextVolumePercent);
  }, [volumeDevice.state?.volume]);
  React3.useEffect(() => {
    let eventSource = null;
    try {
      const sseUrl = `${getApiBaseUrl()}/extensions/events`;
      eventSource = new EventSource(sseUrl);
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "extension_event" && payload.eventType === "state_changed") {
            const updatedDevice = payload.data?.device;
            if (updatedDevice) {
              const isMatchCurrent = updatedDevice.id === currentDevice.id || updatedDevice.name.toLowerCase().trim() === currentDevice.name.toLowerCase().trim();
              const isMatchVolume = updatedDevice.id === volumeDevice.id || updatedDevice.name.toLowerCase().trim() === volumeDevice.name.toLowerCase().trim();
              if (isMatchCurrent) {
                if (!isUserInteractingRef.current) {
                  setCurrentDevice((prev) => ({
                    ...prev,
                    ...updatedDevice,
                    state: { ...prev.state, ...updatedDevice.state },
                    attributes: { ...prev.attributes, ...updatedDevice.attributes }
                  }));
                } else {
                  const sseBrightness = updatedDevice.state?.brightness;
                  const sseOn = updatedDevice.state?.on;
                  let confirmed = false;
                  if (sseBrightness != null && Math.abs(sseBrightness - brightnessRef.current) <= 1) {
                    confirmed = true;
                  }
                  if (sseOn !== void 0 && sseOn === isOnRef.current) {
                    confirmed = true;
                  }
                  if (confirmed) {
                    isUserInteractingRef.current = false;
                    if (interactionResetTimerRef.current) {
                      clearTimeout(interactionResetTimerRef.current);
                      interactionResetTimerRef.current = null;
                    }
                  }
                }
              }
              if (isMatchVolume && updatedDevice.state?.volume !== void 0 && updatedDevice.state.volume !== null) {
                const nextVol = volumeToPercent(updatedDevice.state.volume);
                setVolumePercent(nextVol);
                volumePercentRef.current = nextVol;
              }
            }
          }
        } catch (err) {
        }
      };
    } catch (err) {
    }
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [currentDevice.id, currentDevice.name, volumeDevice.id, volumeDevice.name]);
  React3.useEffect(() => {
    return () => {
      if (volumeFeedbackTimerRef.current) {
        clearTimeout(volumeFeedbackTimerRef.current);
      }
      if (interactionResetTimerRef.current) {
        clearTimeout(interactionResetTimerRef.current);
        interactionResetTimerRef.current = null;
      }
    };
  }, []);
  const COLOR_PRESETS = [
    { key: "color.warmOrange", color: "#f97316", rgb: [249, 115, 22] },
    { key: "color.softAmber", color: "#fed7aa", rgb: [254, 215, 170] },
    { key: "color.warmWhite", color: "#fef3c7", rgb: [254, 243, 199] },
    { key: "color.pureWhite", color: "#ffffff", rgb: [255, 255, 255] },
    { key: "color.iceBlue", color: "#60a5fa", rgb: [96, 165, 250] },
    { key: "color.softPurple", color: "#c084fc", rgb: [192, 132, 252] },
    { key: "color.pastelPink", color: "#f472b6", rgb: [244, 114, 182] },
    { key: "color.coralRed", color: "#f87171", rgb: [248, 113, 113] }
  ];
  function getApiBaseUrl() {
    if (typeof window !== "undefined" && window.api?.getApiBaseUrl) {
      return window.api.getApiBaseUrl();
    }
    return "http://127.0.0.1:8050";
  }
  function getSessionToken() {
    if (typeof window !== "undefined" && window.api?.getSessionToken) {
      return window.api.getSessionToken();
    }
    return "";
  }
  async function defaultCallService(domain, service, data = {}, providerType = "homeassistant") {
    const baseUrl = getApiBaseUrl();
    const token = getSessionToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 1e4);
    try {
      const res = await fetch(`${baseUrl}/extensions/momai-smarthome/command`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": token
        },
        body: JSON.stringify({
          toolName: "callService",
          args: { domain, service, data, providerType }
        }),
        signal: controller.signal
      });
      return await res.json();
    } catch (err) {
      console.error("[SmartHome] defaultCallService error:", err);
    } finally {
      clearTimeout(timer);
    }
  }
  const executeService = async (domain, service, data) => {
    if (callServiceApi) {
      try {
        console.log(`[SmartHome] executeService via callServiceApi: ${domain}/${service}`);
        const res = await callServiceApi(domain, service, data, "homeassistant");
        console.log("[SmartHome] executeService callServiceApi result:", JSON.stringify(res));
        if (res !== void 0) return res;
      } catch (err) {
        console.error("[SmartHome] callServiceApi failed:", err);
      }
    }
    const winApi = window.api;
    if (typeof winApi?.callService === "function") {
      try {
        console.log(`[SmartHome] executeService via winApi.callService: ${domain}/${service}`);
        const res = await winApi.callService(domain, service, data, "homeassistant");
        console.log("[SmartHome] executeService winApi result:", JSON.stringify(res));
        return res;
      } catch (err) {
        console.error("[SmartHome] window.api.callService failed:", err);
      }
    }
    console.log(`[SmartHome] executeService via defaultCallService: ${domain}/${service}`);
    return defaultCallService(domain, service, data, "homeassistant");
  };
  React3.useEffect(() => {
    if (device.domain !== "remote" && device.domain !== "media_player") return;
    let disposed = false;
    let syncing = false;
    let consecutiveErrors = 0;
    const syncVolumeFromHomeAssistant = async () => {
      if (syncing || disposed || consecutiveErrors >= 2) return;
      syncing = true;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4e3);
      try {
        const response = await fetch(`${getApiBaseUrl()}/extensions/momai-smarthome/command`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Session-Token": getSessionToken()
          },
          body: JSON.stringify({
            toolName: "getDeviceState",
            args: { deviceId: volumeDevice.id, providerType: "homeassistant" }
          }),
          signal: controller.signal
        });
        if (!response.ok) {
          consecutiveErrors++;
          return;
        }
        const result = await response.json();
        consecutiveErrors = 0;
        const refreshedDevice = result?.device;
        if (disposed || refreshedDevice?.state?.volume == null) {
          return;
        }
        const nextVolumePercent = volumeToPercent(refreshedDevice.state.volume);
        volumePercentRef.current = nextVolumePercent;
        setVolumePercent(nextVolumePercent);
      } catch (err) {
        consecutiveErrors++;
      } finally {
        clearTimeout(timer);
        syncing = false;
      }
    };
    void syncVolumeFromHomeAssistant();
    const intervalId = window.setInterval(syncVolumeFromHomeAssistant, 5e3);
    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, [device.domain, volumeDevice.id, volumeDevice.name]);
  const beginUserInteraction = () => {
    isUserInteractingRef.current = true;
    if (interactionResetTimerRef.current) {
      clearTimeout(interactionResetTimerRef.current);
    }
    interactionResetTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
      interactionResetTimerRef.current = null;
    }, 800);
  };
  const handleBrightnessChange = (pct) => {
    beginUserInteraction();
    setBrightnessState(pct);
    brightnessRef.current = pct;
    if (pct > 0 && !isOn) setIsOn(true);
    if (pct === 0 && isOn) setIsOn(false);
    executeService("light", "turn_on", {
      entity_id: device.id,
      brightness_pct: pct
    }).catch(() => {
      isUserInteractingRef.current = false;
    });
  };
  const handleTempSliderChange = (pct) => {
    beginUserInteraction();
    setTempPctState(pct);
    tempPctRef.current = pct;
    if (!isOn) setIsOn(true);
    const kelvinVal = Math.round(6500 - pct / 100 * (6500 - 2e3));
    executeService("light", "turn_on", {
      entity_id: device.id,
      color_temp_kelvin: kelvinVal
    }).catch(() => {
      isUserInteractingRef.current = false;
    });
  };
  const handleColorChange = (rgb, hex) => {
    beginUserInteraction();
    setSelectedRgbHex(hex);
    selectedRgbHexRef.current = hex;
    if (!isOn) setIsOn(true);
    executeService("light", "turn_on", {
      entity_id: device.id,
      rgb_color: rgb
    }).catch(() => {
      isUserInteractingRef.current = false;
    });
  };
  const toggleDomain = (() => {
    if (device.domain === "remote") return "remote";
    if (device.domain === "media_player") return "media_player";
    return device.domain === "light" || device.domain === "switch" || device.domain === "fan" ? device.domain : "light";
  })();
  const handleToggle = () => {
    const nextState = !isOn;
    beginUserInteraction();
    setIsOn(nextState);
    isOnRef.current = nextState;
    if (onToggle) {
      onToggle({ ...device, state: { ...device.state, on: nextState } });
    }
    const service = nextState ? "turn_on" : "turn_off";
    const related = device.attributes?.relatedEntities || [device];
    const promises = related.map((target) => {
      const targetDomain = target.domain === "remote" || target.domain === "media_player" || target.domain === "light" || target.domain === "switch" || target.domain === "fan" ? target.domain : toggleDomain;
      return executeService(targetDomain, service, { entity_id: target.id });
    });
    Promise.all(promises).catch(() => {
      isUserInteractingRef.current = false;
    });
  };
  const handleSendRemoteCommand = async (command) => {
    const targetId = device.id;
    const domain = device.domain;
    const cmdUpper = command.toUpperCase();
    if (cmdUpper === "PLAY" || cmdUpper === "PAUSE" || cmdUpper === "PLAY_PAUSE") {
      await executeService("media_player", "media_play_pause", { entity_id: targetId });
      return;
    }
    if (cmdUpper === "PREV" || cmdUpper === "PREVIOUS") {
      await executeService("media_player", "media_previous_track", { entity_id: targetId });
      return;
    }
    if (cmdUpper === "NEXT") {
      await executeService("media_player", "media_next_track", { entity_id: targetId });
      return;
    }
    if (cmdUpper === "YOUTUBE" || cmdUpper === "NETFLIX") {
      const sourceName = cmdUpper === "YOUTUBE" ? "YouTube" : "Netflix";
      const appId = cmdUpper === "YOUTUBE" ? "com.google.android.youtube.tv" : "com.netflix.ninja";
      const mediaPlayers = effectiveAllDevices.filter((d) => d.domain === "media_player");
      const mediaId = mediaPlayers.find((d) => d.state?.rawState !== "unavailable" && d.state?.volume != null)?.id || mediaPlayers.find((d) => d.state?.rawState !== "unavailable")?.id || volumeDevice?.id || targetId;
      const candidateRemote2 = effectiveAllDevices.find((d) => d.domain === "remote") || (targetId !== mediaId ? { id: targetId } : null);
      console.log(`[SmartHome] YouTube/Netflix: mediaId=${mediaId} candidateRemote=${candidateRemote2?.id} targetId=${targetId} allDomains=${effectiveAllDevices.map((d) => d.id).join(",")}`);
      try {
        console.log(`[SmartHome] YouTube/Netflix: trying media_player.play_media on ${mediaId}`);
        const res = await executeService("media_player", "play_media", {
          entity_id: mediaId,
          media_content_type: "app",
          media_content_id: appId
        });
        console.log("[SmartHome] YouTube/Netflix: media_player.play_media result:", JSON.stringify(res));
        if (res?.success !== false && res?.ok !== false) return;
      } catch (e) {
        console.log("[SmartHome] YouTube/Netflix: media_player.play_media threw:", e);
      }
      if (candidateRemote2) {
        try {
          console.log(`[SmartHome] YouTube/Netflix: trying remote.turn_on on ${candidateRemote2.id}`);
          const res = await executeService("remote", "turn_on", {
            entity_id: candidateRemote2.id,
            activity: appId
          });
          console.log("[SmartHome] YouTube/Netflix: remote.turn_on result:", JSON.stringify(res));
          if (res?.success !== false && res?.ok !== false) return;
        } catch (e) {
          console.log("[SmartHome] YouTube/Netflix: remote.turn_on threw:", e);
        }
      }
      try {
        console.log(`[SmartHome] YouTube/Netflix: trying media_player.select_source on ${mediaId}`);
        const res = await executeService("media_player", "select_source", { entity_id: mediaId, source: sourceName });
        console.log("[SmartHome] YouTube/Netflix: media_player.select_source result:", JSON.stringify(res));
        if (res?.success !== false && res?.ok !== false) return;
      } catch (e) {
        console.log("[SmartHome] YouTube/Netflix: media_player.select_source threw:", e);
      }
    }
    const inputActivityMap = {
      "TV": "passthrough://media_0",
      "TV1": "passthrough://media_0",
      "HDMI 1": "passthrough://media_1",
      "HDMI1": "passthrough://media_1",
      "HDMI 2": "passthrough://media_2",
      "HDMI2": "passthrough://media_2",
      "HDMI 3": "passthrough://media_3",
      "HDMI3": "passthrough://media_3",
      "AV": "passthrough://media_av"
    };
    const isTvCmd = cmdUpper === "TV" || cmdUpper === "TV1" || cmdUpper === "LIVE TV" || cmdUpper === "TV AO VIVO";
    const isInputCmd = Boolean(inputActivityMap[cmdUpper]) || isTvCmd;
    if (isInputCmd) {
      const act = inputActivityMap[cmdUpper] || "passthrough://media_0";
      try {
        await executeService("media_player", "select_source", { entity_id: targetId, source: command });
      } catch (e) {
      }
      if (isTvCmd) {
        const sourceList = device.attributes?.source_list || currentDevice.attributes?.source_list || [];
        const matchedSource = sourceList.find((s) => {
          const l = String(s).toLowerCase().trim();
          return l === "tv" || l === "live tv" || l === "tv ao vivo" || l === "dtv" || l === "tv/dtv" || l === "antenna" || l === "tuner" || l === "sintonizador";
        });
        if (matchedSource) {
          try {
            await executeService("media_player", "select_source", { entity_id: targetId, source: matchedSource });
          } catch (e) {
          }
        }
        try {
          await executeService("media_player", "play_media", {
            entity_id: targetId,
            media_content_type: "app",
            media_content_id: "com.tcl.tv"
          });
        } catch (e) {
        }
      }
      const chromecastMedia = effectiveAllDevices.find((d) => d.domain === "media_player" && d.id !== targetId);
      const targetMediaId = chromecastMedia ? chromecastMedia.id : targetId;
      try {
        await executeService("media_player", "play_media", {
          entity_id: targetMediaId,
          media_content_type: "app",
          media_content_id: act
        });
      } catch (e) {
      }
      try {
        await executeService("media_player", "play_media", {
          entity_id: targetId,
          media_content_type: "app",
          media_content_id: act
        });
      } catch (e) {
      }
      const candidateRemote2 = effectiveAllDevices.find((d) => d.domain === "remote");
      if (candidateRemote2) {
        try {
          await executeService("remote", "turn_on", {
            entity_id: candidateRemote2.id,
            activity: act
          });
        } catch (e) {
        }
      }
      const remoteTargetId2 = candidateRemote2?.id || (domain === "media_player" ? targetId.replace("media_player.", "remote.") : null);
      if (remoteTargetId2) {
        for (const inputCmd of ["TV_INPUT", "INPUT", "TV", "LIVE_TV"]) {
          try {
            await executeService("remote", "send_command", {
              entity_id: remoteTargetId2,
              command: [inputCmd]
            });
          } catch (e) {
          }
        }
      }
      return;
    }
    const androidTvCommandMap = {
      UP: ["DPAD_UP", "UP"],
      DOWN: ["DPAD_DOWN", "DOWN"],
      LEFT: ["DPAD_LEFT", "LEFT"],
      RIGHT: ["DPAD_RIGHT", "RIGHT"],
      ENTER: ["DPAD_CENTER", "ENTER", "OK"],
      BACK: ["BACK"],
      HOME: ["HOME"]
    };
    const candidates = androidTvCommandMap[cmdUpper] || [cmdUpper];
    const candidateRemote = effectiveAllDevices.find((d) => d.domain === "remote");
    const remoteTargetId = domain === "remote" ? targetId : candidateRemote?.id || (domain === "media_player" ? targetId.replace("media_player.", "remote.") : null);
    if (remoteTargetId) {
      for (const cmdCandidate of candidates) {
        try {
          const res = await executeService("remote", "send_command", {
            entity_id: remoteTargetId,
            command: [cmdCandidate]
          });
          if (res?.success !== false && res?.ok !== false) return;
        } catch (err) {
        }
      }
    }
    for (const cmdCandidate of candidates) {
      try {
        const res = await executeService("media_player", "play_media", {
          entity_id: targetId,
          media_content_type: "action",
          media_content_id: cmdCandidate
        });
        if (res?.success !== false && res?.ok !== false) return;
      } catch (e) {
      }
      try {
        const res = await executeService("media_player", "play_media", {
          entity_id: targetId,
          media_content_type: "key",
          media_content_id: cmdCandidate
        });
        if (res?.success !== false && res?.ok !== false) return;
      } catch (e) {
      }
    }
    for (const cmdCandidate of candidates) {
      try {
        await executeService("remote", "send_command", {
          entity_id: targetId,
          command: [cmdCandidate]
        });
        return;
      } catch (e) {
      }
    }
  };
  const handleSelectSource = async (source) => {
    setShowInputSelector(false);
    await handleSendRemoteCommand(source);
  };
  const handleVolumeChange = async (direction) => {
    const nextVolumePercent = Math.max(0, Math.min(100, volumePercentRef.current + (direction === "up" ? 1 : -1)));
    volumePercentRef.current = nextVolumePercent;
    setVolumePercent(nextVolumePercent);
    setActiveVolumeButton(direction);
    if (volumeFeedbackTimerRef.current) {
      clearTimeout(volumeFeedbackTimerRef.current);
    }
    volumeFeedbackTimerRef.current = setTimeout(() => setActiveVolumeButton(null), 1200);
    const volumeLevel = nextVolumePercent / 100;
    console.log(`[SmartHome] handleVolumeChange ${direction} -> ${nextVolumePercent}% device=${volumeDevice.id}`);
    let result = await executeService("media_player", "volume_set", { entity_id: volumeDevice.id, volume_level: volumeLevel });
    console.log("[SmartHome] handleVolumeChange volume_set result:", JSON.stringify(result));
    if (result && result.ok === false) {
      const service = direction === "up" ? "volume_up" : "volume_down";
      console.log("[SmartHome] handleVolumeChange: volume_set failed, trying", service);
      result = await executeService("media_player", service, { entity_id: volumeDevice.id });
      console.log("[SmartHome] handleVolumeChange fallback result:", JSON.stringify(result));
    }
    if (result && result.ok === false) {
      const revertedVolume = volumePercentRef.current - (direction === "up" ? 1 : -1);
      volumePercentRef.current = Math.max(0, Math.min(100, revertedVolume));
      setVolumePercent(volumePercentRef.current);
    }
  };
  const currentDynamicIcon = getDynamicSvgIcon(device, 20, "#ffffff");
  if (device.domain === "remote" || device.domain === "media_player") {
    const rawSources = device.attributes?.source_list || currentDevice.attributes?.source_list;
    const defaultSources = ["TV", "HDMI 1", "HDMI 2", "AV"];
    const baseSources = Array.isArray(rawSources) && rawSources.length > 0 ? rawSources : defaultSources;
    const inputSources = baseSources.filter((s) => {
      const lower = s.toLowerCase().trim();
      return lower !== "youtube" && lower !== "netflix";
    });
    return /* @__PURE__ */ React3.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        title: t("actions.close"),
        "aria-label": t("actions.close"),
        onClick: (e) => {
          e.stopPropagation();
          if (onClose) onClose();
        },
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
      },
      "\u2715"
    ), /* @__PURE__ */ React3.createElement("div", { className: "sh-modal-remote-content" }, /* @__PURE__ */ React3.createElement("div", { className: "sh-remote-header" }, /* @__PURE__ */ React3.createElement("span", { className: "sh-remote-pill-tag" }, t("remote.smartRemote")), /* @__PURE__ */ React3.createElement("h3", { className: "sh-remote-title" }, device.name), /* @__PURE__ */ React3.createElement("p", { className: "sh-remote-state" }, isOn ? `\u25CF ${t("device.on")}` : `\u25CB ${t("device.off")}`, " \u2022 ", device.room || t("remote.defaultRoom"))), /* @__PURE__ */ React3.createElement("div", { className: "sh-dpad-ring", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement("button", { className: "sh-dpad-btn up", title: t("remote.navUp"), "aria-label": t("remote.navUp"), onClick: () => handleSendRemoteCommand("UP") }, "\u25B2"), /* @__PURE__ */ React3.createElement("button", { className: "sh-dpad-btn down", title: t("remote.navDown"), "aria-label": t("remote.navDown"), onClick: () => handleSendRemoteCommand("DOWN") }, "\u25BC"), /* @__PURE__ */ React3.createElement("button", { className: "sh-dpad-btn left", title: t("remote.navLeft"), "aria-label": t("remote.navLeft"), onClick: () => handleSendRemoteCommand("LEFT") }, "\u25C0"), /* @__PURE__ */ React3.createElement("button", { className: "sh-dpad-btn right", title: t("remote.navRight"), "aria-label": t("remote.navRight"), onClick: () => handleSendRemoteCommand("RIGHT") }, "\u25B6"), /* @__PURE__ */ React3.createElement("button", { className: "sh-dpad-center", title: t("remote.confirm"), "aria-label": t("remote.confirm"), onClick: () => handleSendRemoteCommand("ENTER") }, "OK")), /* @__PURE__ */ React3.createElement("div", { className: "sh-remote-actions-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement("button", { className: "sh-remote-action-btn", title: t("remote.back"), "aria-label": t("remote.back"), onClick: () => handleSendRemoteCommand("BACK") }, /* @__PURE__ */ React3.createElement(SvgBack, { size: 18 })), /* @__PURE__ */ React3.createElement("button", { className: "sh-remote-action-btn", title: t("remote.home"), "aria-label": t("remote.home"), onClick: () => handleSendRemoteCommand("HOME") }, /* @__PURE__ */ React3.createElement(SvgHome, { size: 18 })), /* @__PURE__ */ React3.createElement("button", { className: `sh-remote-action-btn ${showInputSelector ? "active" : ""}`, title: t("remote.inputs"), "aria-label": t("remote.inputs"), onClick: () => setShowInputSelector(!showInputSelector) }, /* @__PURE__ */ React3.createElement(SvgTv, { size: 18 })), /* @__PURE__ */ React3.createElement("button", { className: "sh-remote-action-btn youtube-pill", title: t("remote.youtube"), "aria-label": t("remote.youtube"), onClick: () => handleSendRemoteCommand("YOUTUBE") }, /* @__PURE__ */ React3.createElement(SvgYoutube, null)), /* @__PURE__ */ React3.createElement("button", { className: `sh-remote-action-btn power ${isOn ? "active" : ""}`, title: isOn ? t("remote.powerOff") : t("remote.powerOn"), "aria-label": isOn ? t("remote.powerOff") : t("remote.powerOn"), onClick: handleToggle }, /* @__PURE__ */ React3.createElement(SvgPower, { size: 18, color: "#ffffff" }))), showInputSelector && /* @__PURE__ */ React3.createElement("div", { className: "sh-input-selector-popover", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement("div", { className: "sh-input-grid" }, inputSources.map((src) => /* @__PURE__ */ React3.createElement("button", { key: src, className: "sh-input-chip", title: t("remote.switchToInput", { src }), "aria-label": t("remote.switchToInput", { src }), onClick: () => handleSelectSource(src) }, /* @__PURE__ */ React3.createElement(SvgTv, { size: 14 }), " ", src)))), /* @__PURE__ */ React3.createElement("div", { className: "sh-remote-media-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement("button", { className: "sh-remote-icon-btn", title: t("remote.prev"), "aria-label": t("remote.prev"), onClick: () => handleSendRemoteCommand("PREV") }, /* @__PURE__ */ React3.createElement(SvgPrev, { size: 18 })), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-remote-icon-btn main",
        title: isPlaying ? t("remote.pause") : t("remote.play"),
        "aria-label": isPlaying ? t("remote.pause") : t("remote.play"),
        onClick: () => {
          setIsPlaying(!isPlaying);
          handleSendRemoteCommand(isPlaying ? "PAUSE" : "PLAY");
        }
      },
      isPlaying ? /* @__PURE__ */ React3.createElement(SvgPause, { size: 18, color: "#ffffff" }) : /* @__PURE__ */ React3.createElement(SvgPlay, { size: 18, color: "#ffffff" })
    ), /* @__PURE__ */ React3.createElement("button", { className: "sh-remote-icon-btn", title: t("remote.next"), "aria-label": t("remote.next"), onClick: () => handleSendRemoteCommand("NEXT") }, /* @__PURE__ */ React3.createElement(SvgNext, { size: 18 }))), /* @__PURE__ */ React3.createElement("div", { className: "sh-remote-vol-row", style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        title: isMuted ? t("remote.unmute") : t("remote.mute"),
        "aria-label": isMuted ? t("remote.unmute") : t("remote.mute"),
        onClick: () => {
          setIsMuted(!isMuted);
          executeService("media_player", "volume_mute", { entity_id: device.id, is_volume_muted: !isMuted });
        }
      },
      isMuted ? /* @__PURE__ */ React3.createElement(SvgMuteStrikethrough, { size: 18 }) : /* @__PURE__ */ React3.createElement(SvgMute, { size: 18 })
    ), /* @__PURE__ */ React3.createElement("div", { className: "sh-volume-control" }, /* @__PURE__ */ React3.createElement(
      "span",
      {
        className: `sh-volume-feedback ${activeVolumeButton === "down" ? "active" : ""}`,
        "aria-live": "polite"
      },
      volumePercent,
      "%"
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        title: t("remote.volDown"),
        "aria-label": t("remote.volDown"),
        onClick: () => handleVolumeChange("down")
      },
      /* @__PURE__ */ React3.createElement(SvgVolDown, { size: 18 })
    )), /* @__PURE__ */ React3.createElement("div", { className: "sh-volume-control" }, /* @__PURE__ */ React3.createElement(
      "span",
      {
        className: `sh-volume-feedback ${activeVolumeButton === "up" ? "active" : ""}`,
        "aria-live": "polite"
      },
      volumePercent,
      "%"
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-remote-icon-btn",
        title: t("remote.volUp"),
        "aria-label": t("remote.volUp"),
        onClick: () => handleVolumeChange("up")
      },
      /* @__PURE__ */ React3.createElement(SvgVolUp, { size: 18 })
    )))));
  }
  if (device.domain === "light") {
    return /* @__PURE__ */ React3.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        onClick: (e) => {
          e.stopPropagation();
          if (onClose) onClose();
        },
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
      },
      "\u2715"
    ), /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center", marginBottom: "16px" } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "12px", textTransform: "uppercase", color: "#38bdf8", fontWeight: 700, letterSpacing: "0.5px" } }, device.room || t("device.noRoom")), /* @__PURE__ */ React3.createElement("h2", { style: { fontSize: "20px", fontWeight: 800, color: "#fff", margin: "4px 0 0" } }, device.name)), /* @__PURE__ */ React3.createElement("div", { className: "sh-light-readout" }, isOn ? `${brightness}%` : t("state.off")), /* @__PURE__ */ React3.createElement("div", { className: "sh-light-subreadout" }, isOn ? t("light.on") : t("light.off")), activeTab === "brightness" && /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "sh-pill-slider-container",
        style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0,
        onClick: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const pct = Math.max(0, Math.min(100, Math.round((rect.height - clickY) / rect.height * 100)));
          handleBrightnessChange(pct);
        }
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          className: "sh-pill-slider-fill",
          style: {
            height: `${brightness}%`,
            background: isOn ? "linear-gradient(to top, #f59e0b, #fbbf24)" : "#334155"
          }
        },
        /* @__PURE__ */ React3.createElement("div", { className: "sh-pill-handle" })
      )
    ), activeTab === "color" && /* @__PURE__ */ React3.createElement("div", { style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0 }, /* @__PURE__ */ React3.createElement(ColorWheelPicker, { selectedHex: selectedRgbHex, onChange: handleColorChange }), /* @__PURE__ */ React3.createElement("div", { className: "sh-color-grid" }, COLOR_PRESETS.map((preset) => /* @__PURE__ */ React3.createElement(
      "button",
      {
        key: preset.key,
        className: "sh-color-circle",
        style: { background: preset.color },
        onClick: () => handleColorChange(preset.rgb, preset.color),
        title: t(preset.key)
      }
    )))), activeTab === "temp" && /* @__PURE__ */ React3.createElement(
      "div",
      {
        className: "sh-pill-slider-container",
        style: isOverlay ? { WebkitAppRegion: "no-drag" } : void 0,
        onClick: (e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          const pct = Math.max(0, Math.min(100, Math.round((rect.height - clickY) / rect.height * 100)));
          handleTempSliderChange(pct);
        }
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          className: "sh-pill-slider-fill",
          style: {
            height: `${tempPct}%`,
            background: "linear-gradient(to top, #ffffff 0%, #ffdfb8 40%, #ff8c00 100%)"
          }
        },
        /* @__PURE__ */ React3.createElement("div", { className: "sh-pill-handle" })
      )
    ), /* @__PURE__ */ React3.createElement("div", { className: "sh-light-ctrl-bar", style: isOverlay ? { WebkitAppRegion: "no-drag", pointerEvents: "auto" } : void 0 }, /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: `sh-light-ctrl-btn ${activeTab === "brightness" ? "active" : ""}`,
        onClick: () => setActiveTab("brightness"),
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto" }
      },
      /* @__PURE__ */ React3.createElement(SvgSun, { size: 20 })
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: `sh-light-ctrl-btn ${activeTab === "color" ? "active" : ""}`,
        onClick: () => setActiveTab("color"),
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto" }
      },
      /* @__PURE__ */ React3.createElement(SvgColorWheel, { size: 22 })
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: `sh-light-ctrl-btn ${activeTab === "temp" ? "active" : ""}`,
        onClick: () => setActiveTab("temp"),
        style: { WebkitAppRegion: "no-drag", pointerEvents: "auto" }
      },
      /* @__PURE__ */ React3.createElement(SvgTemp, { size: 22 })
    ), /* @__PURE__ */ React3.createElement(
      "button",
      {
        className: `sh-light-ctrl-btn ${isOn ? "active" : ""}`,
        onClick: handleToggle,
        style: {
          WebkitAppRegion: "no-drag",
          pointerEvents: "auto",
          ...isOn ? { background: "#ef4444", color: "#fff" } : {}
        }
      },
      /* @__PURE__ */ React3.createElement(SvgPower, { size: 20 })
    )));
  }
  return /* @__PURE__ */ React3.createElement("div", { className: "sh-modal-detail", style: isOverlay ? { WebkitAppRegion: "drag" } : void 0 }, /* @__PURE__ */ React3.createElement(
    "button",
    {
      className: "sh-modal-close-btn",
      onClick: (e) => {
        e.stopPropagation();
        if (onClose) onClose();
      },
      style: { WebkitAppRegion: "no-drag", pointerEvents: "auto", cursor: "pointer" }
    },
    "\u2715"
  ), /* @__PURE__ */ React3.createElement("div", { style: { textAlign: "center", marginBottom: "24px" } }, /* @__PURE__ */ React3.createElement("div", { className: "sh-icon", style: { width: "60px", height: "60px", borderRadius: "18px", margin: "0 auto 12px", fontSize: "28px" } }, currentDynamicIcon), /* @__PURE__ */ React3.createElement("h2", { style: { fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" } }, device.name), /* @__PURE__ */ React3.createElement("p", { style: { fontSize: "13px", color: "#94a3b8", margin: 0 } }, device.room ? `${device.room} \u2022 ` : "", getDomainLabel(device.domain, t))), /* @__PURE__ */ React3.createElement("div", { style: { background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "20px", marginBottom: "24px" } }, /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "12px" } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", color: "#94a3b8", fontWeight: 500 } }, t("device.status")), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", fontWeight: 700, color: isOn ? "#34d399" : "#f87171" } }, isOn ? t("device.statusOn") : t("device.statusOff"))), device.state?.temperature != null && /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, t("control.temperature")), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#38bdf8" } }, device.state.temperature, "\xB0C")), device.state?.humidity != null && /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center", marginBottom: "8px" } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, t("device.humidity")), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#38bdf8" } }, device.state.humidity, "%")), device.state?.value && /* @__PURE__ */ React3.createElement("div", { style: { display: "flex", justify: "space-between", alignItems: "center" } }, /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", color: "#94a3b8" } }, t("device.value")), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" } }, device.state.value, " ", device.state.unit || ""))), CONTROLLABLE_DOMAINS.includes(device.domain) && /* @__PURE__ */ React3.createElement(
    "button",
    {
      className: "sh-btn-primary",
      style: { width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: "15px" },
      onClick: handleToggle
    },
    /* @__PURE__ */ React3.createElement(SvgPower, { size: 18, color: "#ffffff" }),
    isOn ? t("device.turnOff") : t("device.turnOn")
  ));
}

// src/styles.ts
import React4 from "react";
var SMART_HOME_CSS = `
  @keyframes shFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes shPulseDot {
    0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
    70% { transform: scale(1.1); opacity: 0.8; box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
    100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  }

  @keyframes shSpin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .sh-spin {
    animation: shSpin 0.8s linear infinite;
  }

  html, body {
    margin: 0; padding: 0; height: 100%; overflow: hidden;
    background: transparent;
  }

  /* Extension Background: Inherits standard MomAI background cleanly */
  .sh-root {
    background: transparent;
    color: rgb(var(--text-primary, 235 235 240));
    height: 100vh; overflow-y: auto; overflow-x: hidden;
    padding: 24px 30px;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    box-sizing: border-box;
    animation: shFadeIn 0.25s ease-out;
  }

  .sh-root::-webkit-scrollbar {
    width: 6px;
  }
  .sh-root::-webkit-scrollbar-track {
    background: transparent;
  }
  .sh-root::-webkit-scrollbar-thumb {
    background: rgb(var(--text-muted, 160 165 175) / 0.2);
    border-radius: 9999px;
  }
  .sh-root::-webkit-scrollbar-thumb:hover {
    background: rgb(var(--text-muted, 160 165 175) / 0.35);
  }

  /* Seamless Header */
  .sh-header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px; flex-wrap: wrap; gap: 16px;
    padding: 0 2px;
  }

  .sh-header-left {
    display: flex; align-items: center; gap: 14px;
  }

  .sh-logo-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    display: flex; align-items: center; justify-content: center;
    color: rgb(var(--accent, 139 92 246));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .sh-title {
    font-size: 20px; font-weight: 700; color: rgb(var(--text-primary, 235 235 240));
    margin: 0; letter-spacing: -0.3px;
  }

  .sh-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

  .sh-btn {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    color: rgb(var(--text-primary, 235 235 240)); padding: 8px 16px; border-radius: 10px;
    font-size: 13px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; gap: 8px; white-space: nowrap;
    transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
  }
  .sh-btn:hover {
    background: rgb(var(--bg-input, 35 35 40));
    border-color: rgb(var(--border, 55 55 65) / 0.6);
    color: rgb(var(--text-primary, 235 235 240));
    transform: translateY(-1px);
  }

  .sh-btn-primary {
    background: #2563eb;
    border: none;
    color: #ffffff; padding: 11px 20px; border-radius: 12px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  }
  .sh-btn-primary:hover {
    background: #1d4ed8;
    box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4);
    transform: translateY(-1px);
  }

  .sh-btn-danger {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #ef4444;
  }
  .sh-btn-danger:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.35);
    color: #dc2626;
  }

  .sh-badge {
    display: flex; align-items: center; gap: 8px;
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    padding: 8px 16px; border-radius: 10px;
    font-size: 13px; color: rgb(var(--text-muted, 160 165 175)); font-weight: 500;
  }

  .sh-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #10b981;
    animation: shPulseDot 2s infinite ease-in-out;
  }
  .sh-dot.off {
    background: #ef4444;
    animation: none;
  }

  /* Compact Zero-Scroll Auth / Connection Screen */
  .sh-auth {
    display: flex; justify-content: center; align-items: center;
    min-height: calc(100vh - 48px); padding: 0;
  }

  .sh-auth-card {
    background: rgb(var(--bg-card, 25 25 30)) !important;
    backdrop-filter: blur(20px) !important;
    -webkit-backdrop-filter: blur(20px) !important;
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4) !important;
    border-radius: 26px; padding: 32px 36px; max-width: 780px; width: 100%;
    display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: center;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
    box-sizing: border-box; text-align: left;
  }

  @media (max-width: 720px) {
    .sh-auth-card {
      grid-template-columns: 1fr; gap: 20px; padding: 24px; max-width: 440px;
    }
  }

  .sh-auth-left {
    display: flex; flex-direction: column; justify-content: center;
  }

  .sh-auth-icon {
    width: 52px; height: 52px; margin: 0 0 16px;
    background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    border-radius: 16px; display: flex; align-items: center; justify-content: center;
    color: rgb(var(--accent, 139 92 246));
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  }

  .sh-auth-title {
    font-size: 22px; font-weight: 800; color: rgb(var(--text-primary, 235 235 240)); margin: 0 0 8px; letter-spacing: -0.4px;
  }

  .sh-auth-sub {
    font-size: 13px; color: rgb(var(--text-muted, 160 165 175)); line-height: 1.5; margin: 0 0 20px;
  }

  .sh-auth-feats-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }

  .sh-auth-feat-item {
    display: flex; align-items: center; gap: 8px;
    background: rgb(var(--bg-input, 35 35 40) / 0.5); border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    padding: 10px 12px; border-radius: 12px; font-size: 11.5px; color: rgb(var(--text-primary, 235 235 240)); font-weight: 500;
  }

  .sh-auth-feat-icon-box {
    width: 24px; height: 24px; border-radius: 7px;
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    display: flex; align-items: center; justify-content: center;
    color: rgb(var(--accent, 139 92 246)); flex-shrink: 0;
  }

  .sh-auth-form {
    display: flex; flex-direction: column; gap: 14px;
    background: rgb(var(--bg-input, 35 35 40) / 0.4); padding: 22px; border-radius: 20px;
    border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
  }

  .sh-auth-input-group {
    display: flex; flex-direction: column; gap: 6px;
  }

  .sh-auth-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; color: rgb(var(--text-primary, 235 235 240));
  }

  .sh-auth-input {
    width: 100%; background: rgb(var(--bg-main, 30 30 35) / 0.7);
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    border-radius: 10px; padding: 10px 14px; color: rgb(var(--text-primary, 235 235 240)); font-size: 13px;
    box-sizing: border-box; outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .sh-auth-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
  }

  /* Modals */
  .sh-modal-overlay {
    position: fixed; top:0; left:0; right:0; bottom:0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px;
    animation: shFadeIn 0.2s ease-out;
  }
  .sh-modal {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    border-radius: 24px; padding: 32px; max-width: 440px; width: 100%;
    box-shadow: 0 20px 50px rgba(0,0,0,0.25);
  }
  .sh-input {
    width: 100%; background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    border-radius: 10px; padding: 12px 16px; color: rgb(var(--text-primary, 235 235 240)); font-size: 14px;
    margin-top: 6px; box-sizing: border-box; outline: none;
    transition: border-color 0.15s;
  }
  .sh-input:focus { border-color: #2563eb; }
  .sh-label { display: block; font-size: 13px; font-weight: 600; color: rgb(var(--text-primary, 235 235 240)); margin-top: 16px; }

  /* Minimalist Filter Bar */
  .sh-chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 20px; scrollbar-width: none; }
  .sh-chip {
    display: flex; align-items: center; gap: 8px;
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    color: rgb(var(--text-muted, 160 165 175)); cursor: pointer; white-space: nowrap;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .sh-chip:hover {
    background: rgb(var(--bg-input, 35 35 40));
    border-color: rgb(var(--border, 55 55 65) / 0.6);
    color: rgb(var(--text-primary, 235 235 240));
  }
  .sh-chip.active {
    background: rgb(var(--accent, 139 92 246) / 0.15);
    border-color: rgb(var(--accent, 139 92 246) / 0.4);
    color: rgb(var(--accent, 139 92 246));
    font-weight: 600;
  }

  /* Cards Grid */
  .sh-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px; margin-bottom: 28px;
  }

  .sh-card {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.35) !important;
    border-radius: 20px; padding: 18px 20px; position: relative;
    display: flex; flex-direction: column; justify-content: space-between;
    min-height: 135px; cursor: pointer; box-sizing: border-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    transition: background 0.15s ease, transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .sh-card:hover {
    transform: translateY(-2px);
    background: rgb(var(--bg-card, 25 25 30));
    border-color: rgb(var(--border, 55 55 65) / 0.7) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  /* Active State */
  .sh-card.on {
    background: rgb(var(--bg-card, 25 25 30));
    border-color: rgb(var(--accent, 139 92 246) / 0.5) !important;
  }

  .sh-card-header { display: flex; justify-content: space-between; align-items: center; }
  .sh-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    display: flex; align-items: center; justify-content: center;
    color: rgb(var(--text-muted, 160 165 175)); transition: all 0.2s ease;
  }
  .sh-card.on .sh-icon {
    background: rgb(var(--accent, 139 92 246) / 0.18);
    border-color: rgb(var(--accent, 139 92 246) / 0.35);
    color: rgb(var(--accent, 139 92 246));
  }

  /* Custom Toggle Switch */
  .sh-toggle { position: relative; display: inline-block; width: 42px; height: 24px; }
  .sh-toggle input { opacity: 0; width: 0; height: 0; }
  .sh-slider {
    position: absolute; cursor: pointer; top:0; left:0; right:0; bottom:0;
    background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    transition: .2s ease;
    border-radius: 34px;
  }
  .sh-slider:before {
    position: absolute; content: ""; height: 18px; width: 18px; left: 2px; bottom: 2px;
    background: rgb(var(--text-muted, 160 165 175)); transition: .2s ease; border-radius: 50%;
  }
  input:checked + .sh-slider {
    background: rgb(var(--accent, 139 92 246));
    border-color: rgb(var(--accent, 139 92 246));
  }
  input:checked + .sh-slider:before { transform: translateX(18px); background: #ffffff; }

  .sh-body { margin-top: 14px; }
  .sh-name { font-size: 14.5px; font-weight: 600; color: rgb(var(--text-primary, 235 235 240)); margin: 0 0 3px; letter-spacing: -0.2px; }
  .sh-sub { font-size: 12px; color: rgb(var(--text-muted, 160 165 175)); margin: 0; }
  .sh-bar { margin-top: 12px; height: 6px; border-radius: 9999px; background: rgb(var(--bg-input, 35 35 40)); overflow: hidden; cursor: pointer; }
  .sh-fill { height: 100%; background: #2563eb; border-radius: 9999px; transition: width 0.15s; }
  .sh-temp { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
  .sh-temp-btn {
    width: 28px; height: 28px; border-radius: 8px;
    background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    color: rgb(var(--text-primary, 235 235 240)); font-size: 15px; font-weight: bold; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .sh-temp-btn:hover { background: rgb(var(--bg-card, 25 25 30)); }

  /* Subdued Widgets Section at Bottom */
  .sh-widgets-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-top: 28px;
    margin-bottom: 20px;
  }

  .sh-clock-card, .sh-sun-widget, .sh-weather-widget {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.35) !important;
    border-radius: 20px; padding: 20px 22px;
    display: flex; flex-direction: column; justify-content: space-between;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  }
  .sh-clock-time { font-size: 34px; font-weight: 800; color: rgb(var(--text-primary, 235 235 240)); letter-spacing: -0.5px; line-height: 1; margin-bottom: 6px; }
  .sh-clock-date { font-size: 13px; font-weight: 500; color: rgb(var(--text-muted, 160 165 175)); display: flex; align-items: center; gap: 6px; }

  .sh-sun-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .sh-sun-badge { display: flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 600; color: rgb(var(--text-primary, 235 235 240)); }
  .sh-sun-elevation { font-size: 11px; color: rgb(var(--text-muted, 160 165 175)); background: rgb(var(--bg-input, 35 35 40)); padding: 3px 8px; border-radius: 6px; font-weight: 600; }
  .sh-sun-arc-container { display: flex; justify-content: center; margin: 2px 0; }
  .sh-sun-arc-svg { width: 100%; max-width: 190px; height: 60px; }
  .sh-sun-times { display: flex; justify-around: space-around; background: rgb(var(--bg-input, 35 35 40) / 0.5); padding: 8px 12px; border-radius: 10px; margin-top: 6px; }
  .sh-sun-time-box { display: flex; flex-direction: column; align-items: center; }
  .sh-sun-time-label { font-size: 10.5px; color: rgb(var(--text-muted, 160 165 175)); margin-bottom: 2px; display: flex; align-items: center; gap: 4px; }
  .sh-sun-time-val { font-size: 13px; font-weight: 700; color: rgb(var(--text-primary, 235 235 240)); }

  .sh-weather-main { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
  .sh-weather-icon { width: 40px; height: 40px; border-radius: 12px; background: rgb(var(--bg-input, 35 35 40)); display: flex; align-items: center; justify-content: center; color: rgb(var(--accent, 139 92 246)); }
  .sh-weather-name { font-size: 14.5px; font-weight: 600; color: rgb(var(--text-primary, 235 235 240)); margin: 0 0 2px; }
  .sh-weather-state { font-size: 10.5px; color: rgb(var(--accent, 139 92 246)); margin: 0; font-weight: 600; letter-spacing: 0.5px; }
  .sh-weather-temp { margin-left: auto; font-size: 24px; font-weight: 800; color: rgb(var(--text-primary, 235 235 240)); }
  .sh-weather-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: rgb(var(--bg-input, 35 35 40) / 0.5); padding: 8px 10px; border-radius: 10px; }
  .sh-weather-detail { display: flex; flex-direction: column; align-items: center; font-size: 10px; color: rgb(var(--text-muted, 160 165 175)); }
  .sh-weather-detail-label { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
  .sh-weather-detail strong { color: rgb(var(--text-primary, 235 235 240)); font-size: 12px; }

  .sh-empty {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.35) !important;
    border-radius: 20px; padding: 48px 24px; text-align: center; margin-bottom: 28px;
  }
  .sh-empty-icon {
    width: 52px; height: 52px; border-radius: 14px; background: rgb(var(--bg-input, 35 35 40));
    display: flex; align-items: center; justify-content: center; color: rgb(var(--text-muted, 160 165 175)); margin: 0 auto 14px;
  }

  /* Modal Details & Remote Controls */
  .sh-modal-detail {
    background: rgb(var(--bg-card, 25 25 30));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4) !important;
    border-radius: 28px; padding: 22px 18px;
    max-width: 100%; width: 100%; height: 100%; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    position: relative; box-sizing: border-box;
    display: flex; flex-direction: column; justify-content: space-between; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  }
  .sh-modal-close-btn {
    position: absolute; top: 16px; right: 16px;
    background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    color: rgb(var(--text-primary, 235 235 240)); width: 34px; height: 34px; border-radius: 50%;
    cursor: pointer !important; display: flex; align-items: center; justify-content: center;
    -webkit-app-region: no-drag !important;
    z-index: 99999 !important;
    pointer-events: auto !important;
    transition: background 0.15s, color 0.15s, transform 0.15s;
  }
  .sh-modal-close-btn:hover {
    background: rgba(239, 68, 68, 0.8) !important;
    color: #ffffff !important;
    transform: scale(1.08);
  }
  .sh-light-readout { font-size: 38px; font-weight: 800; color: rgb(var(--text-primary, 235 235 240)); text-align: center; margin-top: 8px; line-height: 1; letter-spacing: -1px; }
  .sh-light-subreadout { font-size: 13px; color: rgb(var(--text-muted, 160 165 175)); text-align: center; margin-bottom: 16px; font-weight: 500; margin-top: 4px; }

  .sh-pill-slider-container {
    width: 112px; height: 210px; border-radius: 56px; background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    margin: 0 auto 16px; position: relative; overflow: hidden; cursor: pointer;
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-pill-slider-fill {
    position: absolute; bottom: 0; left: 0; right: 0; border-radius: 0 0 56px 56px; transition: height 0.15s ease-out, background 0.2s; display: flex; justify-content: center; align-items: flex-start;
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-pill-handle { width: 32px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 9999px; margin-top: 10px; -webkit-app-region: no-drag !important; }

  .sh-light-ctrl-bar {
    display: flex; justify-content: center; align-items: center; gap: 8px;
    background: rgb(var(--bg-input, 35 35 40)); padding: 5px 12px; border-radius: 9999px;
    margin: 0 auto 8px; width: fit-content;
    border: 1px solid rgb(var(--border, 55 55 65) / 0.3);
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-light-ctrl-btn {
    width: 40px; height: 40px; border-radius: 50%; border: none; background: transparent; color: rgb(var(--text-muted, 160 165 175)); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-light-ctrl-btn.active { background: rgb(var(--bg-card, 25 25 30)); color: rgb(var(--text-primary, 235 235 240)); }
  .sh-light-ctrl-btn svg { pointer-events: none; }

  .sh-color-wheel {
    width: 200px; height: 200px; border-radius: 50%; margin: 4px auto 14px; position: relative;
    background: conic-gradient(red, yellow, lime, cyan, blue, magenta, red);
    mask-image: radial-gradient(circle, #fff 100%, transparent 100%);
    cursor: crosshair; touch-action: none;
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-color-wheel::after {
    content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%);
    -webkit-app-region: no-drag !important;
  }
  .sh-color-wheel-handle {
    position: absolute; width: 24px; height: 24px; border-radius: 50%; border: 2px solid #ffffff; transform: translate(-50%, -50%); pointer-events: none; z-index: 10; background: rgba(255,255,255,0.3);
  }
  .sh-color-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-width: 250px; margin: 0 auto; justify-items: center; -webkit-app-region: no-drag !important; }
  .sh-color-circle { width: 46px; height: 46px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-color-circle:hover { transform: scale(1.06); border-color: rgba(255,255,255,0.8); }

  .sh-remote-header { margin-bottom: 18px; }
  .sh-remote-pill-tag { display: inline-block; font-size: 11px; font-weight: 700; color: rgb(var(--accent, 139 92 246)); background: rgb(var(--accent, 139 92 246) / 0.15); padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .sh-remote-title { font-size: 21px; font-weight: 800; color: rgb(var(--text-primary, 235 235 240)); margin: 0 0 4px; }
  .sh-remote-state { font-size: 12px; color: rgb(var(--text-muted, 160 165 175)); margin: 0; font-weight: 500; }

  .sh-dpad-ring {
    width: 185px; height: 185px; border-radius: 50%; background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.3); margin: 0 auto 22px; position: relative; display: flex; align-items: center; justify-content: center;
    -webkit-app-region: no-drag !important; pointer-events: auto !important;
  }
  .sh-dpad-btn { position: absolute; background: none; border: none; color: rgb(var(--text-primary, 235 235 240)); font-size: 14px; cursor: pointer; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), color 0.1s ease, filter 0.1s ease; border-radius: 50%; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-dpad-btn:hover { color: #2563eb; transform: scale(1.18); }
  .sh-dpad-btn:active { color: #1d4ed8; transform: scale(0.88); filter: brightness(0.8); }
  .sh-dpad-btn.up { top: 4px; }
  .sh-dpad-btn.down { bottom: 4px; }
  .sh-dpad-btn.left { left: 4px; }
  .sh-dpad-btn.right { right: 4px; }
  .sh-dpad-center { width: 70px; height: 70px; border-radius: 50%; background: rgb(var(--bg-card, 25 25 30)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4); color: rgb(var(--text-primary, 235 235 240)); font-size: 14.5px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-dpad-center:hover { background: #2563eb; color: #fff; transform: scale(1.05); }
  .sh-dpad-center:active { transform: scale(0.90) translateY(2px); background: #1d4ed8; }

  .sh-remote-actions-row { display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 18px; flex-wrap: nowrap; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-remote-action-btn { width: 42px; height: 42px; border-radius: 50%; background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4); color: rgb(var(--text-primary, 235 235 240)); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, box-shadow 0.1s ease, filter 0.1s ease; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-remote-action-btn:hover { transform: scale(1.08); background: rgb(var(--bg-card, 25 25 30)); }
  .sh-remote-action-btn:hover, .sh-remote-action-btn.active { background: #2563eb; color: #fff; }
  .sh-remote-action-btn:active { transform: scale(0.88) translateY(2px); }
  .sh-remote-action-btn.youtube-pill { width: auto; height: 42px; padding: 0 10px; border-radius: 10px; background: #ffffff; border: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s ease, filter 0.1s ease; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-remote-action-btn.youtube-pill:hover { transform: scale(1.06); }
  .sh-remote-action-btn.power { background: #ef4444 !important; color: #ffffff !important; border: none !important; }
  .sh-remote-action-btn.power:hover { transform: scale(1.08); background: #dc2626 !important; }

  .sh-input-selector-popover { background: rgb(var(--bg-card, 25 25 30)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4) !important; border-radius: 16px; padding: 12px; margin: 0 auto 18px; max-width: 310px; box-shadow: 0 10px 24px rgba(0,0,0,0.25); animation: shFadeIn 0.2s ease-out; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; -webkit-app-region: no-drag !important; }
  .sh-input-chip { background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4); border-radius: 10px; padding: 10px 8px; color: rgb(var(--text-primary, 235 235 240)); font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-input-chip:hover { background: #2563eb; color: #fff; transform: scale(1.03); }

  .sh-remote-media-row, .sh-remote-vol-row { display: flex; justify-content: center; gap: 10px; margin-bottom: 10px; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-volume-control { position: relative; display: flex; align-items: center; justify-content: center; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-volume-feedback {
    position: absolute; left: 50%; bottom: calc(100% + 8px); transform: translateX(-50%);
    min-width: 48px; padding: 6px 8px; box-sizing: border-box; border-radius: 9999px;
    background: rgb(var(--bg-card, 25 25 30)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    color: rgb(var(--text-primary, 235 235 240)); font-size: 12px; font-weight: 800; line-height: 1;
    text-align: center; white-space: nowrap; pointer-events: none; z-index: 5;
    opacity: 0; visibility: hidden; transform: translate(-50%, 4px) scale(0.92);
    transition: opacity 0.16s ease-out, transform 0.16s ease-out, visibility 0.16s;
  }
  .sh-volume-control:hover .sh-volume-feedback, .sh-volume-feedback.active {
    opacity: 1; visibility: visible; transform: translate(-50%, 0) scale(1);
  }
  .sh-remote-icon-btn { width: 42px; height: 42px; border-radius: 50%; background: rgb(var(--bg-input, 35 35 40)); border: 1px solid rgb(var(--border, 55 55 65) / 0.4); color: rgb(var(--text-primary, 235 235 240)); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease; user-select: none; -webkit-app-region: no-drag !important; pointer-events: auto !important; }
  .sh-remote-icon-btn:hover { background: rgb(var(--bg-card, 25 25 30)); color: #fff; transform: scale(1.08); }
  .sh-remote-icon-btn.main { background: #2563eb; color: #fff; border: none; }
  .sh-remote-icon-btn.main:hover { background: #1d4ed8; }

  /* Offline Badge & Reconnecting Card */
  .sh-badge-offline {
    background: rgba(239, 68, 68, 0.12) !important;
    color: #ef4444 !important;
    border: 1px solid rgba(239, 68, 68, 0.25) !important;
  }
  .sh-badge-offline .sh-dot {
    background: #ef4444 !important;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.6) !important;
    animation: none !important;
  }

  .sh-reconnect-container {
    max-width: 580px;
    margin: 32px auto 40px;
    padding: 0 16px;
    animation: shFadeIn 0.3s ease-out;
  }

  .sh-reconnect-card {
    background: rgb(var(--bg-card, 25 25 30)) !important;
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4) !important;
    border-radius: 24px;
    padding: 36px 28px;
    text-align: center;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
    position: relative;
    overflow: hidden;
  }

  .sh-reconnect-icon-box {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ef4444;
    margin: 0 auto 20px;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.1);
  }

  .sh-reconnect-title {
    font-size: 19px;
    font-weight: 700;
    color: rgb(var(--text-primary, 235 235 240));
    margin: 0 0 8px;
    letter-spacing: -0.3px;
  }

  .sh-reconnect-sub {
    font-size: 13.5px;
    color: rgb(var(--text-muted, 160 165 175));
    line-height: 1.5;
    margin: 0 0 18px;
  }

  .sh-reconnect-url-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgb(var(--bg-input, 35 35 40));
    border: 1px solid rgb(var(--border, 55 55 65) / 0.4);
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 12px;
    color: rgb(var(--text-muted, 160 165 175));
    font-family: monospace;
    margin-bottom: 24px;
  }

  .sh-reconnect-actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
`;
function SmartHomeStyles() {
  return React4.createElement("style", null, SMART_HOME_CSS);
}

// src/panel.tsx
function SmartHomePanelInner(props) {
  const data = props?.data || props;
  const device = data?.device;
  const { t } = useSmartHomeI18n();
  const handleClose = () => {
    const closeOverlay = window?.momaiAPI?.closeOverlay || window?.api?.closeOverlay;
    if (typeof closeOverlay === "function") {
      try {
        closeOverlay({ overlayId: device?.id });
      } catch {
      }
    }
  };
  return /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(SmartHomeStyles, null), !device ? /* @__PURE__ */ React5.createElement(
    "div",
    {
      className: "sh-modal-detail",
      style: {
        WebkitAppRegion: "drag",
        padding: "24px",
        textAlign: "center",
        color: "#fff",
        position: "relative"
      }
    },
    /* @__PURE__ */ React5.createElement(
      "button",
      {
        className: "sh-modal-close-btn",
        style: { WebkitAppRegion: "no-drag", cursor: "pointer", zIndex: 99999 },
        onClick: (e) => {
          e.stopPropagation();
          handleClose();
        }
      },
      "\u2715"
    ),
    /* @__PURE__ */ React5.createElement("p", { style: { fontSize: "14px", color: "#9aa0a6", margin: "20px 0 0" } }, t("panel.noDevice"))
  ) : /* @__PURE__ */ React5.createElement(
    DeviceControlCardContent,
    {
      device,
      allDevices: data?.allDevices || [],
      onClose: handleClose,
      callServiceApi: async (domain, service, serviceData, providerType) => {
        const winApi = window.api || window.momaiAPI;
        if (typeof winApi?.callService === "function") {
          return winApi.callService(domain, service, serviceData, providerType || "homeassistant");
        }
        const baseUrl = winApi?.getApiBaseUrl && winApi.getApiBaseUrl() || "http://127.0.0.1:8050";
        const token = winApi?.getSessionToken && winApi.getSessionToken() || "";
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1e4);
        try {
          const res = await fetch(`${baseUrl}/extensions/momai-smarthome/command`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Token": token
            },
            body: JSON.stringify({
              toolName: "callService",
              args: { domain, service, data: serviceData, providerType: providerType || "homeassistant" }
            }),
            signal: controller.signal
          });
          return await res.json();
        } catch (err) {
          const aborted = err && (err.name === "AbortError" || err.code === "ABORT_ERR" || err.code === 20);
          console.error("[SmartHomePanel] Service execution error:", err);
          return {
            ok: false,
            error: aborted ? t("panel.timeout") : err?.message || t("panel.networkError")
          };
        } finally {
          clearTimeout(timer);
        }
      },
      isOverlay: true
    }
  ));
}
function SmartHomePanel(props) {
  return /* @__PURE__ */ React5.createElement(SmartHomeI18nProvider, null, /* @__PURE__ */ React5.createElement(SmartHomePanelInner, { ...props }));
}
var registerRenderer = (type, component) => {
  if (typeof window !== "undefined" && window.__skillRendererRegistry?.registerRenderer) {
    ;
    window.__skillRendererRegistry.registerRenderer(type, component);
  }
};
registerRenderer("momaismarthome-panel", SmartHomePanel);
var panel_default = SmartHomePanel;
export {
  SmartHomePanel,
  panel_default as default
};
