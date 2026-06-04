"use client";

import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

const NODE_COUNT = 400; // Drastically reduced to allow for complex line calculations
const MAX_CONNECTION_DISTANCE = 4.5;

function AlgorithmicKnowledgeGraph({ progress }: { progress: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  
  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });
  
  // Robust global mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate nodes
  const [nodePositions, baseNodeColors] = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);
    
    for (let i = 0; i < NODE_COUNT; i++) {
      // Distribute nodes in a 3D sphere volume
      const r = 15 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      
      // Deep blue/purple default algorithmic colors
      col[i * 3] = 0.2;
      col[i * 3 + 1] = 0.4;
      col[i * 3 + 2] = 0.9;
    }
    return [pos, col];
  }, []);

  // Pre-calculate line connections (edges)
  const edgeIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodePositions[i * 3] - nodePositions[j * 3];
        const dy = nodePositions[i * 3 + 1] - nodePositions[j * 3 + 1];
        const dz = nodePositions[i * 3 + 2] - nodePositions[j * 3 + 2];
        const distSq = dx*dx + dy*dy + dz*dz;
        
        if (distSq < MAX_CONNECTION_DISTANCE * MAX_CONNECTION_DISTANCE) {
          indices.push(i, j);
        }
      }
    }
    return new Uint16Array(indices);
  }, [nodePositions]);

  // Setup dynamic color array for lines
  const edgeColors = useMemo(() => {
    return new Float32Array(edgeIndices.length * 3); // 3 colors per vertex
  }, [edgeIndices]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const t = state.clock.elapsedTime;
    const p = progress.current;
    
    // Smooth mouse interpolation
    currentMouse.current.x = THREE.MathUtils.lerp(currentMouse.current.x, targetMouse.current.x, 0.05);
    currentMouse.current.y = THREE.MathUtils.lerp(currentMouse.current.y, targetMouse.current.y, 0.05);

    // Rotate the entire knowledge graph
    const rotY = t * 0.05 + currentMouse.current.x * 0.2;
    const rotX = Math.sin(t * 0.1) * 0.1 - currentMouse.current.y * 0.2;
    
    pointsRef.current.rotation.y = rotY;
    pointsRef.current.rotation.x = rotX;
    linesRef.current.rotation.y = rotY;
    linesRef.current.rotation.x = rotX;

    // Simulate "Data Pulses" through the network
    const colorAttr = linesRef.current.geometry.attributes.color as THREE.BufferAttribute;
    
    // Every frame, subtly fade all lines back to a dim blue
    for (let i = 0; i < colorAttr.count; i++) {
      colorAttr.setXYZ(i, 0.1, 0.15, 0.3); // Dim default state
    }
    
    // Highlight a few random connections to simulate algorithmic RAG search
    const numActivePulses = 15;
    for (let i = 0; i < numActivePulses; i++) {
      // Pick a random edge to light up
      // The edge index array has 2 points per line. 
      const randomLineIndex = Math.floor(Math.random() * (edgeIndices.length / 2)) * 2;
      
      // Set the two points of this line to a bright cyan/white to simulate a data pulse
      colorAttr.setXYZ(randomLineIndex, 0.4, 0.9, 1.0);
      colorAttr.setXYZ(randomLineIndex + 1, 0.4, 0.9, 1.0);
    }
    colorAttr.needsUpdate = true;

    // Cinematic scroll fly-through
    state.camera.position.z = 20 - (p * 15);
    
    // Mouse Parallax for the camera
    state.camera.position.x = currentMouse.current.x * 3;
    state.camera.position.y = currentMouse.current.y * 3;
    
    state.camera.lookAt(0, 0, state.camera.position.z - 10);
  });

  return (
    <group>
      {/* Knowledge Graph Edges (Connections) */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          <bufferAttribute attach="index" args={[edgeIndices, 1]} />
          <bufferAttribute attach="attributes-color" args={[edgeColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial 
          vertexColors 
          transparent 
          opacity={0.6} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Knowledge Graph Nodes (Memories) */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[baseNodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial 
          size={0.15} 
          vertexColors 
          transparent 
          opacity={0.8}
          sizeAttenuation={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          onBeforeCompile={(shader) => {
            // Perfect circular nodes
            shader.fragmentShader = shader.fragmentShader.replace(
              `#include <clipping_planes_fragment>`,
              `
              if (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;
              #include <clipping_planes_fragment>
              `
            );
          }}
        />
      </points>
    </group>
  );
}

function SceneOrchestrator() {
  const progressRef = useRef(0);
  
  useEffect(() => {
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
  }, []);

  return (
    <group>
      <AlgorithmicKnowledgeGraph progress={progressRef} />
    </group>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-screen fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 45 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }} 
        dpr={[1, 2]} 
      >
        <fog attach="fog" args={['#f5f5f7', 10, 30]} />
        <SceneOrchestrator />
      </Canvas>
    </div>
  );
}
