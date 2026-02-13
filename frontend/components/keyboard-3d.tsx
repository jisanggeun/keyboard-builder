"use client"

import { useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei"
import * as THREE from "three"
import { SelectedParts } from "@/lib/types"

interface Keyboard3DProps {
    selected: SelectedParts
}

// 키캡 지오메트리 (사다리꼴 - 아래 넓고 위 좁음, 바닥 없음)
function useKeycapGeometry(botW: number, botD: number, topW: number, topD: number, height: number) {
    return useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const wall = 0.04
        const topThick = 0.06

        // 외부 꼭짓점
        const hw1 = botW / 2, hd1 = botD / 2
        const hw2 = topW / 2, hd2 = topD / 2

        // 내부 꼭짓점 (벽 두께만큼 안쪽)
        const iw1 = hw1 - wall, id1 = hd1 - wall
        const iw2 = hw2 - wall, id2 = hd2 - wall
        const ih = height - topThick  // 내부 높이

        const verts: number[] = []
        const idx: number[] = []
        let vi = 0

        function quad(a: number[], b: number[], c: number[], d: number[]) {
            verts.push(...a, ...b, ...c, ...d)
            idx.push(vi, vi+1, vi+2, vi, vi+2, vi+3)
            vi += 4
        }

        // 외부 상판
        quad([-hw2,height,-hd2],[hw2,height,-hd2],[hw2,height,hd2],[-hw2,height,hd2])       
        // 외부 앞면
        quad([-hw2,height,hd2],[hw2,height,hd2],[hw1,0,hd1],[-hw1,0,hd1])
        // 외부 뒷면
        quad([hw2,height,-hd2],[-hw2,height,-hd2],[-hw1,0,-hd1],[hw1,0,-hd1])       
        // 외부 왼쪽
        quad([-hw2,height,-hd2],[-hw2,height,hd2],[-hw1,0,hd1],[-hw1,0,-hd1])       
        // 외부 오른쪽
        quad([hw2,height,hd2],[hw2,height,-hd2],[hw1,0,-hd1],[hw1,0,hd1])

        // 내부 앞면 (법선 안쪽)
        quad([iw2,ih,id2],[-iw2,ih,id2],[-iw1,0,id1],[iw1,0,id1])
        // 내부 뒷면
        quad([-iw2,ih,-id2],[iw2,ih,-id2],[iw1,0,-id1],[-iw1,0,-id1])
        // 내부 왼쪽
        quad([-iw2,ih,id2],[-iw2,ih,-id2],[-iw1,0,-id1],[-iw1,0,id1])
        // 내부 오른쪽
        quad([iw2,ih,-id2],[iw2,ih,id2],[iw1,0,id1],[iw1,0,-id1])
        // 내부 천장
        quad([-iw2,ih,-id2],[-iw2,ih,id2],[iw2,ih,id2],[iw2,ih,-id2])

        // 바닥 테두리 (외부↔내부 연결)
        quad([-hw1,0,hd1],[hw1,0,hd1],[iw1,0,id1],[-iw1,0,id1])
        quad([hw1,0,-hd1],[-hw1,0,-hd1],[-iw1,0,-id1],[iw1,0,-id1])
        quad([-hw1,0,-hd1],[-hw1,0,hd1],[-iw1,0,id1],[-iw1,0,-id1])
        quad([hw1,0,hd1],[hw1,0,-hd1],[iw1,0,-id1],[iw1,0,id1])

        geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
        geo.setIndex(idx)
        geo.computeVertexNormals()
        return geo
    }, [botW, botD, topW, topD, height])
}

