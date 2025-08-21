import React, { useRef, useEffect } from 'react'; 
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Componente que maneja la esfera y el marcador
const EarthMesh = ({ lat, lon }) => {
  const earthRef = useRef();
  const markerRef = useRef();

  // Cargar textura de la Tierra desde public/
  const earthTexture = useLoader(THREE.TextureLoader, '/earth.jpg');

  // Rotación automática de la Tierra
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0008;
    }
  });

  // Posicionar marcador cuando cambian lat/lon (SIN mover la cámara)
  useEffect(() => {
    if (typeof lat === 'number' && typeof lon === 'number') {
      const radius = 2;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      // Posicionar marcador
      if (markerRef.current) {
        markerRef.current.position.set(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      }
    }
  }, [lat, lon]);

  return (
    <>
      {/* Tierra */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={earthTexture} />
      </mesh>

      {/* Marcador */}
      <mesh ref={markerRef} visible={lat !== undefined && lon !== undefined}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshBasicMaterial color="red" />
      </mesh>
    </>
  );
};

// Componente principal que contiene el Canvas
const Earth = ({ coordinates }) => {
  const sunRef = useRef();

  // Actualizar posición del "Sol" (luz direccional) según hora local
  useEffect(() => {
    const updateSunPosition = () => {
      const now = new Date();
      const hours = now.getUTCHours();
      const angle = (hours / 24) * 2 * Math.PI;

      if (sunRef.current) {
        sunRef.current.position.set(
          5 * Math.cos(angle),
          0,
          5 * Math.sin(angle)
        );
      }
    };

    updateSunPosition();
    const interval = setInterval(updateSunPosition, 60000); // actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-60 sm:h-72 md:h-80 lg:h-[500px] xl:h-[600px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <directionalLight ref={sunRef} intensity={1.8} />
        <Stars radius={200} depth={120} count={8000} factor={6} />

        <EarthMesh lat={coordinates?.lat} lon={coordinates?.lon} />
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  );
};

export default Earth;
