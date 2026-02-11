from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
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
        # 선택된 파츠 간 호환성 검사
        issues = []

        # 파츠 조회
        pcb = self.db.query(PCB).filter(PCB.id == pcb_id).first() if pcb_id else None
        case = self.db.query(Case).filter(Case.id == case_id).first() if case_id else None
        plate = self.db.query(Plate).filter(Plate.id == plate_id).first() if plate_id else None
        switch = self.db.query(Switch).filter(Switch.id == switch_id).first() if switch_id else None
        keycap = self.db.query(Keycap).filter(Keycap.id == keycap_id).first() if keycap_id else None

        # PCB <--> Case 검사
        if pcb and case:
            if pcb.layout != case.layout:
                issues.append({
                    "type": "error",
                    "parts": ["PCB", "Case"],
                    "message": f"레이아웃 일치하지 않음: PCB({pcb.layout.value}) vs Case({case.layout.value})"
                })
            if pcb.mounting_type != case.mounting_type:
                issues.append({
                    "type": "error",
                    "parts": ["PCB", "Case"],
                    "message": f"마운트 일치하지 않음: PCB({pcb.mounting_type.value}) vs Case({case.mounting_type.value})"
                })

        # PCB <--> Plate 검사
        if pcb and plate:
            if pcb.layout != plate.layout:
                issues.append({
                    "type": "error",
                    "parts": ["PCB", "Plate"],
                    "message": f"레이아웃 일치하지 않음: PCB({pcb.layout.value}) vs Plate({plate.layout.value})"
                })
        
        # PCB <--> Switch 검사
        if pcb and switch:
            if pcb.switch_type != switch.switch_type:
                issues.append({
                    "type": "error",
                    "parts": ["PCB", "Switch"],
                    "message": f"스위치 타입 일치하지 않음: PCB({pcb.layout.value}) vs Switch({switch.switch_type.value})"
                })
        
        # Plate <--> Switch 검사
        if plate and switch:
            if plate.switch_type != switch.switch_type:
                issues.append({
                    "type": "error",
                    "parts": ["Plate", "Switch"],
                    "message": f"스위치 타입 일치하지 않음: Plate({plate.switch_type.value}) vs Swtich({switch.switch_type.value})"
                })

        # Switch <--> Keycap 검사
        if switch and keycap:
            if switch.switch_type != keycap.stem_type:
                issues.append({
                    "type": "error",
                    "parts": ["Switch", "Keycap"],
                    "message": f"스템 타입 일치하지 않음: Switch({switch.switch_type.value}) vs Keycap({keycap.stem_type.value})"
                })

        return {
            "compatible": len(issues) == 0,
            "issues": issues
        }

'''
호환성 규칙 (다시 확인)

- PCB <--> Case: layout, mounting_type 일치
- PCB <--> Plate: layout 일치
- PCB <--> Switch: switch_type 일치
- Plate <--> Switch: switch_type 일치
- Switch <--> Keycap: stem_type 일치
'''