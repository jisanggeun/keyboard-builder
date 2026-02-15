"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, RoundedBox, Environment } from "@react-three/drei"
import * as THREE from "three"
import { SelectedParts } from "@/lib/types"

interface Keyboard3DProps {
    selected: SelectedParts
    mini?: boolean
    expanded?: boolean
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

// Mounting Structure 컴포넌트
function MountingStructure({ mountingType, caseColor, caseWidth, caseDepth }: {
    mountingType: string
    caseColor: string
    caseWidth: number
    caseDepth: number
}) {
    const hw = caseWidth / 2
    const hd = caseDepth / 2

    if (mountingType === "Tray") {
        // Tray mount: brass standoff 기둥 배치 (7개)
        const standoffPositions: [number, number, number][] = [
            [-hw * 0.6, -0.55, -hd * 0.5],
            [0, -0.55, -hd * 0.5],
            [hw * 0.6, -0.55, -hd * 0.5],
            [-hw * 0.3, -0.55, 0],
            [hw * 0.3, -0.55, 0],
            [-hw * 0.6, -0.55, hd * 0.5],
            [hw * 0.6, -0.55, hd * 0.5],
        ]
        return (
            <group>
                {standoffPositions.map((pos, i) => (
                    <mesh key={i} position={pos}>
                        <cylinderGeometry args={[0.12, 0.14, 0.12, 8]} />
                        <meshStandardMaterial color="#b8860b" metalness={0.9} roughness={0.15} />
                    </mesh>
                ))}
            </group>
        )
    }

    if (mountingType === "Gasket") {
        // Gasket mount: 케이스 내벽 상단에 가스켓 스트립 (양쪽 + 앞뒤)
        const stripThick = 0.06
        const stripH = 0.08
        const wallOffset = 0.25
        return (
            <group>
                {/* 좌측 가스켓 스트립 */}
                <mesh position={[-(hw - wallOffset), -0.15, 0]}>
                    <boxGeometry args={[stripThick, stripH, caseDepth * 0.7]} />
                    <meshStandardMaterial color="#4a4a4a" transparent opacity={0.6} roughness={0.8} />
                </mesh>
                {/* 우측 가스켓 스트립 */}
                <mesh position={[(hw - wallOffset), -0.15, 0]}>
                    <boxGeometry args={[stripThick, stripH, caseDepth * 0.7]} />
                    <meshStandardMaterial color="#4a4a4a" transparent opacity={0.6} roughness={0.8} />
                </mesh>
                {/* 앞쪽 가스켓 스트립 */}
                <mesh position={[0, -0.15, (hd - wallOffset)]}>
                    <boxGeometry args={[caseWidth * 0.7, stripH, stripThick]} />
                    <meshStandardMaterial color="#4a4a4a" transparent opacity={0.6} roughness={0.8} />
                </mesh>
                {/* 뒤쪽 가스켓 스트립 */}
                <mesh position={[0, -0.15, -(hd - wallOffset)]}>
                    <boxGeometry args={[caseWidth * 0.7, stripH, stripThick]} />
                    <meshStandardMaterial color="#4a4a4a" transparent opacity={0.6} roughness={0.8} />
                </mesh>
            </group>
        )
    }

    if (mountingType === "Top") {
        // Top mount: 케이스 상단 림에서 안쪽으로 돌출된 탭 4개
        const tabW = 0.5
        const tabH = 0.06
        const tabD = 0.15
        return (
            <group>
                {/* 좌측 앞 탭 */}
                <mesh position={[-(hw - 0.3), -0.1, hd * 0.4]}>
                    <boxGeometry args={[tabD, tabH, tabW]} />
                    <meshStandardMaterial color={caseColor} metalness={0.7} roughness={0.2} />
                </mesh>
                {/* 좌측 뒤 탭 */}
                <mesh position={[-(hw - 0.3), -0.1, -hd * 0.4]}>
                    <boxGeometry args={[tabD, tabH, tabW]} />
                    <meshStandardMaterial color={caseColor} metalness={0.7} roughness={0.2} />
                </mesh>
                {/* 우측 앞 탭 */}
                <mesh position={[(hw - 0.3), -0.1, hd * 0.4]}>
                    <boxGeometry args={[tabD, tabH, tabW]} />
                    <meshStandardMaterial color={caseColor} metalness={0.7} roughness={0.2} />
                </mesh>
                {/* 우측 뒤 탭 */}
                <mesh position={[(hw - 0.3), -0.1, -hd * 0.4]}>
                    <boxGeometry args={[tabD, tabH, tabW]} />
                    <meshStandardMaterial color={caseColor} metalness={0.7} roughness={0.2} />
                </mesh>
            </group>
        )
    }

    return null
}

// 행별 스컬프팅 설정 (높이 차이 미묘, 기울기로 스컬프팅)
const ROW_SCULPT: Record<string, { height: number; tilt: number }[]> = {
    Cherry: [
        { height: 0.38, tilt: -0.06 },  // R1 (숫자행)
        { height: 0.34, tilt: -0.03 },  // R2 (QWERTY)
        { height: 0.32, tilt: 0 },       // R3 (홈행)
        { height: 0.33, tilt: 0.02 },    // R4 (하단)
        { height: 0.32, tilt: 0.04 },    // R5 (스페이스)
    ],
    OEM: [
        { height: 0.42, tilt: -0.07 },
        { height: 0.38, tilt: -0.04 },
        { height: 0.36, tilt: 0 },
        { height: 0.37, tilt: 0.03 },
        { height: 0.36, tilt: 0.05 },
    ],
    SA: [
        { height: 0.56, tilt: -0.07 },
        { height: 0.50, tilt: -0.04 },
        { height: 0.46, tilt: 0 },
        { height: 0.46, tilt: 0.04 },
        { height: 0.44, tilt: 0.05 },
    ],
    DSA: [
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
        { height: 0.30, tilt: 0 },
    ],
    MT3: [
        { height: 0.54, tilt: -0.08 },
        { height: 0.48, tilt: -0.04 },
        { height: 0.44, tilt: 0 },
        { height: 0.44, tilt: 0.04 },
        { height: 0.42, tilt: 0.05 },
    ],
}

// 개별 Keycap 컴포넌트
function Key({ position, width = 0.92, depth = 0.78, color, opacity = 1, profile = "Cherry", row = 2 }: {
    position: [number, number, number]
    width?: number
    depth?: number
    color: string
    opacity?: number
    profile?: string
    row?: number  // 0~4 (위에서 아래로)
}) {
    const botW = width - 0.14
    const botD = depth
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
// 양수 >= 1: 키 너비(U), 음수: 갭(절대값 U), 0: 빈 1U 공간(오프셋만 이동)
// 객체 {w, h}: 세로 2칸 이상 키 (넘패드 +, Enter 등)
type KeyEntry = number | { w: number; h: number }
const LAYOUTS: Record<string, { keys: KeyEntry[], y: number }[]> = {
    "60%": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2], y: 4 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], y: 3 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], y: 2 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], y: 1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], y: 0 },
    ],
    "65%": [
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 4 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 3 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 2 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: 1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, -0.5, 1, 1, 1], y: 0 },
    ],
    "75%": [
        { keys: [1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1, 1], y: 5.25 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 4 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 3 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 2 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1], y: 1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, -0.5, 1, 1, 1], y: 0 },
    ],
    "TKL": [
        { keys: [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.25, 1, 1, 1], y: 5.5 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.25, 1, 1, 1], y: 4 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1, 1, 1], y: 3 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], y: 2 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -0.25, -1, 1, -1], y: 1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.25, 1, 1, 1], y: 0 },
    ],
    "Full": [
        { keys: [1, -1, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.5, 1, 1, 1, 1, -0.25, 1, 1, 1], y: 5.5 },
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.25, 1, 1, 1, -0.25, 1, 1, 1, 1], y: 4 },
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1, 1, 1, -0.25, 1, 1, 1, {w:1,h:2}], y: 3 },
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, -3.5, 1, 1, 1, -1], y: 2 },
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -0.25, -1, 1, -1, -0.25, 1, 1, 1, {w:1,h:2}], y: 1 },
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.25, 1, 1, 1, -0.25, 2, 1, -1], y: 0 },
    ],
}

