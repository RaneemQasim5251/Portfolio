import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function FloatingNetwork() {
  const ref = useRef<THREE.Points>(null)
  
  // Generate random points for nodes
  const count = 100
  const positions = useMemo(() => {
    const points = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      points[i * 3] = (Math.random() - 0.5) * 10
      points[i * 3 + 1] = (Math.random() - 0.5) * 10
      points[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return points
  }, [])

  // Animate the network
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
      ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.1) * 0.2
    }
  })

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#720E0E"
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

export default function IdentityCanvas() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div className="absolute inset-0 -z-10" />
  }

  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <FloatingNetwork />
      </Canvas>
    </div>
  )
} 