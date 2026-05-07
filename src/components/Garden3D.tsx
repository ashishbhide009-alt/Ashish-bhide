import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky, Stars, ContactShadows, useHelper, Float, Sparkles, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { GardenDesign } from "../services/geminiService";

interface Garden3DProps {
  design: GardenDesign;
  timeOfDay: number; // 0 to 24
  weather: "sunny" | "rainy" | "foggy";
}

function Plant({ position, type, color, weather }: { position: [number, number, number], type: string, color: string, weather: string }) {
  const isRainy = weather === "rainy";
  // Procedural plant shapes based on "role"
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        {type.toLowerCase().includes("tree") || type.toLowerCase().includes("focal") ? (
          <coneGeometry args={[0.5, 2, 8]} />
        ) : type.toLowerCase().includes("ground") ? (
          <sphereGeometry args={[0.3, 16, 16]} />
        ) : (
          <cylinderGeometry args={[0.2, 0.4, 1, 8]} />
        )}
        <meshStandardMaterial 
          color={color} 
          roughness={isRainy ? 0.1 : 0.8} 
          metalness={isRainy ? 0.2 : 0} 
        />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4]} />
        <meshStandardMaterial 
          color="#4d3b2e" 
          roughness={isRainy ? 0.2 : 0.9} 
        />
      </mesh>
    </group>
  );
}

function Scene({ design, timeOfDay, weather }: Garden3DProps) {
  const isRainy = weather === "rainy";
  const isFoggy = weather === "foggy";
  
  // Generate random plants based on design
  const plants = useMemo(() => {
    return design.recommendedPlants.map((plant, i) => {
      return Array.from({ length: 4 }).map((_, j) => ({
        id: `${i}-${j}`,
        position: [(Math.random() - 0.5) * 15, 0, (Math.random() - 0.5) * 15] as [number, number, number],
        type: plant.role,
        color: plant.role.includes("focal") ? "#2d5a27" : "#4a7c44"
      }));
    }).flat();
  }, [design]);

  const sunPosition = useMemo(() => {
    const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(angle) * 10, Math.sin(angle) * 10, 5] as [number, number, number];
  }, [timeOfDay]);

  const isNight = timeOfDay < 6 || timeOfDay > 18;

  return (
    <>
      <color attach="background" args={[isNight ? "#050505" : isRainy ? "#4b5563" : isFoggy ? "#d1d5db" : "#87ceeb"]} />
      
      {/* Atmosphere */}
      {!isNight ? (
        <Sky 
          sunPosition={sunPosition} 
          turbidity={isFoggy ? 20 : isRainy ? 10 : 0.1} 
          rayleigh={isFoggy ? 1 : isRainy ? 4 : 2} 
          mieCoefficient={isFoggy ? 0.1 : 0.005}
        />
      ) : (
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      )}
      
      {isFoggy && (
        <>
          <fog attach="fog" args={["#d1d5db", 1, 30]} />
          {/* Ground level mist */}
          <Sparkles 
            count={200} 
            scale={[20, 2, 20]} 
            size={6} 
            speed={0.2} 
            opacity={0.2} 
            color="#ffffff" 
          />
        </>
      )}

      {isRainy && (
        <group>
          <Sparkles 
            count={1000} 
            scale={[20, 15, 20]} 
            size={1.5} 
            speed={4} 
            opacity={0.4} 
            color="#cbd5e1" 
          />
          {/* High speed streaks simulation */}
          <Sparkles 
            count={500} 
            scale={[20, 20, 20]} 
            size={0.5} 
            speed={10} 
            opacity={0.6} 
            color="#f8fafc" 
          />
        </group>
      )}

      {/* Lighting */}
      <ambientLight intensity={isNight ? 0.05 : isRainy || isFoggy ? 0.2 : 0.4} />
      <directionalLight 
        position={sunPosition} 
        intensity={isNight ? 0.1 : isRainy ? 0.4 : isFoggy ? 0.6 : 1.5} 
        color={isRainy ? "#94a3b8" : isFoggy ? "#cbd5e1" : "#ffffff"}
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />

      {/* Garden Elements */}
      <group>
        {/* Terrain */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <meshStandardMaterial 
            color={isRainy ? "#2d3a28" : "#4a5d44"} 
            roughness={isRainy ? 0.1 : 1}
            metalness={isRainy ? 0.1 : 0} 
          />
        </mesh>
        
        {/* Paths */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <planeGeometry args={[2, 20]} />
          <meshStandardMaterial 
            color={isRainy ? "#9ca3af" : "#d1d5db"} 
            roughness={isRainy ? 0.05 : 0.9} 
            metalness={isRainy ? 0.2 : 0}
          />
        </mesh>

        {/* Dynamic Plants */}
        {plants.map((p) => (
          <Plant key={p.id} {...p} weather={weather} />
        ))}
      </group>

      <ContactShadows position={[0, -0.01, 0]} opacity={0.4} scale={25} blur={2} far={4} />
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

export default function Garden3D(props: Garden3DProps) {
  return (
    <div className="w-full h-full bg-emerald-950 rounded-[40px] overflow-hidden relative shadow-inner">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={50} />
        <Scene {...props} />
      </Canvas>
      
      {/* 3D UI Overlay */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-[10px] font-black text-white uppercase tracking-widest text-center">
          Simulation Running
        </div>
      </div>
    </div>
  );
}