// 그룹별 레이아웃 오버라이드 (같은 배열 카테고리 내 제품별 키 배열 차이)
// QMK/VIA 물리 레이아웃 데이터 기반
// ID80, Keychron Q6, Leopold FC900R 등은 기본 레이아웃과 동일하여 오버라이드 없음
const GROUP_LAYOUTS: Record<string, { keys: KeyEntry[], y: number }[]> = {
    // === 60% ===
    "GH60 / Poker": [
        // GH60 PCB 지원 Split backspace (2U → 1U+1U)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], y: 4 },        // 15U
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5], y: 3 },        // 15U
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], y: 2 },         // 15U
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75], y: 1 },            // 15U
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25], y: 0 },      // 15U
    ],

    // === 65% ===
    "NK65": [
        // 블로커 없음, 우측 모디파이어 1U (6x1U)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 4 },        // 16U
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 3 },    // 16U
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 2 },     // 16U
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: 1 },     // 16U
        { keys: [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1], y: 0 },            // 16U
    ],

    // === 75% ===
    "KBD75": [
        // Compact 75%: F-row 16키 빽빽 (갭 없음), body에 가까움 (y=5)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], y: 5 },     // 16U (16키)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 4 },        // 16U
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 3 },    // 16U
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 2 },     // 16U
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: 1 },     // 16U
        { keys: [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1], y: 0 },            // 16U
    ],
    "GMMK Pro": [
        // Exploded 75%: 0.25U F-row 갭, PrtSc 포함 (14키), 우측 노브 공간 (15U)
        { keys: [1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1], y: 5.5 }, // 15U (14키+노브1U)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1], y: 4 },        // 16U
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 1], y: 3 },    // 16U
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25, 1], y: 2 },     // 16U
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75, 1, 1], y: 1 },     // 16U
        { keys: [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1, 1], y: 0 },            // 16U
    ],

    // === TKL ===
    "Freebird TKL": [
        // F13 키 포함 (17키 F-row), 표준 0.25U 갭
        { keys: [1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1, 1, 1, 1, -0.25, 1, -0.25, 1, 1, 1], y: 5.5 }, // 18.25U (17키)
        { keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, -0.25, 1, 1, 1], y: 4 },    // 18.25U
        { keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, -0.25, 1, 1, 1], y: 3 }, // 18.25U
        { keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25], y: 2 },                   // 15U
        { keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75, -0.25, -1, 1, -1], y: 1 },   // 18.25U
        { keys: [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25, -0.25, 1, 1, 1], y: 0 }, // 18.25U
    ],
}

