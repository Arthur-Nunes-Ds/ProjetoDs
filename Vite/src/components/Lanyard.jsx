import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { extend, useFrame } from '@react-three/fiber'
import { Text, RoundedBox, useCursor } from '@react-three/drei'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

// Registra a geometria da linha para funcionar no React
extend({ MeshLineGeometry, MeshLineMaterial })

export default function Lanyard({ 
  gravity = [0, -40, 0], 
  position = [0, 0, 0],
  text = "ALUNO",
  subtext = "SENAI"
}) {
  const card = useRef()
  const line = useRef()
  
  // Estado para arrastar e hover
  const [dragged, drag] = useState(false)
  const [hovered, setHover] = useState(false)
  
  // Muda o cursor do mouse
  useCursor(hovered)

  // Vetores auxiliares para matemática (evita travar a memória)
  const vec = new THREE.Vector3()
  const dir = new THREE.Vector3()

  // Cria a curva inicial da corda
  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 0)
  ]))

  useFrame((state) => {
    if (!card.current) return;
    
    const time = state.clock.getElapsedTime()
    
    // --- LÓGICA DE MOVIMENTO (Simulando Física) ---
    if (!dragged) {
        // Balanço suave quando solto (Idle)
        // Math.sin cria o movimento de vai-e-vem
        const sway = Math.sin(time * 2) * 0.1
        const bounce = Math.sin(time * 1.5) * 0.05
        
        // Aplica rotação leve
        card.current.rotation.z = THREE.MathUtils.lerp(card.current.rotation.z, sway, 0.1)
        card.current.rotation.x = THREE.MathUtils.lerp(card.current.rotation.x, bounce, 0.1)
        
        // Posição de repouso (pendurado um pouco abaixo do topo)
        const restPos = new THREE.Vector3(0, -2.5, 0) 
        card.current.position.lerp(restPos, 0.1)
        
    } else {
        // SEGUE O MOUSE quando arrastado
        // Converte posição 2D do mouse para 3D
        vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
        dir.copy(vec).sub(state.camera.position).normalize()
        vec.add(dir.multiplyScalar(state.camera.position.length())) // Traz para perto da câmera
        
        // Move o cartão suavemente até o mouse
        card.current.position.lerp(vec, 0.15)
        
        // Zera a rotação para ficar reto enquanto segura
        card.current.rotation.set(0, 0, 0)
    }

    // --- ATUALIZA A CORDA ---
    // Ponto 1: Topo fixo da tela (onde a corda "sai")
    const start = new THREE.Vector3(0, 2, 0)
    
    // Ponto 3: Topo do cartão (onde a corda prende)
    const end = card.current.position.clone().add(new THREE.Vector3(0, 1.5, 0))
    
    // Ponto 2: Meio da corda (faz a barriga da gravidade)
    const mid = start.clone().lerp(end, 0.5)
    const dist = start.distanceTo(end)
    mid.y -= dist * 0.2 // Quanto mais longe, mais a corda estica para baixo
    
    // Desenha a linha
    curve.points = [start, mid, end]
    if (line.current) line.current.geometry.setPoints(curve.getPoints(20))
  })

  return (
    <group position={position}>
      {/* 1. A CORDA (Branca translúcida) */}
      <mesh ref={line}>
        <meshLineGeometry />
        <meshLineMaterial 
            color="white" 
            resolution={[window.innerWidth, window.innerHeight]} 
            lineWidth={0.1} 
            transparent 
            opacity={0.6} 
        />
      </mesh>

      {/* 2. O CARTÃO (Interativo) */}
      <group 
        ref={card} 
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
        onPointerDown={(e) => {
            e.stopPropagation() 
            e.target.setPointerCapture(e.pointerId)
            drag(true)
        }}
        onPointerUp={(e) => {
            e.stopPropagation()
            e.target.releasePointerCapture(e.pointerId)
            drag(false)
        }}
      >
        {/* CORPO DO CARTÃO (Retângulo arredondado estilo vidro) */}
        <RoundedBox args={[2.2, 3.2, 0.1]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial 
                color="#101010" // Cor preta
                roughness={0.2} // Um pouco brilhante
                metalness={0.8} // Metálico
                clearcoat={1}   // Verniz por cima
            />
        </RoundedBox>

        {/* --- CONTEÚDO DA FRENTE DO CARTÃO --- */}
        <group position={[0, 0, 0.06]}>
            
            {/* Círculo do Avatar (Roxo) */}
            <mesh position={[0, 0.5, 0]}>
                <circleGeometry args={[0.6, 32]} />
                <meshBasicMaterial color="#7c3aed" /> 
            </mesh>
            
            {/* Ícone simplificado de pessoa (Branco) */}
             <mesh position={[0, 0.5, 0.01]}>
                <circleGeometry args={[0.25, 32]} />
                <meshBasicMaterial color="#fff" />
            </mesh>
             <mesh position={[0, 0.2, 0.01]}>
                <circleGeometry args={[0.4, 32, 0, Math.PI]} />
                <meshBasicMaterial color="#fff" />
            </mesh>

            {/* Texto: NOME (Vem das props) */}
            <Text 
                position={[0, -0.4, 0]} 
                fontSize={0.25} 
                color="white" 
                // Fonte padrão do Google Fonts
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
            >
                {text}
            </Text>

            {/* Texto: CARGO (Vem das props) */}
            <Text 
                position={[0, -0.8, 0]} 
                fontSize={0.15} 
                color="#a1a1aa" 
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff"
                anchorX="center"
                anchorY="middle"
            >
                {subtext}
            </Text>

            {/* Faixa decorativa vermelha embaixo */}
            <mesh position={[0, -1.2, 0]}>
                <planeGeometry args={[1.8, 0.05]} />
                <meshBasicMaterial color="#ef4444" />
            </mesh>
        </group>

        {/* PRESILHA DO CRACHÁ (Topo cinza) */}
        <mesh position={[0, 1.65, 0]}>
            <boxGeometry args={[1, 0.3, 0.2]} />
            <meshStandardMaterial color="#333" />
        </mesh>
      </group>
    </group>
  )
}