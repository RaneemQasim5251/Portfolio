import * as THREE from 'three'

export function createGlowMaterial(color: string, intensity = 1) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color().setStyle(color),
    transparent: true,
    opacity: 0.5 * intensity,
    blending: THREE.AdditiveBlending
  })
}

export function createPointsMaterial(color: string, size = 0.02) {
  return new THREE.PointsMaterial({
    color: new THREE.Color().setStyle(color),
    size,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
}

export function createRandomPoints(count: number, radius: number) {
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = radius * Math.cbrt(Math.random())

    points[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    points[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    points[i * 3 + 2] = r * Math.cos(phi)
  }
  return points
}

export function createNeuralConnections(points: THREE.Points, maxConnections = 3, maxDistance = 1) {
  const geometry = points.geometry
  const positionAttribute = geometry.attributes.position as THREE.BufferAttribute
  const positions = positionAttribute.array as Float32Array
  const connections: number[] = []

  for (let i = 0; i < positions.length; i += 3) {
    const point1 = new THREE.Vector3(
      positions[i],
      positions[i + 1],
      positions[i + 2]
    )

    let connectionCount = 0
    for (let j = i + 3; j < positions.length && connectionCount < maxConnections; j += 3) {
      const point2 = new THREE.Vector3(
        positions[j],
        positions[j + 1],
        positions[j + 2]
      )

      if (point1.distanceTo(point2) <= maxDistance) {
        connections.push(
          point1.x, point1.y, point1.z,
          point2.x, point2.y, point2.z
        )
        connectionCount++
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry()
  lineGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(connections, 3)
  )

  return lineGeometry
}

export function animatePoints(
  points: THREE.Points,
  lines: THREE.LineSegments,
  clock: THREE.Clock,
  amplitude = 0.1,
  frequency = 1
) {
  const time = clock.getElapsedTime()
  const positionAttribute = points.geometry.attributes.position as THREE.BufferAttribute
  const positions = positionAttribute.array as Float32Array
  const originalPositions = Array.from(positions)

  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = originalPositions[i] + Math.sin(time * frequency + i) * amplitude
    positions[i + 1] = originalPositions[i + 1] + Math.cos(time * frequency + i) * amplitude
    positions[i + 2] = originalPositions[i + 2] + Math.sin(time * frequency + i) * amplitude
  }

  points.geometry.attributes.position.needsUpdate = true
  
  // Update line connections
  const linePositionAttribute = lines.geometry.attributes.position as THREE.BufferAttribute
  const linePositions = linePositionAttribute.array as Float32Array
  let lineIndex = 0
  for (let i = 0; i < linePositions.length; i += 6) {
    linePositions[i] = positions[lineIndex]
    linePositions[i + 1] = positions[lineIndex + 1]
    linePositions[i + 2] = positions[lineIndex + 2]
    linePositions[i + 3] = positions[lineIndex + 3]
    linePositions[i + 4] = positions[lineIndex + 4]
    linePositions[i + 5] = positions[lineIndex + 5]
    lineIndex += 6
  }
  lines.geometry.attributes.position.needsUpdate = true
}