function KeyboardModel({ selected, mini = false }: Keyboard3DProps & { mini?: boolean }) {
    // PCB 레이아웃 (키 배열) - 그룹별 오버라이드 우선
    const pcbLayout = selected.pcb?.layout || "60%"
    const groupName = selected.pcb?.compatible_group_name || selected.case?.compatible_group_name
    const rows = (groupName && GROUP_LAYOUTS[groupName]) || LAYOUTS[pcbLayout] || LAYOUTS["60%"]

    // Case 레이아웃 (Case 크기) - 그룹별 오버라이드 우선
    const caseGroupName = selected.case?.compatible_group_name
    const caseLayout = selected.case?.layout || pcbLayout
    const caseRows = (caseGroupName && GROUP_LAYOUTS[caseGroupName]) || LAYOUTS[caseLayout] || LAYOUTS["60%"]

    // Plate 레이아웃 (Plate 크기) - 그룹별 오버라이드 우선
    const plateGroupName = selected.plate?.compatible_group_name
    const plateLayout = selected.plate?.layout || pcbLayout
    const plateRows = (plateGroupName && GROUP_LAYOUTS[plateGroupName]) || LAYOUTS[plateLayout] || LAYOUTS["60%"]

    // 호환성 체크 (compatible_group_id 기반)
    const hasGroupMismatch = (() => {
        const pcbGroup = selected.pcb?.compatible_group_id
        const caseGroup = selected.case?.compatible_group_id
        const plateGroup = selected.plate?.compatible_group_id
        if (pcbGroup && caseGroup && pcbGroup !== caseGroup) return true
        if (pcbGroup && plateGroup && pcbGroup !== plateGroup) return true
        if (caseGroup && plateGroup && caseGroup !== plateGroup) return true
        return false
    })()

    // 행 너비 계산 (양수=키, 음수=갭, 0=빈 1U 공간, 객체=세로키)
    const getRowWidth = (keys: KeyEntry[]) => {
        let width = 0
        for (const k of keys) {
            if (typeof k === "object") width += k.w
            else if (k === 0) width += 1
            else if (k < 0) width += Math.abs(k)
            else width += k
        }
        return width
    }
    const getMaxWidth = (layoutRows: { keys: KeyEntry[], y: number }[]) =>
        Math.max(...layoutRows.map(r => getRowWidth(r.keys)))
    const getYRange = (layoutRows: { keys: KeyEntry[], y: number }[]) => {
        const ys = layoutRows.map(r => r.y)
        return { maxY: Math.max(...ys), minY: Math.min(...ys) }
    }

    const keyUnit = 0.92
    const totalWidth = getMaxWidth(rows) * keyUnit
    const { maxY, minY } = getYRange(rows)

    // Case 크기
    const caseWidth = getMaxWidth(caseRows) * keyUnit
    const caseYRange = getYRange(caseRows)
    const caseDepth = (caseYRange.maxY - caseYRange.minY + 1) * keyUnit

    // Plate 크기
    const plateWidth = getMaxWidth(plateRows) * keyUnit
    const plateYRange = getYRange(plateRows)
    const plateDepth = (plateYRange.maxY - plateYRange.minY + 1) * keyUnit

    // Case 색상
    const CASE_COLOR_MAP: Record<string, string> = {
        "black": "#1a1a1a",
        "white": "#e8e8e8",
        "silver": "#c0c0c0",
        "e-white": "#f0ede6",
        "navy": "#1b2a4a",
        "space gray": "#6b6b6b",
        "navy blue": "#1e3a5f",
        "frosted": "#d8e8f0",
        "smoke": "#4a4a4a",
        "transparent": "#e0e0e0",
        "charcoal": "#36454f",
        "gray": "#808080",
    }
    const getCaseColor = () => {
        const color = selected.case?.color?.toLowerCase()
        if (!color) return "#2d2d2d"
        return CASE_COLOR_MAP[color] ?? "#2d2d2d"
    }

    // Case 재질별 속성
    const getCaseMaterialProps = () => {
        const material = selected.case?.material?.toLowerCase()
        if (material === "aluminum") return { metalness: 0.85, roughness: 0.15, transparent: false, opacity: 1 }
        if (material === "polycarbonate") return { metalness: 0.0, roughness: 0.2, transparent: true, opacity: 0.7 }
        if (material === "acrylic") return { metalness: 0.0, roughness: 0.1, transparent: true, opacity: 0.5 }
        if (material === "plastic") return { metalness: 0.0, roughness: 0.6, transparent: false, opacity: 1 }
        if (material === "abs") return { metalness: 0.0, roughness: 0.5, transparent: false, opacity: 1 }
        return { metalness: 0.1, roughness: 0.3, transparent: false, opacity: 1 }
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
        if(name.includes("white")) return "#e8e8e8"
        if(name.includes("milky")) return "#f5e6c8"
        if(name.includes("choc")) return "#e84545"
        return "#f5d742"
    }

    // Keycap 색상
    const getKeycapColor = () => {
        if (!selected.keycap) return "#cccccc"
        const name = selected.keycap.name.toLowerCase()
        if(name.includes("olivia")) return "#e8c4c4"
        if(name.includes("laser")) return "#9b4dca"
        if(name.includes("dolch")) return "#4a4a4a"
        if(name.includes("retro")) return "#d4c5a0"
        if(name.includes("wob")) return "#1a1a1a"
        if(name.includes("granite")) return "#b0b0b0"
        if(name.includes("botanical")) return "#2d5a3d"
        if(name.includes("mizu")) return "#6fa8c7"
        if(name.includes("carbon")) return "#f57c00"
        return "#f0f0f0"
    }

    const caseColor = getCaseColor()
    const caseMaterialProps = getCaseMaterialProps()

    // 색상 기반 투명도 오버라이드 (Frosted, Smoke, Transparent)
    const caseColorLower = selected.case?.color?.toLowerCase()
    const isCaseTranslucentColor = caseColorLower === "frosted" || caseColorLower === "smoke" || caseColorLower === "transparent"
    const caseFinalTransparent = caseMaterialProps.transparent || isCaseTranslucentColor
    const caseFinalOpacity = isCaseTranslucentColor
        ? (caseColorLower === "transparent" ? 0.3 : caseColorLower === "frosted" ? 0.6 : 0.65)
        : caseMaterialProps.opacity

    const plateProps = getPlateProps()
    const switchColor = getSwitchColor()
    const keycapColor = getKeycapColor()
    const keycapOpacity = selected.keycap ? 1 : 0.3  // 키캡 미선택 시 반투명
    const keycapProfile = selected.keycap?.profile || "Cherry"

    // 중앙 Y 오프셋 계산 (y값 범위 기반)
    const centerYOffset = (maxY + minY) / 2

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
                    roughness={caseMaterialProps.roughness}
                    metalness={caseMaterialProps.metalness}
                    transparent={caseFinalTransparent}
                    opacity={caseFinalOpacity}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Mounting Structure (skip in mini mode) */}
            {!mini && selected.case?.mounting_type && (
                <MountingStructure
                    mountingType={selected.case.mounting_type}
                    caseColor={caseColor}
                    caseWidth={caseWidth}
                    caseDepth={caseDepth}
                />
            )}

            {/* compatible_group 불일치 시 경고 */}
            {hasGroupMismatch && (
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
            <group position={[-totalWidth / 2, 0.1, 0]}>
                {rows.map((row, rowIndex) => {
                    let xOffset = 0
                    return row.keys.map((entry, keyIndex) => {
                        // 숫자 값 처리
                        if (typeof entry === "number") {
                            if (entry < 0) {
                                xOffset += Math.abs(entry) * keyUnit  // 갭
                                return null
                            }
                            if (entry === 0) {
                                xOffset += 1 * keyUnit  // 빈 1U 공간
                                return null
                            }
                        }

                        // 키 너비/높이 추출
                        const keyW = typeof entry === "object" ? entry.w : entry
                        const keyH = typeof entry === "object" ? entry.h : 1

                        const x = xOffset + (keyW * keyUnit) / 2
                        xOffset += keyW * keyUnit

                        // 세로 키: 아래로 확장하므로 z를 (h-1)*0.5만큼 앞으로 이동
                        const z = (centerYOffset - row.y + (keyH - 1) * 0.5) * keyUnit

                        // 세로 키 깊이: h칸 * keyUnit - 간격 보정
                        const capDepth = keyH > 1
                            ? keyH * keyUnit - (keyUnit - 0.78)
                            : 0.78

                        // 스태빌라이저 판단 (가로 2U 이상 또는 세로 2U 이상)
                        const needsStab = keyW >= 2 || keyH >= 2

                        return (
                            <group key={`${rowIndex}-${keyIndex}`}>
                                {/* Plate 스위치 컷아웃 (mini에서 생략) */}
                                {!mini && selected.plate && (
                                    <mesh position={[x, 0.017, z]}>
                                        <boxGeometry args={[0.58, 0.008, 0.58]} />
                                        <meshStandardMaterial color="#080808" roughness={0.9} />
                                    </mesh>
                                )}
                                {/* Stabilizer (mini에서 생략) */}
                                {!mini && selected.stabilizer && needsStab && (
                                    <Stabilizer
                                        position={[x, 0, z]}
                                        widthU={keyW}
                                        stabName={selected.stabilizer.name}
                                    />
                                )}
                                {/* Switch (mini에서 생략 - 키캡 아래라 안 보임) */}
                                {!mini && selected.switch && (
                                    <Switch
                                        position={[x, 0, z]}
                                        color={switchColor}
                                    />
                                )}
                                {/* Keycap */}
                                <Key
                                    position={[x, 0, z]}
                                    width={keyW * keyUnit}
                                    depth={capDepth}
                                    color={keycapColor}
                                    opacity={keycapOpacity}
                                    profile={keycapProfile}
                                    row={Math.max(0, rowIndex - (rows.length - 5))}
                                />
                            </group>
                        )
                    })
                })}
            </group>
        </group>
    )
}

