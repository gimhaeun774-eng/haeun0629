'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { 
  RotateCw, 
  RotateCcw, 
  Play, 
  Pause, 
  Trash2, 
  Save, 
  Database, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Undo,
  Volume2
} from 'lucide-react';

interface RotationalSolid {
  id?: string;
  student_name: string;
  solid_name: string;
  vertices: [number, number][];
  color: string;
  angle: number;
  created_at?: string;
}

// 2D grid dimensions
const GRID_MAX_X = 8;
const GRID_MIN_Y = -8;
const GRID_MAX_Y = 8;
const SNAP_STEP = 0.5;

// Presets definitions
const PRESETS = {
  cylinder: {
    name: '원기둥 (Cylinder)',
    vertices: [[0, 5], [3, 5], [3, -5], [0, -5]] as [number, number][],
    color: '#3b82f6',
    description: '직사각형을 한 변을 축으로 회전시키면 원기둥이 됩니다.'
  },
  cone: {
    name: '원뿔 (Cone)',
    vertices: [[0, 5], [3, -5], [0, -5]] as [number, number][],
    color: '#ec4899',
    description: '직각삼각형을 한 변을 축으로 회전시키면 원뿔이 됩니다.'
  },
  sphere: {
    name: '구 (Sphere)',
    vertices: [
      [0, 5],
      [1.91, 4.62],
      [3.53, 3.53],
      [4.62, 1.91],
      [5, 0],
      [4.62, -1.91],
      [3.53, -3.53],
      [1.91, -4.62],
      [0, -5]
    ] as [number, number][],
    color: '#10b981',
    description: '반원을 지름을 축으로 회전시키면 구가 됩니다.'
  },
  frustum: {
    name: '원뿔대 (Cone Frustum)',
    vertices: [[0, 5], [2, 5], [4, -5], [0, -5]] as [number, number][],
    color: '#f59e0b',
    description: '사다리꼴을 축으로 회전시키면 원뿔대가 됩니다.'
  },
  torus: {
    name: '도넛 (Torus)',
    vertices: [[3, 2], [4.5, 2], [4.5, -2], [3, -2]] as [number, number][],
    color: '#8b5cf6',
    description: '축에서 떨어진 평면도형을 회전시키면 도넛 모양(회전체)이 됩니다.'
  }
};

const COLOR_PALETTE = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Orange
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