// Case 지오메트리 (bathtub 형태 - 바닥 + 벽 일체형)
function useCaseGeometry(outerW: number, outerD: number, totalH: number, wallThick: number, floorH: number) {
    return useMemo(() => {
        const geo = new THREE.BufferGeometry()
        const verts: number[] = []
        const idx: number[] = []
        let vi = 0

        function quad(a: number[], b: number[], c: number[], d: number[]) {
            verts.push(...a, ...b, ...c, ...d)
            idx.push(vi, vi+1, vi+2, vi, vi+2, vi+3)
            vi += 4
        }

        const hw = outerW / 2, hd = outerD / 2
        const iw = hw - wallThick, id = hd - wallThick

        // 외부 바닥
        quad([-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd])
        // 외부 앞면
        quad([-hw, totalH, hd], [hw, totalH, hd], [hw, 0, hd], [-hw, 0, hd])
        // 외부 뒷면
        quad([hw, totalH, -hd], [-hw, totalH, -hd], [-hw, 0, -hd], [hw, 0, -hd])
        // 외부 왼쪽
        quad([-hw, totalH, -hd], [-hw, totalH, hd], [-hw, 0, hd], [-hw, 0, -hd])
        // 외부 오른쪽
        quad([hw, totalH, hd], [hw, totalH, -hd], [hw, 0, -hd], [hw, 0, hd])

        // 내부 바닥 (올려진 위치 - 플레이트와 Z-fighting 방지)
        const fh = floorH - 0.02
        quad([-iw, fh, id], [iw, fh, id], [iw, fh, -id], [-iw, fh, -id])
        // 내부 앞면
        quad([iw, totalH, id], [-iw, totalH, id], [-iw, fh, id], [iw, fh, id])
        // 내부 뒷면
        quad([-iw, totalH, -id], [iw, totalH, -id], [iw, fh, -id], [-iw, fh, -id])
        // 내부 왼쪽
        quad([-iw, totalH, id], [-iw, totalH, -id], [-iw, fh, -id], [-iw, fh, id])
        // 내부 오른쪽
        quad([iw, totalH, -id], [iw, totalH, id], [iw, fh, id], [iw, fh, -id])

        // 상단 림 (외부 ↔ 내부 연결)
        quad([-hw, totalH, hd], [-iw, totalH, id], [iw, totalH, id], [hw, totalH, hd])
        quad([hw, totalH, -hd], [iw, totalH, -id], [-iw, totalH, -id], [-hw, totalH, -hd])
        quad([-hw, totalH, -hd], [-iw, totalH, -id], [-iw, totalH, id], [-hw, totalH, hd])
        quad([hw, totalH, hd], [iw, totalH, id], [iw, totalH, -id], [hw, totalH, -hd])

        geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3))
        geo.setIndex(idx)
        geo.computeVertexNormals()
        return geo
    }, [outerW, outerD, totalH, wallThick, floorH])
}

// Switch 컴포넌트
function Switch({ position, color }: {
    position: [number, number, number]
    color: string
}) {
    return (
        <group position={position}>
            {/* Switch 하우징 */}
            <RoundedBox args={[0.6, 0.35, 0.6]} radius={0.05} position={[0, 0.175, 0]}>
                <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </RoundedBox>
            {/* Switch 스템 */}
            <RoundedBox args={[0.25, 0.10, 0.25]} radius={0.02} position={[0, 0.38, 0]}>
                <meshStandardMaterial color={color} roughness={0.3} />
            </RoundedBox>
        </group>
    )
}

// Stabilizer 컴포넌트 (2u 이상 키에 사용)
function Stabilizer({ position, widthU, stabName }: {
    position: [number, number, number]
    widthU: number
    stabName: string
}) {
    if (widthU < 2) return null

    const spacing = widthU >= 6 ? 4.83 : widthU >= 3 ? 1.84 : 1.15
    const half = spacing / 2

    // 브랜드별 색상 차이
    const isDurock = stabName.toLowerCase().includes("durock")
    const housingColor = isDurock ? "#c8d8e0" : "#2a2a2a"
    const housingOpacity = isDurock ? 0.6 : 1
    const wireColor = isDurock ? "#d4a844" : "#aaaaaa"
    const stemColor = isDurock ? "#d4a844" : "#e0e0e0"

    return (
        <group position={position}>
            {/* 좌측 하우징 */}
            <mesh position={[-half, 0.12, 0]}>
                <boxGeometry args={[0.14, 0.24, 0.28]} />
                <meshStandardMaterial
                    color={housingColor}
                    roughness={0.4}
                    transparent={isDurock}
                    opacity={housingOpacity}
                />
            </mesh>
            {/* 우측 하우징 */}
            <mesh position={[half, 0.12, 0]}>
                <boxGeometry args={[0.14, 0.24, 0.28]} />
                <meshStandardMaterial
                    color={housingColor}
                    roughness={0.4}
                    transparent={isDurock}
                    opacity={housingOpacity}
                />
            </mesh>
            {/* 좌측 스템 */}
            <mesh position={[-half, 0.28, 0]}>
                <boxGeometry args={[0.07, 0.08, 0.07]} />
                <meshStandardMaterial color={stemColor} roughness={0.3} />
            </mesh>
            {/* 우측 스템 */}
            <mesh position={[half, 0.28, 0]}>
                <boxGeometry args={[0.07, 0.08, 0.07]} />
                <meshStandardMaterial color={stemColor} roughness={0.3} />
            </mesh>
            {/* 와이어 - 수평 */}
            <mesh position={[0, 0.03, 0.12]}>
                <boxGeometry args={[spacing, 0.02, 0.02]} />
                <meshStandardMaterial color={wireColor} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* 와이어 - 좌측 수직 */}
            <mesh position={[-half, 0.09, 0.12]}>
                <boxGeometry args={[0.02, 0.14, 0.02]} />
                <meshStandardMaterial color={wireColor} metalness={0.9} roughness={0.1} />
            </mesh>
            {/* 와이어 - 우측 수직 */}
            <mesh position={[half, 0.09, 0.12]}>
                <boxGeometry args={[0.02, 0.14, 0.02]} />
                <meshStandardMaterial color={wireColor} metalness={0.9} roughness={0.1} />
            </mesh>
        </group>
    )
}

