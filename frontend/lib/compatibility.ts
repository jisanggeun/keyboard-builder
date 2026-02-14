import { SelectedParts, CompatibilityResult, CompatibilityIssue } from "./types"

export function checkCompatibilityLocal(selected: SelectedParts): CompatibilityResult {
    const issues: CompatibilityIssue[] = []

    // --- 물리적 호환성: compatible_group 기반 ---

    // PCB <--> Case: 같은 compatible_group이면 호환
    if (selected.pcb && selected.case) {
        if (selected.pcb.compatible_group_id && selected.case.compatible_group_id) {
            if (selected.pcb.compatible_group_id !== selected.case.compatible_group_id) {
                issues.push({
                    type: "error",
                    parts: ["PCB", "Case"],
                    message: `호환 그룹 불일치: PCB(${selected.pcb.compatible_group_name}) vs Case(${selected.case.compatible_group_name})`
                })
            }
        } else {
            issues.push({
                type: "warning",
                parts: ["PCB", "Case"],
                message: "호환 그룹 미지정 - 물리적 호환성 확인 불가"
            })
        }
    }

    // PCB <--> Plate: 같은 compatible_group이면 호환
    if (selected.pcb && selected.plate) {
        if (selected.pcb.compatible_group_id && selected.plate.compatible_group_id) {
            if (selected.pcb.compatible_group_id !== selected.plate.compatible_group_id) {
                issues.push({
                    type: "error",
                    parts: ["PCB", "Plate"],
                    message: `호환 그룹 불일치: PCB(${selected.pcb.compatible_group_name}) vs Plate(${selected.plate.compatible_group_name})`
                })
            }
        } else {
            issues.push({
                type: "warning",
                parts: ["PCB", "Plate"],
                message: "호환 그룹 미지정 - 물리적 호환성 확인 불가"
            })
        }
    }

    // Plate <--> Case: 같은 compatible_group이면 호환
    if (selected.plate && selected.case) {
        if (selected.plate.compatible_group_id && selected.case.compatible_group_id) {
            if (selected.plate.compatible_group_id !== selected.case.compatible_group_id) {
                issues.push({
                    type: "error",
                    parts: ["Plate", "Case"],
                    message: `호환 그룹 불일치: Plate(${selected.plate.compatible_group_name}) vs Case(${selected.case.compatible_group_name})`
                })
            }
        } else {
            issues.push({
                type: "warning",
                parts: ["Plate", "Case"],
                message: "호환 그룹 미지정 - 물리적 호환성 확인 불가"
            })
        }
    }

    // --- 전기적 호환성: 속성 기반 (변경 없음) ---

    // PCB <--> Switch: switch_type 일치
    if (selected.pcb && selected.switch) {
        if (selected.pcb.switch_type !== selected.switch.switch_type) {
            issues.push({
                type: "error",
                parts: ["PCB", "Switch"],
                message: `스위치 타입 불일치: PCB(${selected.pcb.switch_type}) vs Switch(${selected.switch.switch_type})`
            })
        }
    }

    // Plate <--> Switch: switch_type 일치
    if (selected.plate && selected.switch) {
        if (selected.plate.switch_type !== selected.switch.switch_type) {
            issues.push({
                type: "error",
                parts: ["Plate", "Switch"],
                message: `스위치 타입 불일치: Plate(${selected.plate.switch_type}) vs Switch(${selected.switch.switch_type})`
            })
        }
    }

    // Switch <--> Keycap: stem_type 일치
    if (selected.switch && selected.keycap) {
        if (selected.switch.switch_type !== selected.keycap.stem_type) {
            issues.push({
                type: "error",
                parts: ["Switch", "Keycap"],
                message: `스템 타입 불일치: Switch(${selected.switch.switch_type}) vs Keycap(${selected.keycap.stem_type})`
            })
        }
    }

    // compatible 판정: error가 0개면 호환 (warning은 무시)
    const errorCount = issues.filter(issue => issue.type === "error").length

    return {
        compatible: errorCount === 0,
        issues
    }
}
