# Guia de Automação: MomAI Smart Home

A extensão MomAI Smart Home integra o assistente ao Home Assistant e ecossistemas residenciais, permitindo reagir a mudanças de sensores e controlar dispositivos inteligentes da casa.

## Triggers (Gatilhos de Evento)

1. **`momai-smarthome.state_changed`**
   - Disparado em tempo real quando qualquer dispositivo ou sensor monitorado muda de estado no Home Assistant.
   - **Campos do Payload (`trigger.payload`)**:
     - `entityId`: Identificador único da entidade (ex.: `"light.sala_de_estar"`, `"binary_sensor.porta_entrada"`, `"climate.ar_condicionado"`, `"switch.ventilador"`)
     - `deviceState`: Novo estado assumido (ex.: `"on"`, `"off"`, `"open"`, `"closed"`, `"locked"`, `"unlocked"`)
     - `deviceName`: Nome amigável do dispositivo (ex.: `"Luz da Sala"`, `"Porta da Frente"`, `"Ar Condicionado"`)
     - `deviceRoom`: Cômodo atribuído (ex.: `"Sala"`, `"Quarto"`, `"Garagem"`)

## Actions (Ações Executáveis)

1. **`momai-smarthome.control_device`**
   - Liga, desliga ou alterna o estado de um dispositivo inteligente.
   - **Parâmetros**:
     - `device_name`: Nome ou parte do nome do dispositivo (ex.: `"Luz da Sala"`, `"Ar Condicionado"`, `"Ventilador"`)
     - `action`: `"on"` (ligar), `"off"` (desligar) ou `"toggle"` (alternar)
     - `brightness` *(opcional)*: Brilho de 0 a 100% para lâmpadas dimerizáveis
     - `color` *(opcional)*: Cor da luz (ex.: `"red"`, `"azul"`, `"#FF5500"`)

2. **`momai-smarthome.set_light_color`**
   - Ajusta cor e intensidade de lâmpadas ou fitas LED.
   - **Parâmetros**:
     - `device_name`: Nome da lâmpada (ex.: `"Fita LED TV"`)
     - `color`: Cor desejada (ex.: `"roxo"`, `"#8B5CF6"`)
     - `brightness` *(opcional)*: Nível de brilho de 0 a 100%

## Padrões de Integração e Cenários

Esta extensão opera de forma totalmente desacoplada, servindo tanto como **Origem de Eventos** (sensores de porta, temperatura, presença, status de lâmpadas) quanto como **Destino de Ações** (acionar interruptores, luzes e eletrodomésticos).

### Exemplos Conceituais:

1. **Reagir a eventos de Sensores (Smart Home como Gatilho):**
   - **Trigger**: `momai-smarthome.state_changed`
   - **Filtro**: `trigger.payload.entityId == "binary_sensor.porta_entrada"` e `trigger.payload.deviceState == "open"`
   - **Ação**: Pode ser qualquer canal de notificação ou mensageiro ativo no sistema (ex.: `system.notify` para alerta local, ou uma extensão de mensagens/e-mail configurada pelo usuário).
   - **Mensagem interpolada**: `"O dispositivo {{trigger.payload.deviceName}} no cômodo {{trigger.payload.deviceRoom}} mudou para {{trigger.payload.deviceState}}!"`

2. **Acionar Dispositivos em reação a eventos externos (Smart Home como Ação):**
   - **Trigger**: Qualquer gatilho de detecção, horário ou evento do sistema (ex.: detecção de presença, horário agendado ou chegada de notificação importante).
   - **Ação**: `momai-smarthome.control_device`
     - `device_name`: `"Luz da Sala"`
     - `action`: `"on"`

## Modelo Se-em-lista (Hub de Automações)

- **Vários gatilhos (OU)**: `trigger_ids: ["momai-smarthome.state_changed", "<outra_ext>.<evento>"]` — qualquer um dispara. `trigger_configs` leva params por gatilho.
- **Condições (E)** em `global_conditions`, cada uma com `kind`:
  - `"trigger_field"` (padrão): `trigger.payload.<campo>` (ex: `entityId`, `deviceState`, `deviceName`, `deviceRoom`);
  - `"time_window"`: `time.time` (HH:MM, `between`/`equals`), `time.weekday` (`in`, 0=dom–6=sáb), `time.hour`, `time.date` — ex: ligar a luz por presença só à noite;
  - `"extension_state"`: `extension.<id>.enabled` true/false.
- **Frequência (`policy`)**: `cooldownSeconds` (ex: 20, anti-trepidação de sensor), `maxPerDay`, `weekdays`, `startTime`/`endTime` (HH:MM, suporta 22:00–06:00), `expiresAt`. Omita para executar sempre.
