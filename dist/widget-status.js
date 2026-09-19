// src/i18n/index.tsx
import React2, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
var DEFAULT_LOCALE = "pt-BR";
var SmartHomeI18nContext = createContext({
  locale: DEFAULT_LOCALE,
  t: (key) => key
});
function useSmartHomeI18n() {
  return useContext(SmartHomeI18nContext);
}

// src/widgets/hooks/useStatusWidget.ts
import { useEffect as useEffect2, useState as useState2 } from "react";

// src/widgets/services/deviceApi.ts
function getBaseUrl() {
  try {
    const fromHost = window?.momaiAPI?.getApiBaseUrl?.() || window?.api?.getApiBaseUrl?.();
    if (fromHost) return String(fromHost).replace(/\/+$/, "");
  } catch {
  }
  return "http://127.0.0.1:8050";
}
function getToken() {
  try {
    return String(window?.momaiAPI?.getSessionToken?.() || window?.api?.getSessionToken?.() || "");
  } catch {
    return "";
  }
}
async function callCommand(toolName, args = {}) {
  const res = await fetch(`${getBaseUrl()}/extensions/momai-smarthome/command`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getToken() ? { Authorization: `Bearer ${getToken()}` } : {}
    },
    body: JSON.stringify({ toolName, args })
  });
  return res.json();
}
async function fetchWidgetDevices() {
  const data = await callCommand("list_devices", {});
  const list = data?.devices ?? data?.data?.devices ?? [];
  return list.map((item) => ({
    id: String(item.entity_id ?? item.id ?? ""),
    name: String(item.name ?? item.entity_id ?? "Device"),
    state: String(item.state ?? "unknown"),
    room: item.room ? String(item.room) : void 0
  })).filter((device) => device.id !== "");
}

// src/widgets/hooks/useStatusWidget.ts
function isOnState(state) {
  return ["on", "open", "playing", "unlocked"].includes(state.toLowerCase());
}
function useStatusWidget(isEditing) {
  const [state, setState] = useState2({ loading: true, error: "", devices: [] });
  useEffect2(() => {
    if (isEditing) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }
    let cancelled = false;
    async function load() {
      try {
        const devices = await fetchWidgetDevices();
        if (!cancelled) setState({ loading: false, error: "", devices });
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, error: err instanceof Error ? err.message : "Load failed.", devices: [] });
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [isEditing]);
  return state;
}

// src/widgets/components/WidgetState.tsx
function WidgetState({ title, message }) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col items-center justify-center gap-1 p-4 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-text" }, title), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-text-muted" }, message));
}
function WidgetLoading({ message }) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center p-4 text-text-muted" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, message));
}

// src/widgets/status.tsx
function SmarthomeStatusWidget({ isEditing = false }) {
  const { t } = useSmartHomeI18n();
  const { loading, error, devices } = useStatusWidget(isEditing);
  if (loading) return /* @__PURE__ */ React.createElement(WidgetLoading, { message: t("widget.status.loading") });
  if (error) return /* @__PURE__ */ React.createElement(WidgetState, { title: t("widget.status.title"), message: error });
  const onCount = devices.filter((device) => isOnState(device.state)).length;
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col min-h-0 overflow-hidden p-3 gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-text" }, t("widget.status.title")), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-text-muted" }, onCount, " / ", devices.length)), devices.length === 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-text-muted" }, t("widget.status.empty")) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5 min-h-0 overflow-hidden" }, devices.slice(0, 5).map((device) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: device.id,
      className: "flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-bg/50 border border-border/20"
    },
    /* @__PURE__ */ React.createElement("span", { className: "text-xs text-text truncate" }, device.name),
    /* @__PURE__ */ React.createElement("span", { className: isOnState(device.state) ? "text-[10px] font-bold text-accent" : "text-[10px] text-text-muted" }, device.state)
  ))));
}
export {
  SmarthomeStatusWidget as default
};