export default function Home() {
  // Simulator State
  const [vertices, setVertices] = useState<[number, number][]>(PRESETS.cylinder.vertices);
  const [angle, setAngle] = useState<number>(360);
  const [color, setColor] = useState<string>('#3b82f6');
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [presetDescription, setPresetDescription] = useState<string>(PRESETS.cylinder.description);

  // Drag and Drop state for 2D Editor
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [editorWidth, setEditorWidth] = useState<number>(400);
  const [editorHeight, setEditorHeight] = useState<number>(400);

  // Supabase & Gallery State
  const [studentName, setStudentName] = useState<string>('');
  const [solidName, setSolidName] = useState<string>('');
  const [gallery, setGallery] = useState<RotationalSolid[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Refs
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const latheMeshRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Load initial gallery list
  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('rotational_solids')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setGallery(data || []);
      } else {
        const localData = localStorage.getItem('rotational_solids');
        setGallery(localData ? JSON.parse(localData) : []);
      }
    } catch (err) {
      console.error('Error loading gallery:', err);
    }
  };

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    // Dimensions
    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19'); // Deep space blue/black
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(12, 8, 12);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    
    // Clear any previous canvas
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit camera from going completely underground
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.4); // Subtle blue fill light
    dirLight2.position.set(-10, -5, -10);
    scene.add(dirLight2);

    // Helpers
    // Grid Helper (Floor)
    const gridHelper = new THREE.GridHelper(16, 16, 0x334155, 0x1e293b);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // Y-Axis Line (The Rotation Axis)
    const axisMaterial = new THREE.LineBasicMaterial({ 
      color: 0xef4444, 
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    const axisPoints = [
      new THREE.Vector3(0, -6, 0),
      new THREE.Vector3(0, 6, 0)
    ];
    const axisGeometry = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisLine = new THREE.Line(axisGeometry, axisMaterial);
    scene.add(axisLine);

    // X-Axis Indicator
    const xAxisMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
    const xAxisPoints = [new THREE.Vector3(-8, -6, 0), new THREE.Vector3(8, -6, 0)];
    const xAxisGeometry = new THREE.BufferGeometry().setFromPoints(xAxisPoints);
    const xAxisLine = new THREE.Line(xAxisGeometry, xAxisMaterial);
    scene.add(xAxisLine);

    // Animation Loop
    let animationFrameId: number;
    let autoRotationAngle = 0;

    const animate = () => {
      controls.update();

      if (isRotating && latheMeshRef.current) {
        latheMeshRef.current.rotation.y += 0.01 * rotationSpeed;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Resize listener
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      gridHelper.geometry.dispose();
      axisGeometry.dispose();
      axisMaterial.dispose();
      xAxisGeometry.dispose();
      xAxisMaterial.dispose();
    };
  }, [isRotating, rotationSpeed]);

  // Update 3D Lathe Geometry when parameters change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || vertices.length < 2) return;

    // Clear previous lathe mesh
    if (latheMeshRef.current) {
      scene.remove(latheMeshRef.current);
      latheMeshRef.current.geometry.dispose();
      if (Array.isArray(latheMeshRef.current.material)) {
        latheMeshRef.current.material.forEach((m) => m.dispose());
      } else {
        latheMeshRef.current.material.dispose();
      }
      latheMeshRef.current = null;
    }

    // Convert 2D vertices to THREE.Vector2 points
    // Grid: X [0 to 8], Y [-8 to 8].
    // LatheGeometry rotates points around the Y-axis.
    const points = vertices.map((v) => new THREE.Vector2(v[0], v[1]));

    // Angle to radians
    const phiLength = (angle / 360) * Math.PI * 2;

    // Create Lathe Geometry
    // segments = 48 for smoothness, phiLength controls how much of the solid is swept out
    const geometry = new THREE.LatheGeometry(points, 48, 0, phiLength);

    // Standard solid material with shiny lighting
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.3,
      metalness: 0.3,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      flatShading: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    latheMeshRef.current = mesh;

  }, [vertices, angle, color, wireframe]);

  // Sweep (Rotation) Animation effect
  const handleSweepAnimation = () => {
    setAngle(0);
    let currentAngle = 0;
    const interval = setInterval(() => {
      currentAngle += 5;
      if (currentAngle >= 360) {
        setAngle(360);
        clearInterval(interval);
      } else {
        setAngle(currentAngle);
      }
    }, 20);
  };

  // Convert pixel coordinates of SVG to Math coordinates
  const pixelToMath = (px: number, py: number): [number, number] => {
    // x: 0 to GRID_MAX_X (right side only)
    const x = (px / editorWidth) * GRID_MAX_X;
    // y: GRID_MAX_Y down to GRID_MIN_Y (inverted axis)
    const y = GRID_MAX_Y - (py / editorHeight) * (GRID_MAX_Y - GRID_MIN_Y);
    return [x, y];
  };

  // Convert Math coordinates to SVG pixel coordinates
  const mathToPixel = (x: number, y: number): [number, number] => {
    const px = (x / GRID_MAX_X) * editorWidth;
    const py = ((GRID_MAX_Y - y) / (GRID_MAX_Y - GRID_MIN_Y)) * editorHeight;
    return [px, py];
  };

  // Click handler on the 2D grid to add points
  const handleGridClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingIdx !== null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    
    const [rawX, rawY] = pixelToMath(px, py);

    // Restrict coordinates: x must be >= 0 (on or right of Y axis)
    let mathX = Math.max(0, rawX);
    let mathY = Math.max(GRID_MIN_Y, Math.min(GRID_MAX_Y, rawY));

    // Snap to grid
    mathX = Math.round(mathX / SNAP_STEP) * SNAP_STEP;
    mathY = Math.round(mathY / SNAP_STEP) * SNAP_STEP;

    // Check if clicked close to an existing point to avoid duplicates
    const clickThreshold = 0.3;
    const duplicate = vertices.some(
      (v) => Math.hypot(v[0] - mathX, v[1] - mathY) < clickThreshold
    );
    if (duplicate) return;

    // Add new vertex (insert sequentially based on Y value, or just append)
    // To draw continuous polygons, we append them.
    const newVertices = [...vertices, [mathX, mathY] as [number, number]];
    setVertices(newVertices);
  };

  // Mouse drag handlers for editing vertex positions
  const handleVertexMouseDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent grid click triggering
    setDraggingIdx(idx);
  };

  const handleSVGMouseMove = (e: React.MouseEvent) => {
    if (draggingIdx === null || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const [rawX, rawY] = pixelToMath(px, py);

    // Apply boundaries (X >= 0, Y between min and max)
    let newX = Math.max(0, rawX);
    let newY = Math.max(GRID_MIN_Y, Math.min(GRID_MAX_Y, rawY));

    // Snap to grid
    newX = Math.round(newX / SNAP_STEP) * SNAP_STEP;
    newY = Math.round(newY / SNAP_STEP) * SNAP_STEP;

    const updated = [...vertices];
    updated[draggingIdx] = [newX, newY];
    setVertices(updated);
  };

  const handleSVGMouseUp = () => {
    setDraggingIdx(null);
  };

  // Double click on point to delete it
  const handleVertexDoubleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vertices.length <= 2) {
      alert('회전체를 구성하려면 최소 2개의 점이 필요합니다!');
      return;
    }
    const updated = vertices.filter((_, i) => i !== idx);
    setVertices(updated);
  };

  // Clear all points
  const handleClearAll = () => {
    // Keep a basic line to prevent blank errors
    setVertices([[0, 2], [3, -2]]);
  };

  // Load Preset
  const handleLoadPreset = (key: keyof typeof PRESETS) => {
    setVertices(PRESETS[key].vertices);
    setColor(PRESETS[key].color);
    setPresetDescription(PRESETS[key].description);
    setAngle(360);
  };

  // Save to Database / LocalStorage
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !solidName.trim()) {
      alert('학생 이름과 회전체 이름을 모두 입력해주세요!');
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    const payload: RotationalSolid = {
      student_name: studentName,
      solid_name: solidName,
      vertices,
      color,
      angle
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('rotational_solids')
          .insert([payload]);
        if (error) throw error;
        setSaveStatus({ type: 'success', message: '데이터베이스에 멋진 회전체가 성공적으로 저장되었습니다! 🚀' });
      } else {
        // LocalStorage Fallback
        const localData = localStorage.getItem('rotational_solids');
        const items = localData ? JSON.parse(localData) : [];
        const newItem = {
          ...payload,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString()
        };
        items.unshift(newItem);
        localStorage.setItem('rotational_solids', JSON.stringify(items));
        setSaveStatus({ 
          type: 'success', 
          message: '로컬 브라우저 저장소(LocalStorage)에 회전체가 임시 저장되었습니다! (오프라인 모드)' 
        });
      }
      setSolidName('');
      loadGallery();
    } catch (err: any) {
      console.error(err);
      setSaveStatus({ type: 'error', message: `저장에 실패했습니다: ${err.message || err}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved item from gallery
  const handleLoadSaved = (item: RotationalSolid) => {
    setVertices(item.vertices);
    setColor(item.color);
    setAngle(item.angle);
    setPresetDescription(`[${item.student_name}] 학생이 만든 회전체: "${item.solid_name}"`);
    
    // Smooth camera reset
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(12, 8, 12);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Helper for generating background SVG grid lines
  const renderGridLines = () => {
    const lines = [];
    
    // Vertical lines (X-axis distance)
    for (let x = 0; x <= GRID_MAX_X; x += SNAP_STEP) {
      const [px] = mathToPixel(x, 0);
      const isWhole = x % 1 === 0;
      lines.push(
        <line
          key={`v-${x}`}
          x1={px}
          y1={0}
          x2={px}
          y2={editorHeight}
          stroke={x === 0 ? '#ef4444' : '#334155'}
          strokeWidth={x === 0 ? 3 : isWhole ? 1 : 0.5}
          strokeDasharray={!isWhole ? '2,4' : undefined}
        />
      );
    }

    // Horizontal lines (Y-axis height)
    for (let y = GRID_MIN_Y; y <= GRID_MAX_Y; y += SNAP_STEP) {
      const [, py] = mathToPixel(0, y);
      const isWhole = y % 1 === 0;
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={py}
          x2={editorWidth}
          y2={py}
          stroke={y === 0 ? '#475569' : '#334155'}
          strokeWidth={y === 0 ? 1.5 : isWhole ? 1 : 0.5}
          strokeDasharray={!isWhole ? '2,4' : undefined}
        />
      );
    }

    return lines;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-sky-500 rounded-2xl shadow-lg shadow-indigo-500/20">
            <RotateCw className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              입체 회전체 공장
            </h1>
            <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase">Solid of Revolution Simulator</p>
          </div>
        </div>

        {/* Supabase connection indicator */}
        <div className="flex items-center gap-2">
          {isSupabaseConfigured ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 shadow-sm shadow-emerald-500/5">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase 실시간 연동 중</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-900/50 shadow-sm shadow-amber-500/5">
              <Database className="w-3.5 h-3.5 text-amber-500" />
              <span>로컬 저장소 모드 (오프라인)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        
        {/* Intro banner */}
        <section className="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-sm">
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
              <HelpCircle className="w-5 h-5" /> 회전체 학습 가이드
            </h2>
            <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
              왼쪽 모눈종이에서 점들을 클릭하여 <strong>평면도형(단면)</strong>을 그려 보세요. 
              빨간색 Y축을 기준으로 회전하면서 3D 공간 상에 생성되는 <strong>회전체</strong>의 기하학적 형태를 우측에서 마우스로 조작해 볼 수 있습니다. 
              점은 드래그하여 이동하고, <strong>더블클릭</strong>하면 지워집니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handleLoadPreset(key as keyof typeof PRESETS)}
                className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-indigo-600 hover:text-white border border-slate-700/60 hover:border-indigo-500 rounded-xl transition duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3" />
                {PRESETS[key as keyof typeof PRESETS].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </section>

        {/* 2D Grid & 3D Viewer Container */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: 2D Grid Editor */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  2D 단면 그리기 (반지름-높이 평면)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">X축은 반지름(축으로부터 거리), Y축은 높이입니다.</p>
              </div>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs font-bold bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-rose-950/80 hover:text-rose-400 hover:border-rose-900/60 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                도형 초기화
              </button>
            </div>

            {/* SVG Grid Area */}
            <div className="flex-1 flex items-center justify-center p-2 bg-slate-950 rounded-2xl border border-slate-900 relative overflow-hidden aspect-square select-none">
              <svg
                ref={svgRef}
                width={editorWidth}
                height={editorHeight}
                onClick={handleGridClick}
                onMouseMove={handleSVGMouseMove}
                onMouseUp={handleSVGMouseUp}
                onMouseLeave={handleSVGMouseUp}
                className="cursor-crosshair bg-slate-950 max-w-full max-h-full"
              >
                {/* Background Grid Lines */}
                {renderGridLines()}

                {/* Draw polygon stroke */}
                {vertices.length >= 2 && (
                  <polyline
                    points={vertices
                      .map((v) => mathToPixel(v[0], v[1]).join(','))
                      .join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                  />
                )}

                {/* Red dashed line representing rotation loop close if not closed */}
                {vertices.length >= 2 && (
                  <line
                    x1={mathToPixel(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1])[0]}
                    y1={mathToPixel(vertices[vertices.length - 1][0], vertices[vertices.length - 1][1])[1]}
                    x2={mathToPixel(vertices[0][0], vertices[0][1])[0]}
                    y2={mathToPixel(vertices[0][0], vertices[0][1])[1]}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    opacity="0.6"
                  />
                )}

                {/* Vertices handles (interactive circles) */}
                {vertices.map((v, idx) => {
                  const [px, py] = mathToPixel(v[0], v[1]);
                  const isHovered = draggingIdx === idx;
                  return (
                    <g key={idx} className="group">
                      <circle
                        cx={px}
                        cy={py}
                        r="10"
                        fill="transparent"
                        className="cursor-grab active:cursor-grabbing"
                        onMouseDown={(e) => handleVertexMouseDown(idx, e)}
                        onDoubleClick={(e) => handleVertexDoubleClick(idx, e)}
                      />
                      <circle
                        cx={px}
                        cy={py}
                        r={isHovered ? "7" : "5.5"}
                        fill={v[0] === 0 ? "#ef4444" : color}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? "2.5" : "1.5"}
                        className="pointer-events-none transition-all duration-150 shadow-md group-hover:scale-125"
                      />
                      <text
                        x={px + 9}
                        y={py - 9}
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="bold"
                        className="pointer-events-none font-mono"
                      >
                        ({v[0].toFixed(1)}, {v[1].toFixed(1)})
                      </text>
                    </g>
                  );
                })}
              </svg>
              
              {/* Bottom indicator inside grid */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 text-[10px] px-2 py-1 rounded-md text-slate-400 font-mono pointer-events-none">
                격자 스냅: {SNAP_STEP} 단위 | 더블클릭: 점 삭제
              </div>
            </div>

            {/* Polygon status / templates description */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/40 text-xs">
              <span className="font-bold text-slate-300 block mb-1">도형 설명 및 좌표 정보</span>
              <p className="text-slate-400 leading-relaxed mb-2">{presetDescription}</p>
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                <span className="text-indigo-400 font-semibold mr-1">좌표 리스트:</span>
                {vertices.map((v, i) => (
                  <span key={i} className="bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-900">
                    P{i+1}({v[0]}, {v[1]})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: 3D Lathe Viewer */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  3D 회전체 실시간 관찰 (Y축 회전)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">마우스로 화면을 드래그하여 회전하거나 줌할 수 있습니다.</p>
              </div>

              {/* Angle quick play button */}
              <button
                onClick={handleSweepAnimation}
                className="px-3.5 py-1.5 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition cursor-pointer shadow-md shadow-indigo-500/20 active:scale-95 flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                회전 애니메이션
              </button>
            </div>

            {/* ThreeJS Container */}
            <div className="flex-1 min-h-[400px] bg-slate-950 rounded-2xl border border-slate-900 relative overflow-hidden">
              <div ref={mountRef} className="w-full h-full" />
              
              {/* Overlay controls for wireframe and color */}
              <div className="absolute top-4 left-4 p-3 bg-slate-900/80 border border-slate-800/80 backdrop-blur-md rounded-2xl space-y-3 shadow-lg max-w-[200px]">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">도형 색상</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-lg transition-transform duration-100 cursor-pointer ${
                          color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="wireframe-toggle" className="text-xs font-semibold text-slate-300 cursor-pointer">와이어프레임 격자</label>
                  <input
                    type="checkbox"
                    id="wireframe-toggle"
                    checked={wireframe}
                    onChange={(e) => setWireframe(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-700 cursor-pointer focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Axis Label details */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 border border-slate-800/80 px-3 py-2 rounded-xl text-[10px] font-semibold text-slate-400 space-y-0.5 pointer-events-none">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Y축: 회전 대칭축 (Line of Rotation)</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> X축: 반지름 방향 (Radius)</div>
              </div>
            </div>

            {/* Slider to control Rotation Angle */}
            <div className="mt-5 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-900/80">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  회전 각도 (Sweep Angle)
                </span>
                <span className="text-sm font-black text-indigo-400 font-mono">{angle}° / 360°</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="5"
                  max="360"
                  step="5"
                  value={angle}
                  onChange={(e) => setAngle(parseInt(e.target.value))}
                  className="flex-1 accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive spin state */}
            <div className="mt-3 flex items-center justify-between bg-slate-900/40 px-4 py-3 rounded-xl border border-slate-800/40 text-xs">
              <span className="text-slate-300 font-semibold">완성품 360도 연속 자전 회전</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRotating(!isRotating)}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition cursor-pointer ${
                    isRotating 
                      ? 'bg-amber-600 hover:bg-amber-500 text-white shadow shadow-amber-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isRotating ? (
                    <>
                      <Pause className="w-3 h-3" /> 일시정지
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" /> 자전 시작
                    </>
                  )}
                </button>
                {isRotating && (
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 text-[10px]">속도:</span>
                    <select
                      value={rotationSpeed}
                      onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                      className="bg-slate-950 border border-slate-800 text-[11px] rounded px-1 py-0.5 font-bold text-indigo-400"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1.0x</option>
                      <option value="2">2.0x</option>
                      <option value="4">4.0x</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Database Form & Gallery */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Save Shape Form */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2 mb-1">
                <Save className="w-5 h-5 text-indigo-400" />
                내 회전체 작품 저장하기
              </h3>
              <p className="text-xs text-slate-400 mb-6">내가 만든 평면 도형과 3D 결과를 데이터베이스에 등록합니다.</p>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="student-name" className="text-xs font-bold text-slate-300 block">이름 (선생님 또는 학생)</label>
                  <input
                    type="text"
                    id="student-name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="예: 홍길동"
                    maxLength={20}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="solid-name" className="text-xs font-bold text-slate-300 block">회전체 이름</label>
                  <input
                    type="text"
                    id="solid-name"
                    value={solidName}
                    onChange={(e) => setSolidName(e.target.value)}
                    placeholder="예: 나만의 원뿔대"
                    maxLength={30}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-slate-600"
                    required
                  />
                </div>

                {saveStatus.type && (
                  <div className={`p-3.5 rounded-xl text-xs font-medium border leading-relaxed ${
                    saveStatus.type === 'success' 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-900/50' 
                      : 'bg-rose-950/60 text-rose-300 border-rose-900/50'
                  }`}>
                    {saveStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-sm rounded-xl transition duration-200 cursor-pointer shadow-lg shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? '데이터 저장 중...' : '데이터베이스에 저장'}
                </button>
              </form>
            </div>

            <div className="mt-6 border-t border-slate-800/80 pt-4 text-[10px] text-slate-500 leading-relaxed">
              * 데이터가 저장되면 학급 친구들 모두와 갤러리 탭에서 작품을 서로 공유하고, 서로의 모양을 마우스로 돌려보며 학습할 수 있습니다.
            </div>
          </div>

          {/* Student Gallery List */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="font-extrabold text-lg text-slate-100 flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-indigo-400" />
              학급 친구들의 회전체 미술관 (갤러리)
            </h3>
            <p className="text-xs text-slate-400 mb-6">최근에 학생들이 만들어 저장한 회전체 리스트입니다. 카드를 클릭하면 그 도형을 그대로 가져옵니다.</p>

            <div className="flex-1 overflow-y-auto max-h-[360px] pr-2 custom-scrollbar">
              {gallery.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-slate-500 bg-slate-950/40 border border-slate-900 rounded-2xl">
                  <Database className="w-8 h-8 mb-2 text-slate-700" />
                  <p className="text-sm font-medium">아직 등록된 회전체 작품이 없습니다.</p>
                  <p className="text-xs text-slate-600 mt-1">첫 번째 멋진 작품을 완성해서 저장해보세요!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadSaved(item)}
                      className="p-4 bg-slate-950 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-2xl cursor-pointer transition duration-200 group flex items-start justify-between"
                    >
                      <div className="space-y-2">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {item.solid_name}
                          </h4>
                          <p className="text-xs text-slate-400">
                            만든이: <span className="text-slate-300 font-semibold">{item.student_name}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            정점 {item.vertices.length}개
                          </span>
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            각도 {item.angle}°
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between h-full min-h-[56px]">
                        {/* Dot with shape color */}
                        <div
                          style={{ backgroundColor: item.color }}
                          className="w-4 h-4 rounded-full shadow"
                        />
                        <span className="text-[10px] text-slate-600 font-mono mt-auto">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '오프라인'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto bg-slate-950/40">
        <p>© 2026 수학 코딩 교실 - 입체 회전체 공장. All rights reserved.</p>
      </footer>
    </div>
  );
}
