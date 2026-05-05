import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Department → path node list mapping
// Paths always start from entrance (south) moving through corridors + stairs
const DEPARTMENT_PATHS = {
  // ---- FLOOR 0 ----
  // entranceblk: ['node.001'],
  // MAINmapF0: ['node.001', 'node.002'],
  // pathology: ['node.001', 'node.002', 'node.003'],
  // pathology2: ['node.001', 'node.002', 'node.003'],
  // pathology3: ['node.001', 'node.002', 'node.003'],
  // neurology: ['node.001', 'node.002', 'node.003', 'node.004'],
  // neural2: ['node.001', 'node.002', 'node.003', 'node.004'],
  // nasal: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005'],
  // eyes1: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005'],
  // eyes2: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005'],
  // eyes3: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005'],
  // scopies: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006'],
  // gensurg: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006'],
  // genSurg2: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006'],
  // genSurg3: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006'],
  // genSurg4: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006'],
  // stomach: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006', 'node.007'],
  // stomach2: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006', 'node.007'],
  // stomach3: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006', 'node.007'],
  // intestines: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006', 'node.007'],
  // masalek: ['node.001', 'node.002', 'node.003', 'node.004', 'node.005', 'node.006', 'node.007', 'node.008'],
  // bone1: ['node.001', 'node.002', 'node.009', 'node.010'],
  // kitchen: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011'],
  // bone2: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011'],
  // bone3: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012'],
  // bone4: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012', 'node.013'],
  // burnEmer: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012', 'node.013'],
  // womenEmer: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012', 'node.013', 'node.014'],
  // women: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012', 'node.013', 'node.014', 'node.015'],
  // cancer: ['node.001', 'node.002', 'node.009', 'node.010', 'node.011', 'node.012', 'node.013', 'node.014', 'node.015', 'node.016'],

  // // ---- FLOOR 1 (via stairs) ----
  // MAINmapF1: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025'],
  // head: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026'],
  // skinMasc1: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026', 'node.027'],
  // breast: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026', 'node.027', 'node.028'],
  // motawatna: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026', 'node.027', 'node.028', 'node.029'],
  // surgeries: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026', 'node.027', 'node.028', 'node.029', 'node.030'],
  // surgeries2: ['node.001', 'node.049', 'node.050', 'node.051', 'node.025', 'node.026', 'node.027', 'node.028', 'node.029', 'node.030'],
  // womenSurg: ['node.001', 'node.049', 'node.050', 'node.051', 'node.024', 'node.023', 'node.022'],
  // womenSurg2: ['node.001', 'node.049', 'node.050', 'node.051', 'node.024', 'node.023', 'node.022'],
  // womenSurg3: ['node.001', 'node.049', 'node.050', 'node.051', 'node.024', 'node.023', 'node.022'],
  // Csection: ['node.001', 'node.049', 'node.050', 'node.051', 'node.024', 'node.023', 'node.022', 'node.021', 'node.020'],

  // // ---- FLOOR 2 (via stairs) ----
  // MAINmapF2: ['node.001', 'node.049', 'node.050', 'node.051', 'node.052', 'node.053', 'node.054', 'node.040'],
  // heartSurg: ['node.001', 'node.049', 'node.050', 'node.051', 'node.052', 'node.053', 'node.054', 'node.040', 'node.039'],
  // heart: ['node.001', 'node.049', 'node.050', 'node.051', 'node.052', 'node.053', 'node.054', 'node.040', 'node.039', 'node.038'],
  // brain: ['node.001', 'node.049', 'node.050', 'node.051', 'node.052', 'node.053', 'node.054', 'node.040', 'node.039', 'node.038', 'node.037'],
  // beauty: ['node.001', 'node.049', 'node.050', 'node.051', 'node.052', 'node.053', 'node.054', 'node.041', 'node.042', 'node.043'],

  // ---- GROUND FLOOR (F0) ----
  entranceblk: ['node001'],
  MAINmapF0: ['node001'],
  kitchen: ['node009'],
  neurology: ['node009', 'node010', 'node011'],
  breast: ['node009', 'node010', 'node011', 'node012'],
  head: ['node009', 'node010', 'node011', 'node012', 'node013'],
  skinMasc1: ['node009', 'node010', 'node011', 'node012', 'node013', 'node014', 'node015'],
  motawatna: ['node009', 'node010', 'node011', 'node012', 'node013', 'node014', 'node015', 'node016'],
  bone1: ['node001', 'node002', 'node003'],
  stomach: ['node001', 'node002', 'node003', 'node004', 'node005'],
  bone2: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006'],
  gensurg: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006', 'node007', 'node008'],
  women: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006', 'node007', 'node008'],
  womenEmer: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006', 'node007', 'node008'],
  burnEmer: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006', 'node007', 'node008'],
  cancer: ['node001', 'node002', 'node003', 'node004', 'node005', 'node006', 'node007', 'node008'],

  // ---- FLOOR 1 (F1 via 49,50,51) ----
  MAINmapF1: ['node009', 'node049', 'node050', 'node051'],
  nasal: ['node009', 'node049', 'node050', 'node051', 'node017'],
  eyes1: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018'],
  neural2: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018', 'node019'],
  eyes2: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018', 'node019', 'node020'],
  pathology2: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018', 'node019', 'node020', 'node021'],
  eyes3: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018', 'node019', 'node020', 'node021', 'node022'],
  scopies: ['node009', 'node049', 'node050', 'node051', 'node017', 'node018', 'node019', 'node020', 'node021', 'node022', 'node023'],
  surgeries: ['node009', 'node049', 'node050', 'node051', 'node024'],
  bone3: ['node009', 'node049', 'node050', 'node051', 'node024', 'node025', 'node026', 'node027'],
  masalek: ['node009', 'node049', 'node050', 'node051', 'node024', 'node025', 'node026', 'node027', 'node028', 'node029'],
  bone4: ['node009', 'node049', 'node050', 'node051', 'node024', 'node025', 'node026', 'node027', 'node028', 'node029', 'node030'],
  stomach2: ['node009', 'node049', 'node050', 'node051', 'node024', 'node025', 'node026', 'node027', 'node028', 'node029', 'node030', 'node031'],
  womenSurg: ['node009', 'node049', 'node050', 'node051', 'node024', 'node025', 'node026', 'node027', 'node028', 'node029', 'node030', 'node031', 'node032'],

  // ---- FLOOR 2 (F2 via 49,50,51 then 52,53,54) ----
  MAINmapF2: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054'],
  heartSurg: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node048'],
  heart: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node048', 'node047'],
  brain: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node048', 'node047', 'node046'],
  genSurg2: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node045'],
  pathology3: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node045', 'node044'],
  genSurg3: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node045', 'node044', 'node043'],
  surgeries2: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041'],
  intestines: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039'],
  beauty: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039', 'node038', 'node037'],
  stomach3: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039', 'node038', 'node037', 'node036'],
  genSurg4: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039', 'node038', 'node037', 'node036', 'node035'],
  womenSurg2: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039', 'node038', 'node037', 'node036', 'node035', 'node034'],
  womenSurg3: ['node009', 'node049', 'node050', 'node051', 'node052', 'node053', 'node054', 'node041', 'node040', 'node039', 'node038', 'node037', 'node036', 'node035', 'node034', 'node033'],
};