// frameloop="demand" 모드에서 초기 1회 렌더를 트리거하는 컴포넌트
function InvalidateOnMount() {
    const { invalidate } = useThree()
    useEffect(() => {
        invalidate()
    }, [invalidate])
    return null
}

// Intersection Observer로 뷰포트에 보일 때만 마운트
function LazyCanvas({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: "100px" }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={ref} className={className}>
            {visible ? children : null}
        </div>
    )
}

export function Keyboard3D({ selected, mini = false, expanded = false }: Keyboard3DProps) {
    const cameraPos: [number, number, number] = expanded
        ? [0, 10, 16]
        : mini
            ? [0, 12, 8]
            : [0, 8, 12]
    const fov = expanded ? 35 : mini ? 50 : 40

    const canvas = (
        <Canvas
            camera={{ position: cameraPos, fov }}
            frameloop={mini ? "demand" : "always"}
        >
            <ambientLight intensity={mini ? 0.5 : 0.4} />
            <directionalLight position={[10, 10, 5]} intensity={mini ? 0.8 : 1} castShadow={!mini} />
            {!mini && <directionalLight position={[-10, 5, -5]} intensity={0.3} />}
            <KeyboardModel selected={selected} mini={mini} />
            {!mini && (
                <OrbitControls
                    enablePan={false}
                    minDistance={8}
                    maxDistance={expanded ? 35 : 25}
                    minPolarAngle={0.2}
                    maxPolarAngle={Math.PI / 2.2}
                />
            )}
            <Environment preset="studio" />
            {mini && <InvalidateOnMount />}
        </Canvas>
    )

    if (mini) {
        return (
            <LazyCanvas className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
                {canvas}
            </LazyCanvas>
        )
    }

    return (
        <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            {canvas}
        </div>
    )
}