// 행별 스컬프팅 설정 (높이 차이 미묘, 기울기로 스컬프팅)
const ROW_SCULPT: Record<string, { height: number; tilt: number }[]> = {
    Cherry: [
        { height: 0.38, tilt: -0.15 },  // R1 (숫자행)
        { height: 0.34, tilt: -0.08 },  // R2 (QWERTY)
        { height: 0.32, tilt: 0 },       // R3 (홈행)
        { height: 0.33, tilt: 0.06 },    // R4 (하단)
        { height: 0.32, tilt: 0.10 },    // R5 (스페이스)
    ],
    OEM: [
        { height: 0.42, tilt: -0.18 },
        { height: 0.38, tilt: -0.10 },
        { height: 0.36, tilt: 0 },
        { height: 0.37, tilt: 0.08 },
        { height: 0.36, tilt: 0.12 },
    ],
    SA: [
        { height: 0.56, tilt: -0.18 },
        { height: 0.50, tilt: -0.10 },
        { height: 0.46, tilt: 0 },
        { height: 0.46, tilt: 0.10 },
        { height: 0.44, tilt: 0.12 },
    ],
    DSA: [
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
    ],
    MT3: [
        { height: 0.54, tilt: -0.20 },
        { height: 0.48, tilt: -0.10 },
        { height: 0.44, tilt: 0 },
        { height: 0.44, tilt: 0.10 },
        { height: 0.42, tilt: 0.12 },
    ],
}

// 개별 Keycap 컴포넌트
function Key({ position, width = 0.92, color, opacity = 1, profile = "Cherry", row = 2 }: {
    position: [number, number, number]
    width?: number
    color: string
    opacity?: number
    profile?: string
    row?: number  // 0~4 (위에서 아래로)
}) {
    const botW = width - 0.14
    const botD = 0.78
    const taper = 0.12  // 위가 이만큼 좁아짐
    const topW = botW - taper
    const topD = botD - taper
    const baseY = 0.28

    // 행별 스컬프팅
    const sculpts = ROW_SCULPT[profile] || ROW_SCULPT.Cherry
    const sculpt = sculpts[Math.min(row, sculpts.length - 1)]
    const height = sculpt.height
    const tilt = sculpt.tilt

    const geometry = useKeycapGeometry(botW, botD, topW, topD, height)

    return (
        <group position={position}>
            <group rotation={[tilt, 0, 0]}>
                {/* Keycap 본체 */}
                <mesh geometry={geometry} position={[0, baseY, 0]}>
                    <meshStandardMaterial
                        color={color}
                        roughness={0.4}
                        transparent
                        opacity={opacity}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* 상단 디쉬 */}
                <RoundedBox
                    args={[topW - 0.06, 0.02, topD - 0.06]}
                    radius={0.02}
                    position={[0, baseY + height - 0.02, 0]}
                >
                    <meshStandardMaterial
                        color={color}
                        roughness={0.2}
                        metalness={0.05}
                        transparent
                        opacity={opacity}
                    />
                </RoundedBox>

            </group>
        </group>
    )
}

// 레이아웃별 키 배열 정의
const LAYOUTS: Record<string, { keys: number[], y: number }[]> = {
    "60%": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], y: 2 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], y: 1 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], y: 0 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], y: -1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], y: -2 },
    ],
    "65%": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 2 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 1 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 0 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: -1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1, 1, 1], y: -2 },
    ],
    "75%": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], y: 3 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 2 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 1 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 0 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: -1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1, 1, 1], y: -2 },
    ],
    "TKL": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1], y: 3 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0.5, 1, 1, 1], y: 2 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 1, 1, 1], y: 1 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 0.5, 0, 0, 0], y: 0 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 0.5, 0, 1, 0], y: -1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, 0.5, 1, 1, 1], y: -2 },
    ],
    "Full": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 1], y: 3 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 1], y: 2 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 1, 1, 1, 0.5, 1, 1, 1, 1], y: 1 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 0.5, 0, 0, 0, 0.5, 1, 1, 1, 1], y: 0 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, 0.5, 0, 1, 0, 0.5, 1, 1, 1, 2], y: -1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, 0.5, 1, 1, 1, 0.5, 2, 1, 0], y: -2 },
    ],
}