// ---------------------------------------------------------------------------

export default function Map3D({ selectedDepartment, onNodesLoaded }) {
  const { scene, nodes } = useGLTF('/ThreeDModels/hospIn.gltf');
  const controlsRef = useRef();
  const isCameraTransitioning = useRef(false);
  const transitionTime = useRef(0);
  const prevDepartment = useRef(selectedDepartment);

  const targetTarget = useRef(new THREE.Vector3(0, 0, 0));
  const targetPosition = useRef(new THREE.Vector3(0, 3.5, 7));

  // --- MEMOIZED ROLE MAPPING ---
  // Maps GLTF internal meshes to their logical roles and original node names
  const { meshRoles, departmentNames } = useMemo(() => {
    const roles = new Map();
    const depts = new Set();

    if (nodes) {
      Object.entries(nodes).forEach(([nodeName, obj]) => {
        if (!obj || !obj.isObject3D || nodeName === 'Scene') return;

        const nodeLower = nodeName.toLowerCase();
        console.log("node name is", nodeName);
        let type = 'dept';

        if (nodeLower.includes('node')) {
          type = 'path';
          console.log("type is set to path", nodeName);
        } else if (nodeLower.includes('entrance')) {
          type = 'entrance';
          console.log("type is set to entrance", nodeName);
        } else if (nodeLower.includes('arrow') || nodeLower.includes('text')) {
          type = 'arrow';
          console.log("type is set to arrow", nodeName);
        } else if (nodeName.startsWith('MAINmap')) {
          type = 'dept';
        }
        // I will regret this


        let hasMesh = false;
        obj.traverse((child) => {
          if (child.isMesh) {
            hasMesh = true;
            roles.set(child, { type, id: nodeName });
          }
        });

        if (type === 'dept' && hasMesh) {
          depts.add(nodeName);
        }
      });
    }

    const excludeKeys = ['entranceblk', 'MAINmapF0', 'MAINmapF1', 'MAINmapF2', 'MAINmapf0', 'MAINmapf1', 'MAINmapf2'];
    const validDepts = Object.keys(DEPARTMENT_PATHS);

    const filteredDepts = [...depts].filter(dept => 
      validDepts.includes(dept) && !excludeKeys.includes(dept)
    ).sort();

    return { meshRoles: roles, departmentNames: filteredDepts };
  }, [nodes]);

  // --- ONE-TIME SETUP: populate department list and initialize materials ---
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh) {
        // Save original material for color references
        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }

        // Initialize mutable material once
        child.material = new THREE.MeshStandardMaterial({
          color: child.userData.originalMaterial.color,
          roughness: 0.7,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 1
        });
        child.material.emissiveIntensity = 0;
      }
    });

    if (onNodesLoaded) {
      onNodesLoaded(departmentNames);
    }
  }, [scene, departmentNames, onNodesLoaded]);

  // --- SELECTION CHANGES: update materials + trigger camera transition ---
  useEffect(() => {
    if (!scene) return;

    const trimmedDept = selectedDepartment ? selectedDepartment.trim() : null;
    const pathNodeNames = trimmedDept && DEPARTMENT_PATHS[trimmedDept]
      ? DEPARTMENT_PATHS[trimmedDept]
      : [];

    scene.traverse((child) => {
      if (child.isMesh) {
        const role = meshRoles.get(child) || { type: 'unknown', id: child.name };

        let targetColor = new THREE.Color(0x555566);
        let targetEmissive = new THREE.Color(0x000000);
        let targetIntensity = 0;
        let targetOpacity = 1;
        
        // Default depth behavior
        child.material.depthTest = true;
        child.renderOrder = 0;

        if (role.type === 'entrance') {
          targetColor = child.userData.originalMaterial.color;
          targetEmissive = new THREE.Color(0x000000);
          targetIntensity = 0;
          targetOpacity = 1;
        } else if (role.type === 'arrow') {
          targetColor = child.userData.originalMaterial.color;
          targetEmissive = new THREE.Color(0xffffaa);
          targetIntensity = 1.3;
          targetOpacity = 1;
        } else if (role.type === 'path') {
          if (trimmedDept && pathNodeNames.includes(role.id)) {
            targetColor = new THREE.Color(0x00ccff);
            targetEmissive = new THREE.Color(0x00ccff);
            targetIntensity = 2.5;
            targetOpacity = 1;
            child.material.depthTest = false; // Bypass obstructions
            child.renderOrder = 999;
          } else if (trimmedDept) {
            targetColor = new THREE.Color(0x111122);
            targetOpacity = 0.05;
            targetIntensity = 0;
          } else {
            targetColor = new THREE.Color(0x333355);
            targetOpacity = 0.4;
            targetIntensity = 0;
          }
        } else if (role.type === 'dept') {
          if (trimmedDept && role.id !== trimmedDept) {
            targetColor = new THREE.Color(0x333344);
            targetOpacity = 0.2;
          } else if (role.id === trimmedDept) {
            targetColor = child.userData.originalMaterial.color;
            targetEmissive = new THREE.Color(0x00ff44);
            targetIntensity = 1.0; // Decreased bloom effect
            targetOpacity = 1;
          } else {
            targetColor = new THREE.Color(0x555566);
            targetOpacity = 1;
          }
        } else {
          targetColor = new THREE.Color(0x555566);
          targetOpacity = 1;
        }

        child.material.color.copy(targetColor);
        child.material.emissive.copy(targetEmissive);
        child.material.toneMapped = false;
        child.userData.targetEmissiveIntensity = targetIntensity;
        child.userData.targetOpacity = targetOpacity;
      }
    });

    // Only trigger camera transition when the selection actually changed
    if (prevDepartment.current !== selectedDepartment) {
      prevDepartment.current = selectedDepartment;
      isCameraTransitioning.current = true;
      transitionTime.current = 0;

      if (selectedDepartment) {
        const selectedMesh = scene.getObjectByName(selectedDepartment);
        if (selectedMesh) {
          const box = new THREE.Box3().setFromObject(selectedMesh);
          const center = new THREE.Vector3();
          box.getCenter(center);
          targetTarget.current.copy(center);

          const size = new THREE.Vector3();
          box.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z, 10);

          targetPosition.current.copy(center).add(
            new THREE.Vector3(maxDim * 0.8 / 3, maxDim * 1.5 / 3, maxDim * 1.2 / 3)
          );
        }
      } else {
        targetTarget.current.set(0, 0, 0);
        targetPosition.current.set(0, 3.5, 7);
      }
    }
  }, [scene, selectedDepartment, meshRoles]);

  // --- ANIMATION LOOP ---
  useFrame((state, delta) => {
    // 1. Lerp bloom intensity and opacity
    const lerpFactor = Math.min(delta * 3.33, 1);
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          if (child.userData.targetEmissiveIntensity !== undefined) {
            child.material.emissiveIntensity = THREE.MathUtils.lerp(
              child.material.emissiveIntensity,
              child.userData.targetEmissiveIntensity,
              lerpFactor
            );
          }
          if (child.userData.targetOpacity !== undefined) {
            child.material.opacity = THREE.MathUtils.lerp(
              child.material.opacity,
              child.userData.targetOpacity,
              lerpFactor
            );
          }
        }
      });
    }

    // 2. Camera transition
    if (controlsRef.current && isCameraTransitioning.current) {
      transitionTime.current += delta;
      const camLerp = Math.min(delta * 4, 1);
      controlsRef.current.target.lerp(targetTarget.current, camLerp);
      state.camera.position.lerp(targetPosition.current, camLerp);
      controlsRef.current.update();

      const targetDist = controlsRef.current.target.distanceTo(targetTarget.current);
      const posDist = state.camera.position.distanceTo(targetPosition.current);
      if ((targetDist < 0.3 && posDist < 0.3) || transitionTime.current > 1.2) {
        isCameraTransitioning.current = false;
      }
    }
  });

  // Cancel transition on user scroll
  useEffect(() => {
    const cancelTransition = () => { isCameraTransitioning.current = false; };
    window.addEventListener('wheel', cancelTransition);
    return () => window.removeEventListener('wheel', cancelTransition);
  }, []);

  // Cancel transition on pointer down (drag)
  const handleControlsStart = useCallback(() => {
    isCameraTransitioning.current = false;
  }, []);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 20, 10]} intensity={2} color="#ffffff" />

      <primitive object={scene} />

      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={1.2} mipmapBlur intensity={1.0} />
      </EffectComposer>

      <OrbitControls
        ref={controlsRef}
        makeDefault
        onStart={handleControlsStart}
      />
    </>
  );
}
