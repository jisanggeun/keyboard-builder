// 파츠 타입 정의
export type LayoutType = "60%" | "65%" | "75%" | "TKL" | "Full";
export type MountingType = "Tray" | "Gasket" | "Top" | "Sandwich";
export type SwitchType = "MX" | "Alps" | "Choc";
export type StabilizerType = "Screw-in" | "Plate-mount" | "Snap-in";
export type KeycapProfile = "Cherry" | "OEM" | "SA" | "DSA" | "MT3";

// Compatible Group - 물리적 호환성 그룹
export interface CompatibleGroup {
    id: number;
    name: string;
    layout: LayoutType;
    description: string | null;
}

export interface PCB {
    id: number;
    name: string;
    manufacturer: string | null;
    layout: LayoutType;
    mounting_type: MountingType;
    hotswap: boolean;
    switch_type: SwitchType;
    rgb: boolean;
    price: number | null;
    image_url: string | null;
    compatible_group_id: number | null;
    compatible_group_name: string | null;
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
    compatible_group_id: number | null;
    compatible_group_name: string | null;
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
    compatible_group_id: number | null;
    compatible_group_name: string | null;
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

export interface AllParts {
    pcbs: PCB[];
    cases: Case[];
    plates: Plate[];
    stabilizers: Stabilizer[];
    switches: Switch[];
    keycaps: Keycap[];
    compatible_groups: CompatibleGroup[];
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

// 빌드 저장/불러오기
export interface Build {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    pcb: PCB | null;
    case: Case | null;
    plate: Plate | null;
    stabilizer: Stabilizer | null;
    switch: Switch | null;
    keycap: Keycap | null;
}

export interface BuildListItem {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    has_pcb: boolean;
    has_case: boolean;
    has_plate: boolean;
    has_stabilizer: boolean;
    has_switch: boolean;
    has_keycap: boolean;
}

export interface BuildCreateData {
    name: string;
    pcb_id?: number | null;
    case_id?: number | null;
    plate_id?: number | null;
    stabilizer_id?: number | null;
    switch_id?: number | null;
    keycap_id?: number | null;
}

export interface BuildUpdateData {
    name?: string;
    pcb_id?: number | null;
    case_id?: number | null;
    plate_id?: number | null;
    stabilizer_id?: number | null;
    switch_id?: number | null;
    keycap_id?: number | null;
}
