// 파츠 타입 정의
export type LayoutType = "60%" | "65%" | "75%" | "TKL" | "Full";
export type MountingType = "Tray" | "Gasket" | "Top" | "Sandwich";
export type SwitchType = "MX" | "Alps" | "Choc";
export type StabilizerType = "Screw-in" | "Plate-mount" | "Snap-in";
export type KeycapProfile = "Cherry" | "OEM" | "SA" | "DSA" | "MT3";

export interface PCB {
    id: number;
    name: string;
    manufacturer: string | null;
    layout: LayoutType;
    hotswap: boolean;
    switch_type: SwitchType;
    rgb: boolean;
    price: number | null;
    image_url: string | null;
}

export interface Case {
    id: number;
    name: string;
    manufacturer: string | null;
    layout: LayoutType;
    mounting_type: MountingType;
    material: string | null;
    color: string | null;
    weight: number | null;
    price: number | null;
    image_url: string | null;
}

export interface Plate {
    id: number;
    name: string;
    manufacturer: string | null;
    layout: LayoutType;
    material: string | null;
    switch_type: SwitchType;
    price: number | null;
    image_url: string | null;
}

export interface Stabilizer {
    id: number;
    name: string;
    manufacturer: string | null;
    stab_type: StabilizerType;
    size: string | null;
    price: number | null;
    image_url: string | null;
}

export interface Switch {
    id: number;
    name: string;
    manufacturer: string | null;
    switch_type: SwitchType;
    pin_count: number | null;
    actuation_force: number | null;
    tactile: boolean;
    clicky: boolean;
    price: number | null;
    image_url: string | null;
}

export interface Keycap {
    id: number;
    name: string;
    manufacturer: string | null;
    profile: KeycapProfile;
    material: string | null;
    stem_type: SwitchType;
    price: number | null;
    image_url: string | null;
}

// 호환성 검사 결과
export interface CompatibilityIssue {
    type: "error" | "warning";
    parts: string[];
    message: string;
}

export interface CompatibilityResult {
    compatible: boolean;
    issues: CompatibilityIssue[];
}

// 선택된 파츠들
export interface SelectedParts {
    pcb: PCB | null;
    case: Case | null;
    plate: Plate | null;
    stabilizer: Stabilizer | null;
    switch: Switch | null;
    keycap: Keycap | null;
}
