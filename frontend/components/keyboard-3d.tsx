"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei"
import { SelectedParts } from "@/lib/types"

interface Keyboard3DProps {
    selected: SelectedParts
}

// Switch 컴포넌트
function Switch({ position, color }: {
    position: [number, number, number]
    color: string
}) {
    return (
        <group position={position}>
            {/* Switch 하우징 */}
            <RoundedBox args={[0.7, 0.4, 0.7]} radius={0.05} position={[0, 0.2, 0]}>
                <meshStandardMaterial color="#1a1a1a" roughness={0.5} />
            </RoundedBox>
            {/* Switch 스템 */}
            <RoundedBox args={[0.25, 0.15, 0.25]} radius={0.02} position={[0, 0.45, 0]}>
                <meshStandardMaterial color={color} roughness={0.3} />
            </RoundedBox>
        </group>
    )
}

// 개별 키캡 컴포넌트
function Key({ position, width = 0.92, color, opacity = 1 }: {
    position: [number, number, number]
    width?: number
    color: string
    opacity?: number
}) {
    const keyWidth = width - 0.08
    const keyDepth = 0.84
    return (
        <group position={position}>
            {/* Keycap 베이스 */}
            <RoundedBox args={[keyWidth, 0.12, keyDepth]} radius={0.06} position={[0, 0.5, 0]}>
                <meshStandardMaterial color={color} roughness={0.4} transparent opacity={opacity} />
            </RoundedBox>
            {/* Keycap 상단 */}
            <RoundedBox args={[keyWidth - 0.08, 0.05, keyDepth - 0.1]} radius={0.04} position={[0, 0.58, 0]}>
                <meshStandardMaterial color={color} roughness={0.3} transparent opacity={opacity} />
            </RoundedBox>
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
    const totalDepth = rows.length * keyUnit

    // Case 크기
    const caseWidth = getCaseWidth() * keyUnit
    const caseDepth = caseRows.length * keyUnit
    
    // Plate 크기
    const plateWidth = getPlateWidth() * keyUnit
    const plateDepth = plateRows.length * keyUnit

    // Case 색상
    const getCaseColor = () => {
        const color = selected.case?.color?.toLowerCase()
        if (color === "black") return "#1a1a1a"
        if (color === "white") return "#e8e8e8"
        if (color === "silver") return "#c0c0c0"
        return "#2d2d2d"
    }

    // Plate 색상
    const getPlateColor = () => {
        const material = selected.plate?.material?.toLowerCase()
        if (material === "aluminum") return "#a8a8a8"
        if (material === "polycarbonate") return "#d4d4d4"
        if (material === "brass") return "#b8860b"
        return "#888888"
    }

    // Switch 색상
    const getSwitchColor = () => {
        if (!selected.switch) return "#cccccc"
        const name = selected.switch.name.toLowerCase()
        if (name.includes("yellow")) return "#f5d742"
        if (name.includes("red")) return "#e84545"
        if (name.includes("blue")) return "#4287f5"
        if (name.includes("brown")) return "#8b5a2b"
        if (name.includes("black")) return "#2d2d2d"
        return "#f5d742"  // 기본 노란색
    }

    // Keycap 색상
    const getKeycapColor = () => {
        if (!selected.keycap) return "#cccccc"
        const name = selected.keycap.name.toLowerCase()
        if (name.includes("olivia")) return "#e8c4c4"
        if (name.includes("dolch")) return "#4a4a4a"
        if (name.includes("botanical")) return "#2d5a3d"
        if (name.includes("mizu")) return "#6fa8c7"
        if (name.includes("laser")) return "#9b4dca"
        if (name.includes("carbon")) return "#f57c00"
        return "#f0f0f0"
    }

    const caseColor = getCaseColor()
    const plateColor = getPlateColor()
    const switchColor = getSwitchColor()
    const keycapColor = getKeycapColor()
    const keycapOpacity = selected.keycap ? 1 : 0.3  // 키캡 미선택 시 반투명

    // 중앙 Y 오프셋 계산
    const centerYOffset = (rows.length - 1) / 2

    return (
        <group rotation={[0.3, 0, 0]} position={[0, -0.5, 0]}>
            {/* Case 바닥 */}
            <RoundedBox args={[caseWidth + 1, 0.5, caseDepth + 1]} radius={0.2} position={[0, -0.35, 0]}>
                <meshStandardMaterial color={caseColor} roughness={0.3} metalness={0.1} />
            </RoundedBox>

            {/* Case 상단 프레임 */}
            <RoundedBox args={[caseWidth + 0.6, 0.25, caseDepth + 0.6]} radius={0.1} position={[0, -0.05, 0]}>
                <meshStandardMaterial color={caseColor} roughness={0.3} metalness={0.1} />
            </RoundedBox>

            {/* 레이아웃 일치하지 않을 경우 경고 */}
            {isLayoutMismatch && (
                <mesh position={[0, 0.2, 0]}>
                    <boxGeometry args={[caseWidth + 1.2, 0.05, caseDepth + 1.2]} />
                    <meshStandardMaterial color="#ff0000" transparent opacity={0.6} />
                </mesh>
            )}

            {/* Plate */}
            <RoundedBox args={[plateWidth + 0.2, 0.06, plateDepth + 0.2]} radius={0.02} position={[0, 0.1, 0]}>
                <meshStandardMaterial color={plateColor} roughness={0.2} metalness={0.8} />
            </RoundedBox>

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
                                {/* Switch (항상 렌더링) */}
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
