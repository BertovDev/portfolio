import React, { useEffect, useMemo, useRef } from "react";
import {
  InstancedRigidBodies,
  InstancedRigidBodyProps,
} from "@react-three/rapier";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useClearDiplomasStore } from "@/utils/Utils";
import gsap from "gsap";

type GLTFResult = GLTF & {
  nodes: {
    pCube1_lambert1_0: THREE.Mesh;
  };
  materials: {
    lambert1: THREE.MeshStandardMaterial;
  };
};
const RANGE = 70;

// Simple noise function for dissolve effect
const noiseFunction = `
  // Simple 3D noise function
  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // Fractal Brownian Motion for smoother noise
  float fbm(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 0.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * snoise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
`;

// Vertex Shader - handles position and instance transformations
const vertexShader = `
  attribute vec3 instanceColor;
  attribute float instanceTime;
  attribute float instanceProgress;
  
  varying vec3 vColor;
  varying vec3 vPosition;
  varying float vTime;
  varying float vProgress;
  varying vec2 vUv;
  
  void main() {
    vColor = instanceColor;
    vTime = instanceTime;
    vProgress = instanceProgress;
    vPosition = position;
    vUv = uv;
    
    // Standard vertex transformation
    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
  }
`;

// Fragment Shader - handles the visual appearance with dissolve effect
const fragmentShader = `
  ${noiseFunction}
  
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uSpeed;
  uniform sampler2D uMap;
  uniform bool uHasMap;
  uniform float uProgress;
  uniform float uThickness;
  uniform vec3 uEdgeColor;
  uniform float uNoiseScale;
  
  varying vec3 vColor;
  varying vec3 vPosition;
  varying float vTime;
  varying float vProgress;
  varying vec2 vUv;
  
  void main() {
    // Start with base color from material
    vec3 color = uBaseColor;
    
    // Apply texture if available
    if (uHasMap) {
      vec4 texColor = texture2D(uMap, vUv);
      color = mix(color, texColor.rgb, texColor.a);
    }
    
    // Calculate dissolve effect
    // Use world position for noise to work consistently across instances
    vec3 worldPos = vPosition;
    float noise = fbm(worldPos * uNoiseScale + vTime * 0.5);
    noise = (noise + 1.0) * 0.5; // Normalize to 0-1
    
    // Use global progress (uProgress takes precedence)
    // When uProgress is 0.0, fully dissolve regardless of instance progress
    float progress = uProgress;
    
    // Calculate threshold - when progress is 0, threshold is 1 (fully dissolved)
    // When progress is 1, threshold is 0 (fully visible)
    float threshold = 1.0 - progress;
    
    // Calculate alpha: noise >= threshold means visible
    // When threshold is 1.0 (progress = 0), noise (0-1) will never be >= 1.0, so alpha = 0
    float alpha = step(threshold, noise);
    
    // Calculate border (edge glow) - area just before the threshold
    float border = step(threshold - uThickness, noise) - alpha;
    
    // Apply edge color to border
    vec3 finalColor = mix(color, uEdgeColor, border);
    
    // Discard pixels that should be dissolved (alpha is 0 or very low)
    if (alpha < 0.01) {
      discard;
    }
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function DiplomaInstances() {
  const { nodes, materials } = useGLTF("/diploma.glb") as unknown as GLTFResult;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const { disolveDiplomas, setClearDiplomas, setDisolveDiplomas } =
    useClearDiplomasStore();

  // Leva controls for dissolve effect
  const dissolveControls = useControls("Dissolve Effect", {
    progress: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
    thickness: { value: 0.1, min: 0.0, max: 0.5, step: 0.01 },
    noiseScale: { value: 2.0, min: 0.5, max: 5.0, step: 0.1 },
    edgeColor: "#eb5a13",
    edgeIntensity: { value: 20, min: 1, max: 50, step: 1 },
  });

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < RANGE; i++) {
      instances.push({
        key: `instance_${i}`,
        position: [
          2 + Math.random() * -5,
          8 + Math.random() * 200,
          Math.random() * 2,
        ],
        rotation: [
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
          Math.random() * 2 * Math.PI,
        ],
        scale: [1, .5, 1],
      });
    }

    return instances;
  }, []);

  // Create shader material using properties from GLB material
  const shaderMaterial = useMemo(() => {
    const originalMaterial = materials.lambert1;
    const baseColor = originalMaterial.color || new THREE.Color(0xffffff);
    const hasMap = originalMaterial.map !== null;

    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: baseColor },
        uSpeed: { value: 1.0 },
        uMap: { value: originalMaterial.map || null },
        uHasMap: { value: hasMap },
        uProgress: { value: dissolveControls.progress }, // 1.0 = fully visible, 0.0 = fully dissolved
        uThickness: { value: dissolveControls.thickness }, // Edge glow thickness
        uEdgeColor: {
          value: new THREE.Color(dissolveControls.edgeColor).multiplyScalar(
            dissolveControls.edgeIntensity
          ),
        }, // Edge glow color
        uNoiseScale: { value: dissolveControls.noiseScale }, // Noise scale for dissolve pattern
      },
      transparent: true,
    });
  }, [materials, dissolveControls]);

  // Set up instance attributes for per-instance variations
  React.useEffect(() => {
    if (!meshRef.current) return;

    const geometry = nodes.pCube1_lambert1_0.geometry;

    // Create instance color attribute
    const instanceColors = new Float32Array(RANGE * 3);
    const instanceTimes = new Float32Array(RANGE);
    const instanceProgress = new Float32Array(RANGE);

    for (let i = 0; i < RANGE; i++) {
      // Use subtle variations based on original material color
      const originalColor =
        materials.lambert1.color || new THREE.Color(0xffffff);
      const hsl = { h: 0, s: 0, l: 0 };
      originalColor.getHSL(hsl);
      const hue = (hsl.h + Math.random() * 0.1) % 1.0;
      const color = new THREE.Color().setHSL(hue, 0.7, 0.6);
      instanceColors[i * 3] = color.r;
      instanceColors[i * 3 + 1] = color.g;
      instanceColors[i * 3 + 2] = color.b;

      // Random time offset per instance
      instanceTimes[i] = Math.random() * Math.PI * 2;

      // Per-instance progress (optional - can be used for staggered dissolve)
      instanceProgress[i] = 1.0; // Start fully visible (not used currently, uProgress takes precedence)
    }

    // Add attributes to geometry
    geometry.setAttribute(
      "instanceColor",
      new THREE.InstancedBufferAttribute(instanceColors, 3)
    );
    geometry.setAttribute(
      "instanceTime",
      new THREE.InstancedBufferAttribute(instanceTimes, 1)
    );
    geometry.setAttribute(
      "instanceProgress",
      new THREE.InstancedBufferAttribute(instanceProgress, 1)
    );
  }, [nodes, materials]);

  useEffect(() => {
    if (disolveDiplomas && shaderMaterialRef.current) {
      const tl = gsap.timeline();

      tl.to(shaderMaterialRef.current.uniforms.uProgress, {
        value: 0,
        duration: 1,
        ease: "power1.inOut",
        onComplete: () => {
          setDisolveDiplomas(false);
          setClearDiplomas(false);
        },
      });
    }
  }, [disolveDiplomas]);

  // Animate shader uniforms and update from Leva controls
  useFrame((state) => {
    console.log(disolveDiplomas);
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = state.clock.elapsedTime;

      // Update uniforms from Leva controls
      //   shaderMaterialRef.current.uniforms.uProgress.value =
      //     dissolveControls.progress;
      shaderMaterialRef.current.uniforms.uThickness.value =
        dissolveControls.thickness;
      shaderMaterialRef.current.uniforms.uNoiseScale.value =
        dissolveControls.noiseScale;
      shaderMaterialRef.current.uniforms.uEdgeColor.value
        .set(dissolveControls.edgeColor)
        .multiplyScalar(dissolveControls.edgeIntensity);
    }
  });

  return (
    <>
      <InstancedRigidBodies
        scale={[1, 1, 1]}
        instances={instances}
        type="dynamic"
        colliders="cuboid"
        linearDamping={0.95}
        angularDamping={0.95}
      >
        <instancedMesh
          ref={meshRef}
          args={[nodes.pCube1_lambert1_0.geometry, undefined, instances.length]}
          count={instances.length}
          scale={[1, 1, 1]}
        >
          <primitive
            object={shaderMaterial}
            ref={shaderMaterialRef}
            attach="material"
          />
        </instancedMesh>
      </InstancedRigidBodies>
    </>
  );
}
