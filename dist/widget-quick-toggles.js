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

// src/widgets/hooks/useQuickTogglesWidget.ts
import { useCallback as useCallback2, useEffect as useEffect2, useState as useState2 } from "react";

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
async function toggleWidgetDevice(deviceId) {
  await callCommand("control_device", { device_name: deviceId, action: "toggle" });
}

// src/widgets/hooks/useQuickTogglesWidget.ts
function useQuickTogglesWidget(isEditing, entityIds) {
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2("");
  const [rows, setRows] = useState2([]);
  const key = entityIds.join("|");
  const refresh = useCallback2(async () => {
    setLoading(true);
    setError("");
    try {
      const devices = await fetchWidgetDevices();
      const selected = devices.filter((device) => key === "" || entityIds.includes(device.id)).slice(0, 6).map((device) => ({ ...device, pending: false }));
      setRows(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }, [key]);
  useEffect2(() => {
    if (isEditing) {
      setLoading(false);
      return;
    }
    void refresh();
  }, [isEditing, refresh]);
  const toggle = useCallback2(
    async (device) => {
      setRows((prev) => prev.map((row) => row.id === device.id ? { ...row, pending: true } : row));
      try {
        await toggleWidgetDevice(device.id);
        await refresh();
      } catch {
        setRows((prev) => prev.map((row) => row.id === device.id ? { ...row, pending: false } : row));
      }
    },
    [refresh]
  );
  return { loading, error, rows, refresh, toggle };
}

// src/widgets/components/WidgetState.tsx
function WidgetState({ title, message }) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col items-center justify-center gap-1 p-4 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold text-text" }, title), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-text-muted" }, message));
}
function WidgetLoading({ message }) {
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center p-4 text-text-muted" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs" }, message));
}

// src/widgets/quick-toggles.tsx
function ToggleSwitch({ on }) {
  return /* @__PURE__ */ React.createElement("span", { className: `w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${on ? "bg-accent" : "bg-white/10"}` }, /* @__PURE__ */ React.createElement("span", { className: `block w-4 h-4 rounded-full bg-white transition-transform ${on ? "translate-x-4" : "translate-x-0"}` }));
}
function SmarthomeQuickTogglesWidget({
  config,
  isEditing = false
}) {
  const { t } = useSmartHomeI18n();
  const entityIds = config?.entityIds ?? [];
  const { loading, error, rows, toggle } = useQuickTogglesWidget(isEditing, entityIds);
  if (entityIds.length === 0) {
    return /* @__PURE__ */ React.createElement(WidgetState, { title: t("widget.toggles.title"), message: t("widget.toggles.needsSetup") });
  }
  if (loading) return /* @__PURE__ */ React.createElement(WidgetLoading, { message: t("widget.toggles.loading") });
  if (error) return /* @__PURE__ */ React.createElement(WidgetState, { title: t("widget.toggles.title"), message: error });
  return /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex flex-col min-h-0 overflow-hidden p-3 gap-1.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-text shrink-0" }, t("widget.toggles.title")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-1.5 min-h-0 overflow-hidden" }, rows.map((device) => {
    const on = device.state.toLowerCase() === "on";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: device.id,
        type: "button",
        disabled: device.pending || isEditing,
        onClick: () => void toggle(device),
        className: "flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-bg/50 border border-border/20 hover:border-accent/40 text-left disabled:opacity-60"
      },
      /* @__PURE__ */ React.createElement("span", { className: "text-xs text-text truncate" }, device.name),
      /* @__PURE__ */ React.createElement(ToggleSwitch, { on })
    );
  })));
}
export {
  SmarthomeQuickTogglesWidget as default
};
