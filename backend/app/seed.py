from app.database import SessionLocal
from app.models import PCB, Case, Plate, Stabilizer, Switch, Keycap, CompatibleGroup
from app.models.parts import (
    LayoutType, MountingType, SwitchType,
    StabilizerType, KeycapProfile
)

def seed_data():
    db = SessionLocal()

    # --- Compatible Groups (11개) ---
    groups = [
        CompatibleGroup(name="DZ60 / Tofu60", layout=LayoutType.SIXTY, description="KBDfans 60% tray mount ecosystem"),
        CompatibleGroup(name="GH60 / Poker", layout=LayoutType.SIXTY, description="Universal GH60 compatible 60%"),
        CompatibleGroup(name="KBD67 Lite", layout=LayoutType.SIXTY_FIVE, description="KBDfans 65% gasket mount"),
        CompatibleGroup(name="NK65", layout=LayoutType.SIXTY_FIVE, description="Novelkeys 65% ecosystem"),
        CompatibleGroup(name="KBD75", layout=LayoutType.SEVENTY_FIVE, description="KBDfans 75% top mount"),
        CompatibleGroup(name="GMMK Pro", layout=LayoutType.SEVENTY_FIVE, description="Glorious 75% gasket mount"),
        CompatibleGroup(name="ID80", layout=LayoutType.SEVENTY_FIVE, description="Idobao 75% gasket mount"),
        CompatibleGroup(name="KBD8X MKII", layout=LayoutType.TKL, description="KBDfans TKL top mount"),
        CompatibleGroup(name="Freebird TKL", layout=LayoutType.TKL, description="Geon TKL gasket mount"),
        CompatibleGroup(name="Keychron Q6", layout=LayoutType.FULL, description="Keychron full-size gasket mount"),
        CompatibleGroup(name="Leopold FC900R", layout=LayoutType.FULL, description="Leopold full-size standard"),
    ]
    for g in groups:
        db.add(g)
    db.flush()

    # group lookup by name
    group_map = {g.name: g for g in groups}

    # --- PCBs (20개) ---
    pcbs = [
        # 60% - DZ60 / Tofu60
        PCB(name="DZ60 Rev 3", manufacturer="KBDfans", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=55.0,
            compatible_group=group_map["DZ60 / Tofu60"]),
        PCB(name="YD60MQ", manufacturer="YMDK", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
            hotswap=False, switch_type=SwitchType.MX, rgb=False, price=32.0,
            compatible_group=group_map["DZ60 / Tofu60"]),
        # 60% - GH60 / Poker
        PCB(name="GH60 Satan", manufacturer="Generic", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
            hotswap=False, switch_type=SwitchType.MX, rgb=False, price=25.0,
            compatible_group=group_map["GH60 / Poker"]),
        PCB(name="BM60", manufacturer="KPrepublic", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=45.0,
            compatible_group=group_map["GH60 / Poker"]),
        # 65% - KBD67 Lite
        PCB(name="KBD67 Lite PCB", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=40.0,
            compatible_group=group_map["KBD67 Lite"]),
        PCB(name="KBD67 Lite R3 PCB", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=42.0,
            compatible_group=group_map["KBD67 Lite"]),
        # 65% - NK65
        PCB(name="NK65 PCB", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.TOP,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=35.0,
            compatible_group=group_map["NK65"]),
        PCB(name="NK65 Entry PCB", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.TOP,
            hotswap=True, switch_type=SwitchType.MX, rgb=False, price=28.0,
            compatible_group=group_map["NK65"]),
        # 75% - KBD75
        PCB(name="KBD75 Rev 2 PCB", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.TOP,
            hotswap=False, switch_type=SwitchType.MX, rgb=True, price=45.0,
            compatible_group=group_map["KBD75"]),
        PCB(name="KBD75 V3.1 PCB", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.TOP,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=50.0,
            compatible_group=group_map["KBD75"]),
        # 75% - GMMK Pro
        PCB(name="GMMK Pro PCB", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=60.0,
            compatible_group=group_map["GMMK Pro"]),
        PCB(name="GMMK Pro ISO PCB", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=60.0,
            compatible_group=group_map["GMMK Pro"]),
        # 75% - ID80
        PCB(name="ID80 V2 PCB", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=55.0,
            compatible_group=group_map["ID80"]),
        PCB(name="ID80 Crystal PCB", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=58.0,
            compatible_group=group_map["ID80"]),
        # TKL - KBD8X MKII
        PCB(name="KBD8X MKII PCB", manufacturer="KBDfans", layout=LayoutType.TKL, mounting_type=MountingType.TOP,
            hotswap=False, switch_type=SwitchType.MX, rgb=True, price=65.0,
            compatible_group=group_map["KBD8X MKII"]),
        # TKL - Freebird TKL
        PCB(name="Freebird TKL PCB", manufacturer="Geon", layout=LayoutType.TKL, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=75.0,
            compatible_group=group_map["Freebird TKL"]),
        # Full - Keychron Q6
        PCB(name="Keychron Q6 PCB", manufacturer="Keychron", layout=LayoutType.FULL, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=50.0,
            compatible_group=group_map["Keychron Q6"]),
        # Full - Leopold FC900R
        PCB(name="Leopold FC900R PCB", manufacturer="Leopold", layout=LayoutType.FULL, mounting_type=MountingType.TRAY,
            hotswap=False, switch_type=SwitchType.MX, rgb=False, price=40.0,
            compatible_group=group_map["Leopold FC900R"]),
        # Extra to hit 20
        PCB(name="Keychron Q6 V2 PCB", manufacturer="Keychron", layout=LayoutType.FULL, mounting_type=MountingType.GASKET,
            hotswap=True, switch_type=SwitchType.MX, rgb=True, price=55.0,
            compatible_group=group_map["Keychron Q6"]),
        PCB(name="Leopold FC900R V2 PCB", manufacturer="Leopold", layout=LayoutType.FULL, mounting_type=MountingType.TRAY,
            hotswap=False, switch_type=SwitchType.MX, rgb=False, price=42.0,
            compatible_group=group_map["Leopold FC900R"]),
    ]

    # --- Cases (22개) ---
    cases = [
        # 60% - DZ60 / Tofu60
        Case(name="Tofu60 Aluminum", manufacturer="KBDfans", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
             material="Aluminum", color="Black", weight=800.0, price=88.0,
             compatible_group=group_map["DZ60 / Tofu60"]),
        Case(name="Tofu60 Acrylic", manufacturer="KBDfans", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
             material="Acrylic", color="Frosted", weight=400.0, price=50.0,
             compatible_group=group_map["DZ60 / Tofu60"]),
        # 60% - GH60 / Poker
        Case(name="KPrepublic 60% Plastic", manufacturer="KPrepublic", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
             material="Plastic", color="Black", weight=300.0, price=20.0,
             compatible_group=group_map["GH60 / Poker"]),
        Case(name="5 Degree 60% Case", manufacturer="KBDfans", layout=LayoutType.SIXTY, mounting_type=MountingType.TRAY,
             material="Aluminum", color="Silver", weight=750.0, price=70.0,
             compatible_group=group_map["GH60 / Poker"]),
        # 65% - KBD67 Lite
        Case(name="KBD67 Lite PC Case", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.GASKET,
             material="Polycarbonate", color="Transparent", weight=500.0, price=109.0,
             compatible_group=group_map["KBD67 Lite"]),
        Case(name="KBD67 Lite ABS Case", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.GASKET,
             material="ABS", color="White", weight=400.0, price=89.0,
             compatible_group=group_map["KBD67 Lite"]),
        # 65% - NK65
        Case(name="NK65 Aluminum Case", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.TOP,
             material="Aluminum", color="Black", weight=900.0, price=185.0,
             compatible_group=group_map["NK65"]),
        Case(name="NK65 Entry Case", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE, mounting_type=MountingType.TOP,
             material="Polycarbonate", color="Smoke", weight=450.0, price=95.0,
             compatible_group=group_map["NK65"]),
        # 75% - KBD75
        Case(name="KBD75 V3 Case", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.TOP,
             material="Aluminum", color="Black", weight=1100.0, price=120.0,
             compatible_group=group_map["KBD75"]),
        Case(name="KBD75 V2 Case", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.TOP,
             material="Aluminum", color="Gray", weight=1050.0, price=100.0,
             compatible_group=group_map["KBD75"]),
        # 75% - GMMK Pro
        Case(name="GMMK Pro Black", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Black", weight=1200.0, price=170.0,
             compatible_group=group_map["GMMK Pro"]),
        Case(name="GMMK Pro White", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
             material="Aluminum", color="White", weight=1200.0, price=170.0,
             compatible_group=group_map["GMMK Pro"]),
        # 75% - ID80
        Case(name="ID80 V2 Case", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Silver", weight=1050.0, price=130.0,
             compatible_group=group_map["ID80"]),
        Case(name="ID80 Crystal Case", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE, mounting_type=MountingType.GASKET,
             material="Polycarbonate", color="Transparent", weight=600.0, price=100.0,
             compatible_group=group_map["ID80"]),
        # TKL - KBD8X MKII
        Case(name="KBD8X MKII Aluminum Case", manufacturer="KBDfans", layout=LayoutType.TKL, mounting_type=MountingType.TOP,
             material="Aluminum", color="Black", weight=1500.0, price=200.0,
             compatible_group=group_map["KBD8X MKII"]),
        # TKL - Freebird TKL
        Case(name="Freebird TKL Case", manufacturer="Geon", layout=LayoutType.TKL, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Navy", weight=1600.0, price=350.0,
             compatible_group=group_map["Freebird TKL"]),
        # Full - Keychron Q6
        Case(name="Keychron Q6 Space Gray", manufacturer="Keychron", layout=LayoutType.FULL, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Space Gray", weight=2100.0, price=175.0,
             compatible_group=group_map["Keychron Q6"]),
        Case(name="Keychron Q6 Navy Blue", manufacturer="Keychron", layout=LayoutType.FULL, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Navy Blue", weight=2100.0, price=175.0,
             compatible_group=group_map["Keychron Q6"]),
        # Full - Leopold FC900R
        Case(name="Leopold FC900R Charcoal", manufacturer="Leopold", layout=LayoutType.FULL, mounting_type=MountingType.TRAY,
             material="Plastic", color="Charcoal", weight=1100.0, price=90.0,
             compatible_group=group_map["Leopold FC900R"]),
        Case(name="Leopold FC900R White", manufacturer="Leopold", layout=LayoutType.FULL, mounting_type=MountingType.TRAY,
             material="Plastic", color="White", weight=1100.0, price=90.0,
             compatible_group=group_map["Leopold FC900R"]),
        # Extra to hit 22
        Case(name="KBD8X MKII E-White Case", manufacturer="KBDfans", layout=LayoutType.TKL, mounting_type=MountingType.TOP,
             material="Aluminum", color="E-White", weight=1500.0, price=210.0,
             compatible_group=group_map["KBD8X MKII"]),
        Case(name="Freebird TKL Silver Case", manufacturer="Geon", layout=LayoutType.TKL, mounting_type=MountingType.GASKET,
             material="Aluminum", color="Silver", weight=1600.0, price=350.0,
             compatible_group=group_map["Freebird TKL"]),
    ]

    # --- Plates (22개) ---
    plates = [
        # 60% - DZ60 / Tofu60
        Plate(name="DZ60 Aluminum Plate", manufacturer="KBDfans", layout=LayoutType.SIXTY,
              material="Aluminum", switch_type=SwitchType.MX, price=18.0,
              compatible_group=group_map["DZ60 / Tofu60"]),
        Plate(name="DZ60 Brass Plate", manufacturer="KBDfans", layout=LayoutType.SIXTY,
              material="Brass", switch_type=SwitchType.MX, price=35.0,
              compatible_group=group_map["DZ60 / Tofu60"]),
        # 60% - GH60 / Poker
        Plate(name="GH60 Universal Steel Plate", manufacturer="Generic", layout=LayoutType.SIXTY,
              material="Steel", switch_type=SwitchType.MX, price=15.0,
              compatible_group=group_map["GH60 / Poker"]),
        Plate(name="GH60 FR4 Plate", manufacturer="Generic", layout=LayoutType.SIXTY,
              material="FR4", switch_type=SwitchType.MX, price=12.0,
              compatible_group=group_map["GH60 / Poker"]),
        # 65% - KBD67 Lite
        Plate(name="KBD67 Lite PC Plate", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE,
              material="Polycarbonate", switch_type=SwitchType.MX, price=18.0,
              compatible_group=group_map["KBD67 Lite"]),
        Plate(name="KBD67 Lite Aluminum Plate", manufacturer="KBDfans", layout=LayoutType.SIXTY_FIVE,
              material="Aluminum", switch_type=SwitchType.MX, price=22.0,
              compatible_group=group_map["KBD67 Lite"]),
        # 65% - NK65
        Plate(name="NK65 Aluminum Plate", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE,
              material="Aluminum", switch_type=SwitchType.MX, price=25.0,
              compatible_group=group_map["NK65"]),
        Plate(name="NK65 PC Plate", manufacturer="Novelkeys", layout=LayoutType.SIXTY_FIVE,
              material="Polycarbonate", switch_type=SwitchType.MX, price=20.0,
              compatible_group=group_map["NK65"]),
        # 75% - KBD75
        Plate(name="KBD75 Brass Plate", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE,
              material="Brass", switch_type=SwitchType.MX, price=38.0,
              compatible_group=group_map["KBD75"]),
        Plate(name="KBD75 Aluminum Plate", manufacturer="KBDfans", layout=LayoutType.SEVENTY_FIVE,
              material="Aluminum", switch_type=SwitchType.MX, price=22.0,
              compatible_group=group_map["KBD75"]),
        # 75% - GMMK Pro
        Plate(name="GMMK Pro PC Plate", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE,
              material="Polycarbonate", switch_type=SwitchType.MX, price=30.0,
              compatible_group=group_map["GMMK Pro"]),
        Plate(name="GMMK Pro Aluminum Plate", manufacturer="Glorious", layout=LayoutType.SEVENTY_FIVE,
              material="Aluminum", switch_type=SwitchType.MX, price=25.0,
              compatible_group=group_map["GMMK Pro"]),
        # 75% - ID80
        Plate(name="ID80 Aluminum Plate", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE,
              material="Aluminum", switch_type=SwitchType.MX, price=25.0,
              compatible_group=group_map["ID80"]),
        Plate(name="ID80 PC Plate", manufacturer="Idobao", layout=LayoutType.SEVENTY_FIVE,
              material="Polycarbonate", switch_type=SwitchType.MX, price=20.0,
              compatible_group=group_map["ID80"]),
        # TKL - KBD8X MKII
        Plate(name="KBD8X Brass Plate", manufacturer="KBDfans", layout=LayoutType.TKL,
              material="Brass", switch_type=SwitchType.MX, price=45.0,
              compatible_group=group_map["KBD8X MKII"]),
        Plate(name="KBD8X Aluminum Plate", manufacturer="KBDfans", layout=LayoutType.TKL,
              material="Aluminum", switch_type=SwitchType.MX, price=30.0,
              compatible_group=group_map["KBD8X MKII"]),
        # TKL - Freebird TKL
        Plate(name="Freebird TKL Aluminum Plate", manufacturer="Geon", layout=LayoutType.TKL,
              material="Aluminum", switch_type=SwitchType.MX, price=40.0,
              compatible_group=group_map["Freebird TKL"]),
        Plate(name="Freebird TKL PC Plate", manufacturer="Geon", layout=LayoutType.TKL,
              material="Polycarbonate", switch_type=SwitchType.MX, price=35.0,
              compatible_group=group_map["Freebird TKL"]),
        # Full - Keychron Q6
        Plate(name="Keychron Q6 Steel Plate", manufacturer="Keychron", layout=LayoutType.FULL,
              material="Steel", switch_type=SwitchType.MX, price=25.0,
              compatible_group=group_map["Keychron Q6"]),
        # Full - Leopold FC900R
        Plate(name="Leopold FC900R Steel Plate", manufacturer="Leopold", layout=LayoutType.FULL,
              material="Steel", switch_type=SwitchType.MX, price=20.0,
              compatible_group=group_map["Leopold FC900R"]),
        # Extra to hit 22
        Plate(name="Keychron Q6 Aluminum Plate", manufacturer="Keychron", layout=LayoutType.FULL,
              material="Aluminum", switch_type=SwitchType.MX, price=30.0,
              compatible_group=group_map["Keychron Q6"]),
        Plate(name="Leopold FC900R FR4 Plate", manufacturer="Leopold", layout=LayoutType.FULL,
              material="FR4", switch_type=SwitchType.MX, price=15.0,
              compatible_group=group_map["Leopold FC900R"]),
    ]

    # --- Switches (8개) ---
    switches = [
        Switch(name="Cherry MX Red", manufacturer="Cherry", switch_type=SwitchType.MX,
               pin_count=5, actuation_force=45.0, tactile=False, clicky=False, price=0.75),
        Switch(name="Cherry MX Brown", manufacturer="Cherry", switch_type=SwitchType.MX,
               pin_count=5, actuation_force=55.0, tactile=True, clicky=False, price=0.75),
        Switch(name="Cherry MX Blue", manufacturer="Cherry", switch_type=SwitchType.MX,
               pin_count=5, actuation_force=60.0, tactile=True, clicky=True, price=0.75),
        Switch(name="Gateron Yellow", manufacturer="Gateron", switch_type=SwitchType.MX,
               pin_count=5, actuation_force=50.0, tactile=False, clicky=False, price=0.25),
        Switch(name="Gateron Milky Yellow Pro", manufacturer="Gateron", switch_type=SwitchType.MX,
               pin_count=5, actuation_force=50.0, tactile=False, clicky=False, price=0.30),
        Switch(name="Kailh Box White", manufacturer="Kailh", switch_type=SwitchType.MX,
               pin_count=3, actuation_force=50.0, tactile=True, clicky=True, price=0.35),
        Switch(name="Kailh Box Brown", manufacturer="Kailh", switch_type=SwitchType.MX,
               pin_count=3, actuation_force=50.0, tactile=True, clicky=False, price=0.35),
        Switch(name="Kailh Choc Red", manufacturer="Kailh", switch_type=SwitchType.CHOC,
               pin_count=2, actuation_force=50.0, tactile=False, clicky=False, price=0.50),
    ]

    # --- Keycaps (6개) ---
    keycaps = [
        Keycap(name="GMK Olivia", manufacturer="GMK", profile=KeycapProfile.CHERRY,
               material="ABS", stem_type=SwitchType.MX, price=180.0),
        Keycap(name="GMK Laser", manufacturer="GMK", profile=KeycapProfile.CHERRY,
               material="ABS", stem_type=SwitchType.MX, price=160.0),
        Keycap(name="ePBT Dolch", manufacturer="ePBT", profile=KeycapProfile.CHERRY,
               material="PBT", stem_type=SwitchType.MX, price=89.0),
        Keycap(name="PBTfans Retro", manufacturer="KBDfans", profile=KeycapProfile.CHERRY,
               material="PBT", stem_type=SwitchType.MX, price=75.0),
        Keycap(name="Drop MT3 WoB", manufacturer="Drop", profile=KeycapProfile.MT3,
               material="PBT", stem_type=SwitchType.MX, price=110.0),
        Keycap(name="SP DSA Granite", manufacturer="Signature Plastics", profile=KeycapProfile.DSA,
               material="PBT", stem_type=SwitchType.MX, price=100.0),
    ]

    # --- Stabilizers (4개) ---
    stabilizers = [
        Stabilizer(name="Durock V2", manufacturer="Durock",
                   stab_type=StabilizerType.SCREW_IN, size="2u, 6.25u", price=22.0),
        Stabilizer(name="Cherry Clip-in", manufacturer="Cherry",
                   stab_type=StabilizerType.PLATE_MOUNT, size="2u, 6.25u", price=12.0),
        Stabilizer(name="TX Rev 3", manufacturer="TX Keyboards",
                   stab_type=StabilizerType.SCREW_IN, size="2u, 6.25u", price=18.0),
        Stabilizer(name="Everglide Panda V3", manufacturer="Everglide",
                   stab_type=StabilizerType.SCREW_IN, size="2u, 6.25u, 7u", price=20.0),
    ]

    for pcb in pcbs:
        db.add(pcb)
    for case in cases:
        db.add(case)
    for plate in plates:
        db.add(plate)
    for switch in switches:
        db.add(switch)
    for keycap in keycaps:
        db.add(keycap)
    for stab in stabilizers:
        db.add(stab)

    db.commit()
    db.close()

    print(f"Seed data inserted:")
    print(f"  Compatible Groups: {len(groups)}")
    print(f"  PCBs: {len(pcbs)}")
    print(f"  Cases: {len(cases)}")
    print(f"  Plates: {len(plates)}")
    print(f"  Switches: {len(switches)}")
    print(f"  Keycaps: {len(keycaps)}")
    print(f"  Stabilizers: {len(stabilizers)}")
    print(f"  Total: {len(groups) + len(pcbs) + len(cases) + len(plates) + len(switches) + len(keycaps) + len(stabilizers)}")

if __name__ == "__main__":
    seed_data()
