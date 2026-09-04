---
name: MomAI Smart Home
description: Controle dispositivos inteligentes da sua casa: luzes, TV e controle remoto, volume, temperatura, sensores, fechaduras, cortinas, câmeras e muito mais via Home Assistant. Use quando o usuario falar de casa inteligente, smart home, luz, ligar, desligar, TV, volume, ar condicionado, temperatura, ou pedir para abrir o controle de um dispositivo.
---

Integração completa com Home Assistant e suporte a múltiplos provedores de automação residencial. Controle cores de luzes, brilho, TV, controle remoto, volume, climatização, sensores e muito mais.

As credenciais são armazenadas localmente de forma criptografada no SQLite. Ao usar **Desconectar**, a extensão encerra a conexão, remove os caches e desativa a auto-reconexão, mas preserva a URL e o token para reconectar manualmente pelo formulário.

## Como usar (gramática)

- "abra o controle da televisão" / "abrir o controle da TV" / "mostrar o controle da tv" → `open_device_control { device_name: "televisão" }`
- "aumenta o volume da TV" / "liga a televisão" / "muda para o canal 5" / "coloca na HDMI 1" / "abre a Netflix na TV" → `control_tv_remote` com o `device_name` da TV
- "abaixa a temperatura" → `control_climate`
- "liga a luz da sala" / "acende a luz" → `control_device`
- "qual o estado da TV?" → `query_device`
- "que dispositivos tenho na sala?" → `list_devices { room }`

Se o usuário pedir para **abrir/mostrar o controle** de um dispositivo (TV, ar-condicionado, lâmpada, etc.), use `open_device_control` — NÃO use `control_device` nem `control_tv_remote` para isso.
