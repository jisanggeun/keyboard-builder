import { SelectedParts } from "./types";

const STORAGE_KEY = "keyboard-builder-selected";

interface StoredSelection {
    pcb_id: number | null;
    case_id: number | null;
    plate_id: number | null;
    stabilizer_id: number | null;
    switch_id: number | null;
    keycap_id: number | null;
}

function toStoredSelection(selected: SelectedParts): StoredSelection {
    return {
        pcb_id: selected.pcb?.id ?? null,
        case_id: selected.case?.id ?? null,
        plate_id: selected.plate?.id ?? null,
        stabilizer_id: selected.stabilizer?.id ?? null,
        switch_id: selected.switch?.id ?? null,
        keycap_id: selected.keycap?.id ?? null,
    };
}

export function saveToLocalStorage(selected: SelectedParts): void {
    try {
        const data = toStoredSelection(selected);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // localStorage unavailable
    }
}

export function loadFromLocalStorage(): StoredSelection | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as StoredSelection;
    } catch {
        return null;
    }
}

export function clearLocalStorage(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // localStorage unavailable
    }
}

const PARAM_KEYS = ["pcb", "case", "plate", "stabilizer", "switch", "keycap"] as const;

export function selectedToQueryParams(selected: SelectedParts): string {
    const params = new URLSearchParams();
    const stored = toStoredSelection(selected);
    const idMap: Record<string, number | null> = {
        pcb: stored.pcb_id,
        case: stored.case_id,
        plate: stored.plate_id,
        stabilizer: stored.stabilizer_id,
        switch: stored.switch_id,
        keycap: stored.keycap_id,
    };

    for (const key of PARAM_KEYS) {
        const id = idMap[key];
        if (id != null) {
            params.set(key, String(id));
        }
    }
    return params.toString();
}

export function queryParamsToSelection(searchParams: URLSearchParams): StoredSelection | null {
    const hasAny = PARAM_KEYS.some((k) => searchParams.has(k));
    if (!hasAny) return null;

    return {
        pcb_id: searchParams.has("pcb") ? Number(searchParams.get("pcb")) : null,
        case_id: searchParams.has("case") ? Number(searchParams.get("case")) : null,
        plate_id: searchParams.has("plate") ? Number(searchParams.get("plate")) : null,
        stabilizer_id: searchParams.has("stabilizer") ? Number(searchParams.get("stabilizer")) : null,
        switch_id: searchParams.has("switch") ? Number(searchParams.get("switch")) : null,
        keycap_id: searchParams.has("keycap") ? Number(searchParams.get("keycap")) : null,
    };
}

export function generateShareUrl(selected: SelectedParts): string {
    const params = selectedToQueryParams(selected);
    const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    return params ? `${base}?${params}` : base;
}
