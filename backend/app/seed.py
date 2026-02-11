from app.database import SessionLocal
from app.models import PCB, Case, Plate, Stabilizer, Switch, Keycap
from app.models.parts import (
    LayoutType, MountingType, SwitchType,
    StabilizerType, KeycapProfile
)

def seed_data():
    db = SessionLocal()

    # PCB 샘플
    pcbs = [
        PCB(
            name="DZ60",
            manufacturer="KBDfans",
            layout=LayoutType.SIXTY,
            mounting_type=MountingType.TRAY,
            hotswap=True,
            switch_type=SwitchType.MX,
            rgb=True,
            price=55.0
        ), 
        PCB(
            name="BM65",
            manufacturer="KPrepublic",
            layout=LayoutType.SIXTY_FIVE,
            mounting_type=MountingType.GASKET,
            hotswap=True,
            switch_type=SwitchType.MX,
            rgb=True,
            price=45.0
        ),
    ]

    # Case 샘플
    cases = [
        Case(
            name="Tofu60",
            manufacturer="KBDfans",
            layout=LayoutType.SIXTY,
            mounting_type=MountingType.TRAY,
            material="Aluminum",
            color="Black",
            price=88.0
        ),
        Case(
            name="KBD67 Lite",
            manufacturer="KBDfans",
            layout=LayoutType.SIXTY_FIVE,
            mounting_type=MountingType.GASKET,
            material="Plastic",
            color="White",
            price=109.0
        ),
    ]

    # Switch 샘플
    switches = [
        Switch(
            name="Gateron Yellow",
            manufacturer="Gateron",
            switch_type=SwitchType.MX,
            pin_count=5,
            actuation_force=50.0,
            tactile=False,
            clicky=False,
            price=0.25
        ),
        Switch(
            name="Cherry MX Brown",
            manufacturer="Cherry",
            switch_type=SwitchType.MX,
            pin_count=5,
            actuation_force=55.0,
            tactile=True,
            clicky=False,
            price=0.75
        ),
    ]

    # Keycap 샘플
    keycaps = [
        Keycap(
            name="GMK Olivia",
            manufacturer="GMK",
            profile=KeycapProfile.CHERRY,
            material="ABS",
            stem_type=SwitchType.MX,
            price=180.0
        ),
        Keycap(
            name="PBTfans Dolch",
            manufacturer="KBDfans",
            profile=KeycapProfile.CHERRY,
            material="PBT",
            stem_type=SwitchType.MX,
            price=89.0
        ),
    ]

    # Plate 샘플
    plates= [
        Plate(
            name="DZ60 Aluminum Plate",
            manufacturer="KBDfans",
            layout=LayoutType.SIXTY,
            material="Aluminum",
            switch_type=SwitchType.MX,
            price=18.0
        ),
        Plate(
            name="KBD67 PC Plate",
            manufacturer="KBDfans",
            layout=LayoutType.SIXTY_FIVE,
            material="Polycarbonate",
            switch_type=SwitchType.MX,
            price=22.0
        ),
    ]

    # Stabilizer 샘플
    stabilizers = [
        Stabilizer(
            name="Durock V2",
            manufacturer="Durock",
            stab_type=StabilizerType.SCREW_IN,
            size="2u, 6.25u",
            price=22.0
        ),
        Stabilizer(
            name="Cherry Clip-in",
            manufacturer="Cherry",
            stab_type=StabilizerType.PLATE_MOUNT,
            size="2u, 6.25u",
            price=12.0
        ),
    ]
    
    for pcb in pcbs:
        db.add(pcb)
    for case in cases:
        db.add(case)
    for switch in switches:
        db.add(switch)
    for keycap in keycaps:
        db.add(keycap)
    for plate in plates:
        db.add(plate)
    for stab in stabilizers:
        db.add(stab)


    db.commit()
    db.close()
    print("Seed data inserted")

if __name__ == "__main__":
    seed_data()