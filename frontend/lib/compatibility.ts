import { SelectedParts, CompatibilityResult, CompatibilityIssue } from "./types"

export function checkCompatibilityLocal(selected: SelectedParts): CompatibilityResult {
    const issues: CompatibilityIssue[] = []

    // PCB <--> Case 검사
    if(selected.pcb && selected.case) {
        if(selected.pcb.layout !== selected.case.layout) {
            issues.push({
                type: "error",
                parts: ["PCB", "Case"],
                message: `레이아웃 일치하지 않음: PCB(${selected.pcb.layout}) vs Case(${selected.case.layout})`
            })
        }

        if(selected.pcb.mounting_type !== selected.case.mounting_type) {
            issues.push({
                type: "error",
                parts: ["PCB", "Case"],
                message: `마운트 일치하지 않음: PCB(${selected.pcb.mounting_type}) vs Case(${selected.case.mounting_type})`
            })
        }
    }

    // PCB <--> Plate 검사
    if(selected.pcb && selected.plate) {
        if(selected.pcb.layout !== selected.plate.layout) {
            issues.push({
                type: "error",
                parts: ["PCB", "Plate"],
                message: `레이아웃 일치하지 않음: PCB(${selected.pcb.layout}) vs Plate(${selected.plate.layout})`
            })
        }
    }

    // PCB <--> Switch 검사
    if(selected.pcb && selected.switch) {
        if(selected.pcb.switch_type !== selected.switch.switch_type) {
            issues.push({
                type: "error",
                parts: ["PCB", "Switch"],
                message: `스위치 타입 일치하지 않음: PCB(${selected.pcb.switch_type}) vs Switch(${selected.switch.switch_type})`
            })
        }
    }

    // Plate <--> Case 검사
    if(selected.plate && selected.case) {
        if(selected.plate.layout !== selected.case.layout) {
            issues.push({
                type: "error",
                parts: ["Plate", "Case"],
                message: `레이아웃 일치하지 않음: Plate(${selected.plate.layout}) vs Case(${selected.case.layout})`
            })
        }
    }

    // Plate <--> Switch 검사
    if(selected.plate && selected.switch) {
        if(selected.plate.switch_type !== selected.switch.switch_type) {
            issues.push({
                type: "error",
                parts: ["Plate", "Switch"],
                message: `스위치 타입 일치하지 않음: Plate(${selected.plate.switch_type}) vs Switch(${selected.switch.switch_type})`
            })
        }
    }

    // Switch <--> Keycap 검사
    if(selected.switch && selected.keycap) {
        if(selected.switch.switch_type !== selected.keycap.stem_type) {
            issues.push({
                type: "error",
                parts: ["Switch", "Keycap"],
                message: `스템 타입 일치하지 않음: Switch(${selected.switch.switch_type}) vs Keycap(${selected.keycap.stem_type})`
            })
        }
    }

    return {
        compatible: issues.length === 0,
        issues
    }
}