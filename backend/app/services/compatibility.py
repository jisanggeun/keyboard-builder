from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from app.models import PCB, Case, Plate, Stabilizer, Switch, Keycap

class CompatibilityService:
    def __init__(self, db: Session):
        self.db = db

    def check_compatibility(
        self,
        pcb_id: Optional[int] = None,
        case_id: Optional[int] = None,
        plate_id: Optional[int] = None,
        switch_id: Optional[int] = None,
        keycap_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        issues = []

        pcb = self.db.query(PCB).options(joinedload(PCB.compatible_group)).filter(PCB.id == pcb_id).first() if pcb_id else None
        case = self.db.query(Case).options(joinedload(Case.compatible_group)).filter(Case.id == case_id).first() if case_id else None
        plate = self.db.query(Plate).options(joinedload(Plate.compatible_group)).filter(Plate.id == plate_id).first() if plate_id else None
        switch = self.db.query(Switch).filter(Switch.id == switch_id).first() if switch_id else None
        keycap = self.db.query(Keycap).filter(Keycap.id == keycap_id).first() if keycap_id else None

        # --- 물리적 호환성: compatible_group 기반 ---

        # PCB <--> Case: 같은 compatible_group이면 호환
        if pcb and case:
            if pcb.compatible_group_id and case.compatible_group_id:
                if pcb.compatible_group_id != case.compatible_group_id:
                    pcb_group = pcb.compatible_group.name if pcb.compatible_group else "?"
                    case_group = case.compatible_group.name if case.compatible_group else "?"
                    issues.append({
                        "type": "error",
                        "parts": ["PCB", "Case"],
                        "message": f"호환 그룹 불일치: PCB({pcb_group}) vs Case({case_group})"
                    })
            else:
                issues.append({
                    "type": "warning",
                    "parts": ["PCB", "Case"],
                    "message": "호환 그룹 미지정 - 물리적 호환성 확인 불가"
                })

        # PCB <--> Plate: 같은 compatible_group이면 호환
        if pcb and plate:
            if pcb.compatible_group_id and plate.compatible_group_id:
                if pcb.compatible_group_id != plate.compatible_group_id:
                    pcb_group = pcb.compatible_group.name if pcb.compatible_group else "?"
                    plate_group = plate.compatible_group.name if plate.compatible_group else "?"
                    issues.append({
                        "type": "error",
                        "parts": ["PCB", "Plate"],
                        "message": f"호환 그룹 불일치: PCB({pcb_group}) vs Plate({plate_group})"
                    })
            else:
                issues.append({
                    "type": "warning",
                    "parts": ["PCB", "Plate"],
                    "message": "호환 그룹 미지정 - 물리적 호환성 확인 불가"
                })

        # Plate <--> Case: 같은 compatible_group이면 호환
        if plate and case:
            if plate.compatible_group_id and case.compatible_group_id:
                if plate.compatible_group_id != case.compatible_group_id:
                    plate_group = plate.compatible_group.name if plate.compatible_group else "?"
                    case_group = case.compatible_group.name if case.compatible_group else "?"
                    issues.append({
                        "type": "error",
                        "parts": ["Plate", "Case"],
                        "message": f"호환 그룹 불일치: Plate({plate_group}) vs Case({case_group})"
                    })
            else:
                issues.append({
                    "type": "warning",
                    "parts": ["Plate", "Case"],
                    "message": "호환 그룹 미지정 - 물리적 호환성 확인 불가"
                })

        # --- 전기적 호환성: 속성 기반 (변경 없음) ---

        # PCB <--> Switch: switch_type 일치
        if pcb and switch:
            if pcb.switch_type != switch.switch_type:
                issues.append({
                    "type": "error",
                    "parts": ["PCB", "Switch"],
                    "message": f"스위치 타입 불일치: PCB({pcb.switch_type.value}) vs Switch({switch.switch_type.value})"
                })

        # Plate <--> Switch: switch_type 일치
        if plate and switch:
            if plate.switch_type != switch.switch_type:
                issues.append({
                    "type": "error",
                    "parts": ["Plate", "Switch"],
                    "message": f"스위치 타입 불일치: Plate({plate.switch_type.value}) vs Switch({switch.switch_type.value})"
                })

        # Switch <--> Keycap: stem_type 일치
        if switch and keycap:
            if switch.switch_type != keycap.stem_type:
                issues.append({
                    "type": "error",
                    "parts": ["Switch", "Keycap"],
                    "message": f"스템 타입 불일치: Switch({switch.switch_type.value}) vs Keycap({keycap.stem_type.value})"
                })

        # compatible 판정: error가 0개면 호환 (warning은 무시)
        error_count = sum(1 for issue in issues if issue["type"] == "error")

        return {
            "compatible": error_count == 0,
            "issues": issues
        }
