"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * Ambient WebGL background — "Kunang-kunang Tungsten".
 * Partikel cahaya hangat (bokeh) yang melayang pelan, berkedip halus,
 * dengan parallax mengikuti pointer. Terpicu "burst" saat transaksi disimpan.
 */

const VERT = /* glsl */ `
uniform float uTime;
uniform float uBoost;
uniform float uDpr;
attribute float aSeed;
attribute float aSize;
varying float vGlow;
varying float vSeed;

void main() {
  vec3 p = position;
  float H = 46.0;
  p.y = mod(position.y + uTime * (0.22 + aSeed * 0.28), H) - H * 0.5;
  p.x += sin(uTime * (0.10 + aSeed * 0.12) + aSeed * 43.0) * 1.3;
  p.z += cos(uTime * (0.08 + aSeed * 0.10) + aSeed * 17.0) * 0.9;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float tw = 0.55 + 0.45 * sin(uTime * (0.5 + aSeed * 1.4) + aSeed * 90.0);
  vGlow = tw * (1.0 + uBoost * 1.8);
  vSeed = aSeed;

  float size = aSize * (1.0 + uBoost * 0.7) * (0.72 + 0.55 * tw);
  gl_PointSize = size * uDpr * (150.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
varying float vGlow;
varying float vSeed;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.04, d);
  a *= a;
  vec3 warmA = vec3(1.0, 0.60, 0.20);
  vec3 warmB = vec3(1.0, 0.82, 0.48);
  vec3 col = mix(warmA, warmB, fract(vSeed * 7.31));
  col = mix(col, vec3(0.72, 0.80, 1.0), step(0.88, vSeed) * 0.9);
  gl_FragColor = vec4(col, a * vGlow * 0.5);
}
`;

export default function Ambient() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return; // WebGL tidak tersedia — UI tetap berjalan tanpa background
    }
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 14);

    const isSmall = window.matchMedia("(max-width: 640px)").matches;
    const COUNT = isSmall ? 85 : 150;

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    const sizes = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 1;
      seeds[i] = Math.random();
      sizes[i] = 0.5 + Math.pow(Math.random(), 2.4) * 3.9;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const uniforms = { uTime: { value: 0 }, uBoost: { value: 0 }, uDpr: { value: 1 } };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geo, mat));

    // Parallax pointer
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onPointer = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Burst: dipanggil saat transaksi disimpan / berhasil auth
    let boost = 0;
    const onBurst = () => { boost = 1; };
    window.addEventListener("lampu:burst", onBurst);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uDpr.value = dpr;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const clock = new THREE.Clock();

    const render = () => {
      uniforms.uTime.value = clock.getElapsedTime();
      boost *= 0.94;
      uniforms.uBoost.value = boost;
      cx += (tx - cx) * 0.04;
      cy += (ty - cy) * 0.04;
      camera.position.x = cx * 1.4;
      camera.position.y = -cy * 1.0;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    if (reduced) {
      render(); // satu frame statis untuk prefers-reduced-motion
    } else {
      const loop = () => {
        if (!document.hidden) render();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("lampu:burst", onBurst);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="fixed inset-0 z-0 h-full w-full" />;
}