function KeyboardModel({ selected }: Keyboard3DProps) {
    // PCB 레이아웃 (키 배열)
    const pcbLayout = selected.pcb?.layout || "60%"
    const rows = LAYOUTS[pcbLayout] || LAYOUTS["60%"]
    
    // Case 레이아웃 (Case 크기)
    const caseLayout = selected.case?.layout || pcbLayout
    const caseRows = LAYOUTS[caseLayout] || LAYOUTS["60%"]

    // Plate 레이아웃 (Plate 크기)
    const plateLayout = selected.plate?.layout || pcbLayout
    const plateRows = LAYOUTS[plateLayout] || LAYOUTS["60%"]

    // 호환성 체크
    const isLayoutMismatch =
      (selected.pcb && selected.case && pcbLayout !== caseLayout) ||
      (selected.pcb && selected.plate && pcbLayout !== plateLayout) ||
      (selected.case && selected.plate && caseLayout !== plateLayout)

    // 레이아웃별 너비 계산
    const getLayoutWidth = () => {
        const firstRow = rows[0].keys.filter(k => k > 0)
        return firstRow.reduce((sum, k) => sum + k, 0)
    }

    // Case 크기 계산 (레이아웃 기준)
    const getCaseWidth = () => {
        const firstRow = caseRows[0].keys.filter(k => k > 0)
        return firstRow.reduce((sum, k) => sum + k, 0)
    }

    // Plate 크기 계산 (레이아웃 기준)
    const getPlateWidth = () => {
        const firstRow = plateRows[0].keys.filter(k => k > 0)
        return firstRow.reduce((sum, k) => sum + k, 0)
    }

    const keyUnit = 0.92
    const totalWidth = getLayoutWidth() * keyUnit

    // Case 크기
    const caseWidth = getCaseWidth() * keyUnit
    const caseDepth = caseRows.length * keyUnit
    
    // Plate 크기
    const plateWidth = getPlateWidth() * keyUnit
    const plateDepth = plateRows.length * keyUnit

    // Case 색상
    const getCaseColor = () => {
        const color = selected.case?.color?.toLowerCase()
        if(color === "black") return "#1a1a1a"
        if(color === "white") return "#e8e8e8"
        if(color === "silver") return "#c0c0c0"
        return "#2d2d2d"
    }

    // Plate 재질별 속성
    const getPlateProps = () => {
        const material = selected.plate?.material?.toLowerCase()
        if (material === "brass") return { color: "#b8860b", roughness: 0.1, metalness: 0.95, transparent: false, opacity: 1 }
        if (material === "polycarbonate") return { color: "#e0e0e0", roughness: 0.3, metalness: 0.0, transparent: true, opacity: 0.7 }
        if (material === "fr4") return { color: "#2d5a2d", roughness: 0.6, metalness: 0.1, transparent: false, opacity: 1 }
        return { color: "#a8a8a8", roughness: 0.15, metalness: 0.9, transparent: false, opacity: 1 }  // aluminum
    }

    // Switch 색상
    const getSwitchColor = () => {
        if(!selected.switch) return "#cccccc"
        const name = selected.switch.name.toLowerCase()
        if(name.includes("yellow")) return "#f5d742"
        if(name.includes("red")) return "#e84545"
        if(name.includes("blue")) return "#4287f5"
        if(name.includes("brown")) return "#8b5a2b"
        if(name.includes("black")) return "#2d2d2d"
        return "#f5d742"  // 기본 노란색
    }

    // Keycap 색상
    const getKeycapColor = () => {
        if (!selected.keycap) return "#cccccc"
        const name = selected.keycap.name.toLowerCase()
        if(name.includes("olivia")) return "#e8c4c4"
        if(name.includes("dolch")) return "#4a4a4a"
        if(name.includes("botanical")) return "#2d5a3d"
        if(name.includes("mizu")) return "#6fa8c7"
        if(name.includes("laser")) return "#9b4dca"
        if(name.includes("carbon")) return "#f57c00"
        return "#f0f0f0"
    }

    const caseColor = getCaseColor()
    const plateProps = getPlateProps()
    const switchColor = getSwitchColor()
    const keycapColor = getKeycapColor()
    const keycapOpacity = selected.keycap ? 1 : 0.3  // 키캡 미선택 시 반투명
    const keycapProfile = selected.keycap?.profile || "Cherry"

    // 중앙 Y 오프셋 계산
    const centerYOffset = (rows.length - 1) / 2

    // Case 지오메트리 (bathtub 일체형)
    const caseGeometry = useCaseGeometry(
        caseWidth + 1,   // outerW
        caseDepth + 1,   // outerD
        1.0,             // totalH (0.7 바닥 + 0.3 베젤)
        0.25,            // wallThick
        0.7              // floorH (내부 바닥 높이)
    )

    return (
        <group rotation={[0.3, 0, 0]} position={[0, -0.5, 0]}>
            {/* Case (bathtub 일체형) */}
            <mesh geometry={caseGeometry} position={[0, -0.6, 0]}>
                <meshStandardMaterial
                    color={caseColor}
                    roughness={0.3}
                    metalness={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* 레이아웃 일치하지 않을 경우 경고 */}
            {isLayoutMismatch && (
                <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[caseWidth + 1.2, 0.05, caseDepth + 1.2]} />
                    <meshStandardMaterial 
                        color="#ff0000" 
                        transparent 
                        opacity={0.6} 
                    />
                </mesh>
            )}

            {/* Plate (얇은 금속판) */}
            {selected.plate && (
                <RoundedBox args={[plateWidth + 0.2, 0.03, plateDepth + 0.2]} radius={0.01} position={[0, 0.1, 0]}>
                    <meshStandardMaterial
                        color={plateProps.color}
                        roughness={plateProps.roughness}
                        metalness={plateProps.metalness}
                        transparent={plateProps.transparent}
                        opacity={plateProps.opacity}
                    />
                </RoundedBox>
            )}

            {/* Switch + Keycap */}
            <group position={[-totalWidth / 2, 0.1, centerYOffset * keyUnit]}>
                {rows.map((row, rowIndex) => {
                    let xOffset = 0
                    return row.keys.map((keyWidth, keyIndex) => {
                        if (keyWidth === 0) {
                            return null  // 빈 공간
                        }
                        if (keyWidth === 0.5) {
                            xOffset += 0.25 * keyUnit  // 작은 갭
                            return null
                        }
                        const x = xOffset + (keyWidth * keyUnit) / 2
                        xOffset += keyWidth * keyUnit
                        const z = (row.y - centerYOffset) * keyUnit
                        return (
                            <group key={`${rowIndex}-${keyIndex}`}>
                                {/* Plate 스위치 컷아웃 (구멍 표현) */}
                                {selected.plate && (
                                    <mesh position={[x, 0.017, z]}>
                                        <boxGeometry args={[0.58, 0.008, 0.58]} />
                                        <meshStandardMaterial color="#080808" roughness={0.9} />
                                    </mesh>
                                )}
                                {/* Stabilizer (2u 이상 키) */}
                                {selected.stabilizer && keyWidth >= 2 && (
                                    <Stabilizer
                                        position={[x, 0, z]}
                                        widthU={keyWidth}
                                        stabName={selected.stabilizer.name}
                                    />
                                )}
                                {/* Switch */}
                                {selected.switch && (
                                    <Switch
                                        position={[x, 0, z]}
                                        color={switchColor}
                                    />
                                )}
                                {/* Keycap */}
                                <Key
                                    position={[x, 0, z]}
                                    width={keyWidth * keyUnit}
                                    color={keycapColor}
                                    opacity={keycapOpacity}
                                    profile={keycapProfile}
                                    row={rowIndex}
                                />
                            </group>
                        )
                    })
                })}
            </group>
        </group>
    )
}

export function Keyboard3D({ selected }: Keyboard3DProps) {
    return (
        <div className="w-full h-[300px] sm:h-[400px] bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <Canvas camera={{ position: [0, 8, 12], fov: 40 }}>
                <ambientLight intensity={0.4} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <directionalLight position={[-10, 5, -5]} intensity={0.3} />
                <KeyboardModel selected={selected} />
                <OrbitControls
                    enablePan={false}
                    minDistance={8}
                    maxDistance={25}
                    minPolarAngle={0.2}
                    maxPolarAngle={Math.PI / 2.2}
                />
                <Environment preset="studio" />
            </Canvas>
        </div>
    )
}
