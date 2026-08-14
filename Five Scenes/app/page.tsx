"use client";

import { PointerEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

type CourseScene = 1 | 2;
type Direction = "N" | "E" | "S" | "W";
type MoveCommand = "MOVE" | "LEFT" | "RIGHT";
type Point = { x: number; y: number };
type ArtStage = "wave" | "bloom" | "multiply" | "create";

const COURSE = [
  { n: 1 as const, name: "PATTERN", idea: "Draw with repeated motion" },
  { n: 2 as const, name: "ALGORITHM ART", idea: "Transform your own mark" },
];

const ART_STAGES: { id: ArtStage; label: string; idea: string }[] = [
  { id: "wave", label: "WAVE", idea: "motion becomes a drawing" },
  { id: "bloom", label: "BLOOM", idea: "one rule grows a flower" },
  { id: "multiply", label: "MULTIPLY", idea: "a loop builds complexity" },
  { id: "create", label: "CREATE", idea: "your mark becomes art" },
];

const COLORS = ["#f4c900", "#ee3424", "#1558d6", "#42a978"];
const ART_OPERATIONS = [
  "DRAW(mark):\n  canvas draws the selected mark at position",
  "ROTATE(angle):\n  heading = heading + angle",
  "MOVE(distance):\n  position = position + distance",
  "REPEAT(count, steps):\n  FOR copy FROM 1 TO count:\n    RUN steps in order",
  "GROW(percent):\n  scale = scale + percent / 100",
  "CHANGE_COLOUR():\n  colour = next colour in palette",
];

function CodeButton({ onClick }: { onClick: () => void }) {
  return <button className="code-button" onClick={onClick}>&lt;Code&gt;</button>;
}

function useCanvasSize(ref: React.RefObject<HTMLCanvasElement | null>) {
  const [size, setSize] = useState({ w: 720, h: 460 });
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(box.width * dpr));
      canvas.height = Math.max(1, Math.floor(box.height * dpr));
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
      setSize({ w: box.width, h: box.height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

function Range({ label, value, min, max, suffix = "", onChange }: { label: string; value: number; min: number; max: number; suffix?: string; onChange: (value: number) => void }) {
  return <label className="range"><span>{label}<b>{value}{suffix}</b></span><input aria-label={label} type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function Maro({ x, y, direction }: { x: number; y: number; direction: Direction }) {
  const row = direction === "N" ? 0 : direction === "E" ? 1 : direction === "S" ? 2 : 3;
  return <span className="maro" style={{ "--x": x, "--y": y, "--row": row } as React.CSSProperties}><i /></span>;
}

function Board({ x, y, direction, goal, trail = [] }: { x: number; y: number; direction: Direction; goal?: [number, number]; trail?: [number, number][] }) {
  return <div className="grid-board" aria-label={`Maro at column ${x + 1}, row ${y + 1}`}>
    {Array.from({ length: 25 }, (_, index) => {
      const cellX = index % 5, cellY = Math.floor(index / 5);
      const isGoal = goal?.[0] === cellX && goal?.[1] === cellY;
      const isTrail = trail.some(([tx, ty]) => tx === cellX && ty === cellY);
      return <span key={index} className={`tile ${isGoal ? "goal" : ""} ${isTrail ? "trail" : ""}`}>{isGoal ? "✦" : ""}</span>;
    })}
    <Maro x={x} y={y} direction={direction} />
  </div>;
}

function turn(direction: Direction, amount: -1 | 1): Direction {
  const order: Direction[] = ["N", "E", "S", "W"];
  return order[(order.indexOf(direction) + amount + 4) % 4];
}

function runMove(state: { x: number; y: number; direction: Direction }, command: MoveCommand) {
  if (command === "LEFT") return { ...state, direction: turn(state.direction, -1) };
  if (command === "RIGHT") return { ...state, direction: turn(state.direction, 1) };
  const delta = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }[state.direction];
  return { ...state, x: Math.max(0, Math.min(4, state.x + delta[0])), y: Math.max(0, Math.min(4, state.y + delta[1])) };
}

function SceneFrame({ kicker, title, copy, children }: { kicker: string; title: string; copy: string; children: ReactNode }) {
  return <section className="scene-frame"><header className="scene-heading"><div><span>{kicker}</span><h1>{title}</h1></div><p>{copy}</p></header>{children}</section>;
}

function PatternScene() {
  const ref = useRef<HTMLCanvasElement>(null); const { w, h } = useCanvasSize(ref);
  const [repeat, setRepeat] = useState(24), [angle, setAngle] = useState(22), [length, setLength] = useState(70), [shape, setShape] = useState<"line" | "circle" | "triangle">("line");
  const [shown, setShown] = useState(repeat), [showCode, setShowCode] = useState(false);
  useEffect(() => setShown(repeat), [repeat, angle, length, shape]);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2, h / 2); for (let i = 0; i < shown; i += 1) { ctx.save(); ctx.rotate(i * angle * Math.PI / 180); ctx.translate(35 + i * 2.2, 0); ctx.strokeStyle = COLORS[i % COLORS.length]; ctx.lineWidth = 4; if (shape === "line") { ctx.beginPath(); ctx.moveTo(-length / 2, 0); ctx.lineTo(length / 2, 0); ctx.stroke(); } else if (shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, length / 3, 0, Math.PI * 2); ctx.stroke(); } else { ctx.beginPath(); ctx.moveTo(0, -length / 2); ctx.lineTo(length / 2, length / 2); ctx.lineTo(-length / 2, length / 2); ctx.closePath(); ctx.stroke(); } ctx.restore(); } ctx.restore(); }, [w, h, repeat, angle, length, shape, shown]);
  const animate = () => { setShown(0); let value = 0; const id = window.setInterval(() => { value += 1; setShown(value); if (value >= repeat) window.clearInterval(id); }, 90); };
  const lines = [`REPEAT ${repeat} TIMES`, `  DRAW_${shape.toUpperCase()}(${length})`, `  ROTATE(${angle}°)`, "END REPEAT"];
  return <SceneFrame kicker="SCENE 01 · PATTERN STUDIO" title="Turn repeated movement into a drawing." copy="Choose a prepared motif and compose a pattern with repeat, rotate, and size.">
    <canvas ref={ref} className="art-canvas" /><div className="pattern-controls"><div className="shape-picker">{(["line", "circle", "triangle"] as const).map((item) => <button className={shape === item ? "active" : ""} key={item} onClick={() => setShape(item)}>{item.toUpperCase()}</button>)}</div><Range label="REPEAT" value={repeat} min={6} max={40} onChange={setRepeat} /><Range label="ROTATE" value={angle} min={5} max={90} suffix="°" onChange={setAngle} /><Range label="SIZE" value={length} min={30} max={120} onChange={setLength} /><button className="primary wide" onClick={animate}>▶ DRAW PATTERN</button></div><div className="stage-actions"><CodeButton onClick={() => setShowCode(true)} /></div>{showCode && <CodeModal lines={lines} onClose={() => setShowCode(false)} />}
  </SceneFrame>;
}

function WaveStage() {
  const ref = useRef<HTMLCanvasElement>(null), { w, h } = useCanvasSize(ref); const [height, setHeight] = useState(78), [frequency, setFrequency] = useState(2), [orbit, setOrbit] = useState(false), [paused, setPaused] = useState(false), [showCode, setShowCode] = useState(false);
  useEffect(() => { let raf = 0; const start = performance.now(); const draw = (now: number) => { const ctx = ref.current?.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = "rgba(20,20,20,.12)"; ctx.lineWidth = 1; for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } const t = paused ? .72 : ((now - start) / 4600) % 1; const max = Math.floor(t * 360); let px = w / 2, py = h / 2; ctx.strokeStyle = COLORS[2]; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); for (let i = 0; i <= max; i += 1) { const a = i / 360 * Math.PI * 2; if (orbit) { px = w / 2 + Math.cos(a) * height; py = h / 2 + Math.sin(a * frequency) * height; } else { px = 30 + i / 360 * (w - 60); py = h / 2 + Math.sin(a * frequency) * height; } i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.fillStyle = COLORS[1]; ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill(); raf = requestAnimationFrame(draw); }; raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf); }, [w, h, height, frequency, orbit, paused]);
  const lines = orbit ? ["REPEAT every frame", "  angle = TIME()", `  x = center_x + COS(angle) × ${height}`, `  y = center_y + SIN(angle × ${frequency}) × ${height}`, "  DRAW_POINT(x, y)"] : ["REPEAT every frame", "  progress = TIME()", "  x = progress × canvas_width", `  y = center_y + SIN(progress × ${frequency}) × ${height}`, "  DRAW_POINT(x, y)"];
  return <ArtFrame kicker="DISCOVER" title="A point learns to dance." copy="Predict the path, change one relationship, then watch motion leave a trace."><canvas ref={ref} className="art-canvas" /><div className="pattern-controls"><div className="shape-picker"><button className={!orbit ? "active" : ""} onClick={() => setOrbit(false)}>WAVE</button><button className={orbit ? "active" : ""} onClick={() => setOrbit(true)}>ORBIT</button></div><Range label="HEIGHT" value={height} min={30} max={130} onChange={setHeight} /><Range label="FREQUENCY" value={frequency} min={1} max={7} onChange={setFrequency} /><button className="wide" onClick={() => setPaused(!paused)}>{paused ? "▶ PLAY" : "Ⅱ PAUSE"}</button></div><div className="stage-actions"><CodeButton onClick={() => setShowCode(true)} /></div>{showCode && <CodeModal lines={lines} operations={["TIME():\n  progress = elapsed_time / duration", "SIN(angle):\n  RETURN vertical wave value from -1 to 1", "COS(angle):\n  RETURN horizontal orbit value from -1 to 1", "DRAW_POINT(x, y):\n  position = (x, y)\n  ADD point to visible trail"]} onClose={() => setShowCode(false)} />}</ArtFrame>;
}

function BloomStage() {
  const ref = useRef<HTMLCanvasElement>(null), { w, h } = useCanvasSize(ref); const [petals, setPetals] = useState(5), [rotation, setRotation] = useState(0), [colour, setColour] = useState(2), [showCode, setShowCode] = useState(false);
  useEffect(() => { let raf = 0; const start = performance.now(); const draw = (now: number) => { const ctx = ref.current?.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h); const progress = Math.min(1, ((now - start) % 4200) / 2700); ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(rotation * Math.PI / 180); ctx.beginPath(); const count = Math.floor(720 * progress); for (let i = 0; i <= count; i += 1) { const a = i / 720 * Math.PI * 4, r = Math.cos(petals * a) * Math.min(w, h) * .34; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.strokeStyle = COLORS[colour]; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); raf = requestAnimationFrame(draw); }; raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf); }, [w, h, petals, rotation, colour]);
  const lines = ["FOR angle FROM 0° TO 720°", `  radius = COS(${petals} × angle)`, "  x = COS(angle) × radius", "  y = SIN(angle) × radius", `  ROTATE(${rotation}°)`, "  DRAW_POINT(x, y)"];
  return <ArtFrame kicker="EXPERIMENT" title="Make one rule bloom." copy="There is no correct flower. Change one number and discover a new visual species."><div className="canvas-wrap"><canvas ref={ref} className="art-canvas" /><code className="equation">r = cos(<b>{petals}</b> × angle)</code></div><div className="pattern-controls"><Range label="PETAL RULE" value={petals} min={2} max={13} onChange={setPetals} /><Range label="ROTATION" value={rotation} min={0} max={90} suffix="°" onChange={setRotation} /><button className="wide" onClick={() => setColour((colour + 1) % COLORS.length)}>CHANGE COLOUR</button></div><div className="stage-actions"><CodeButton onClick={() => setShowCode(true)} /></div>{showCode && <CodeModal lines={lines} operations={["COS(value):\n  RETURN a repeating value from -1 to 1", "SIN(value):\n  RETURN a second repeating value offset from COS", "ROTATE(angle):\n  canvas_heading = canvas_heading + angle", "DRAW_POINT(x, y):\n  ADD the next point to the flower path"]} onClose={() => setShowCode(false)} />}</ArtFrame>;
}

function pseudocode(repeat: number, angle: number, move: number, grow: number, mirror: boolean, colour = true) {
  return [`REPEAT ${repeat} TIMES`, "  DRAW MY MARK", `  ROTATE ${angle}°`, ...(move ? [`  MOVE ${move > 0 ? "OUTWARD" : "INWARD"} ${Math.abs(move)}`] : []), ...(grow > 0 ? [`  GROW LARGER ${grow}%`] : grow < 0 ? [`  SHRINK ${Math.abs(grow)}%`] : []), ...(mirror ? ["  MIRROR EVERY SECOND COPY"] : []), ...(colour ? ["  CHANGE COLOUR"] : []), "END REPEAT"];
}

function CodeModal({ lines, operations = ART_OPERATIONS, active, onClose }: { lines: string[]; operations?: string[]; active?: number; onClose: () => void }) {
  const allCode = [...lines, "", "HOW THE FUNCTIONS WORK", ...operations].join("\n");
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="code-modal" role="dialog" aria-modal="true" aria-labelledby="code-title" onMouseDown={(event) => event.stopPropagation()}><header><div><span>LIVE PSEUDOCODE</span><h2 id="code-title">MY ALGORITHM</h2></div><button aria-label="Close code" onClick={onClose}>×</button></header><div className="code-scroll"><section><h3>ORDER OF OPERATIONS</h3><p>The computer reads these instructions from top to bottom.</p><pre>{lines.map((line, i) => <code className={i === active ? "active" : ""} key={`${line}-${i}`}>{line}</code>)}</pre></section><section className="operation-code"><h3>HOW THE FUNCTIONS WORK</h3><p>These definitions show what each instruction changes behind the scenes.</p><pre>{operations.map((operation) => <code key={operation}>{operation}{"\n"}</code>)}</pre></section></div><div className="action-row"><button onClick={() => navigator.clipboard?.writeText(allCode)}>COPY CODE</button><button className="primary" onClick={onClose}>CLOSE</button></div></section></div>;
}

function MultiplyStage() {
  const ref = useRef<HTMLCanvasElement>(null), { w, h } = useCanvasSize(ref); const [repeat, setRepeat] = useState(16), [angle, setAngle] = useState(24), [move, setMove] = useState(3), [grow, setGrow] = useState(2), [shown, setShown] = useState(16), [showCode, setShowCode] = useState(false);
  const lines = pseudocode(repeat, angle, move, grow, false);
  useEffect(() => { const ctx = ref.current?.getContext("2d"); if (!ctx) return; ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h); ctx.save(); ctx.translate(w / 2, h / 2); for (let i = 0; i < shown; i += 1) { ctx.save(); ctx.rotate(i * angle * Math.PI / 180); ctx.translate(35 + i * move, 0); ctx.scale(1 + i * grow / 100, 1 + i * grow / 100); ctx.strokeStyle = COLORS[i % COLORS.length]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(30, 0); ctx.lineTo(-30, 18); ctx.stroke(); ctx.restore(); } ctx.restore(); }, [w, h, repeat, angle, move, grow, shown]);
  const run = () => { setShown(0); let count = 0; const id = window.setInterval(() => { count += 1; setShown(count); if (count >= repeat) window.clearInterval(id); }, 120); };
  return <ArtFrame kicker="UNDERSTAND" title="One mark. Many moments." copy="The active instruction lights up while the same small actions build a complex pattern."><canvas ref={ref} className="art-canvas" /><div className="algorithm-strip"><b>REPEAT {repeat}</b><span>DRAW MARK</span><span>ROTATE {angle}°</span><span>MOVE {move}</span><span>{grow >= 0 ? "GROW" : "SHRINK"} {Math.abs(grow)}%</span></div><div className="pattern-controls"><Range label="REPEAT" value={repeat} min={6} max={32} onChange={(value) => { setRepeat(value); setShown(value); }} /><Range label="ROTATE" value={angle} min={5} max={90} suffix="°" onChange={setAngle} /><Range label="MOVE" value={move} min={-6} max={10} onChange={setMove} /><Range label="GROW / SHRINK" value={grow} min={-4} max={6} suffix="%" onChange={setGrow} /></div><div className="stage-actions"><CodeButton onClick={() => setShowCode(true)} /><button className="primary" onClick={run}>▶ RUN PATTERN</button></div>{showCode && <CodeModal lines={lines} active={shown < repeat ? 1 + (shown % Math.max(1, lines.length - 2)) : undefined} onClose={() => setShowCode(false)} />}</ArtFrame>;
}

type ArtSettings = { repeat: number; angle: number; move: number; grow: number; mirror: boolean; colour: number };

function drawSeedArt(ctx: CanvasRenderingContext2D, w: number, h: number, paths: Point[][], settings: ArtSettings, count: number) {
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#fffaf0"; ctx.fillRect(0, 0, w, h);
  if (paths.flat().length < 2) { ctx.fillStyle = "rgba(20,20,20,.28)"; ctx.font = "800 15px Arial"; ctx.textAlign = "center"; ctx.fillText("YOUR MARK WILL GROW HERE", w / 2, h / 2); return; }
  const seedW = Math.min(130, w * .3), seedH = seedW;
  for (let i = 0; i < count; i += 1) { const scale = Math.max(.18, 1 + i * settings.grow / 100); ctx.save(); ctx.translate(w / 2, h / 2); ctx.rotate(i * settings.angle * Math.PI / 180); ctx.translate(i * settings.move, 0); ctx.scale(scale * (settings.mirror && i % 2 ? -1 : 1), scale); ctx.translate(-seedW / 2, -seedH / 2); ctx.strokeStyle = COLORS[(i + settings.colour) % COLORS.length]; ctx.lineWidth = Math.max(1.5, 4 / scale); ctx.lineCap = "round"; ctx.lineJoin = "round"; paths.forEach((path) => { ctx.beginPath(); path.forEach((p, j) => j ? ctx.lineTo(p.x * seedW, p.y * seedH) : ctx.moveTo(p.x * seedW, p.y * seedH)); ctx.stroke(); }); ctx.restore(); }
}

function CreateStage() {
  const seedRef = useRef<HTMLCanvasElement>(null), artRef = useRef<HTMLCanvasElement>(null); useCanvasSize(seedRef); const { w, h } = useCanvasSize(artRef);
  const [paths, setPaths] = useState<Point[][]>([]), drawing = useRef(false), activePath = useRef<Point[]>([]);
  const [settings, setSettings] = useState<ArtSettings>({ repeat: 18, angle: 20, move: 4, grow: 1, mirror: false, colour: 0 }); const [progress, setProgress] = useState(0), [running, setRunning] = useState(false), [showCode, setShowCode] = useState(false), [before, setBefore] = useState<string | null>(null), [after, setAfter] = useState<string | null>(null), [title, setTitle] = useState(""), [message, setMessage] = useState("Draw a small mark first.");
  const redrawSeed = useCallback(() => { const canvas = seedRef.current, ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return; const box = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, box.width, box.height); ctx.fillStyle = "#fffdf6"; ctx.fillRect(0, 0, box.width, box.height); ctx.strokeStyle = "#151515"; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round"; paths.forEach((path) => { ctx.beginPath(); path.forEach((p, i) => i ? ctx.lineTo(p.x * box.width, p.y * box.height) : ctx.moveTo(p.x * box.width, p.y * box.height)); ctx.stroke(); }); }, [paths]);
  useEffect(redrawSeed, [redrawSeed]);
  useEffect(() => { const ctx = artRef.current?.getContext("2d"); if (ctx) drawSeedArt(ctx, w, h, paths, settings, progress); }, [w, h, paths, settings, progress]);
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setProgress((old) => { if (old >= settings.repeat) { setRunning(false); window.clearInterval(id); window.setTimeout(() => { const image = artRef.current?.toDataURL("image/png") || null; if (!before) { setBefore(image); setMessage("BEFORE saved. Change one instruction, then run again."); } else { setAfter(image); setMessage("AFTER saved. Compare the two and keep what you prefer."); } }, 50); return old; } return old + 1; }), 115); return () => window.clearInterval(id); }, [running, settings.repeat, before]);
  const pointer = (event: PointerEvent<HTMLCanvasElement>) => { const canvas = seedRef.current; if (!canvas) return; const box = canvas.getBoundingClientRect(); const point = { x: Math.max(0, Math.min(1, (event.clientX - box.left) / box.width)), y: Math.max(0, Math.min(1, (event.clientY - box.top) / box.height)) }; if (event.type === "pointerdown") { drawing.current = true; activePath.current = [point]; setPaths((old) => [...old, [point]]); canvas.setPointerCapture(event.pointerId); setMessage("Good—now choose how the computer should transform it."); } else if (event.type === "pointermove" && drawing.current) { activePath.current.push(point); setPaths((old) => [...old.slice(0, -1), [...activePath.current]]); } else if (event.type === "pointerup" || event.type === "pointercancel") drawing.current = false; };
  const run = () => { if (paths.flat().length < 2 || running) return; setProgress(0); setRunning(true); setMessage(before ? "Making AFTER…" : "Making BEFORE…"); };
  const update = (key: keyof ArtSettings, value: number | boolean) => setSettings((old) => ({ ...old, [key]: value }));
  const lines = pseudocode(settings.repeat, settings.angle, settings.move, settings.grow, settings.mirror);
  const exportArt = () => { const canvas = artRef.current; if (!canvas) return; const link = document.createElement("a"); link.download = `${title.trim() || "my-algorithm-art"}.png`; link.href = canvas.toDataURL("image/png"); link.click(); };
  return <ArtFrame kicker="EXPRESS" title="Your mark. Your instructions." copy="Draw personal material, compose its behaviour, observe what emerges, then revise intentionally."><div className="create-layout"><section className="seed-panel"><span className="step-dot">A</span><h3>DRAW YOUR SEED</h3><p>An initial, leaf, face, bolt, or squiggle.</p><canvas ref={seedRef} className="seed-canvas" onPointerDown={pointer} onPointerMove={pointer} onPointerUp={pointer} onPointerCancel={pointer} /><div className="mini-actions"><button onClick={() => setPaths((old) => old.slice(0, -1))}>UNDO STROKE</button><button onClick={() => { setPaths([]); setBefore(null); setAfter(null); setProgress(0); }}>CLEAR SEED</button></div></section><section className="art-panel"><canvas ref={artRef} className="art-canvas create-canvas" /><div className="run-status"><span>{running ? `COPY ${progress} / ${settings.repeat}` : message}</span><button className="primary" onClick={run} disabled={paths.flat().length < 2 || running}>{running ? "MAKING…" : "▶ RUN ART"}</button></div></section></div><div className="algorithm-builder"><header><span className="step-dot">B</span><b>BUILD THE BEHAVIOUR</b><small>Tap or drag a value. The code stays readable.</small></header><Range label="REPEAT" value={settings.repeat} min={4} max={36} onChange={(v) => update("repeat", v)} /><Range label="ROTATE" value={settings.angle} min={-120} max={120} suffix="°" onChange={(v) => update("angle", v)} /><Range label="MOVE" value={settings.move} min={-10} max={12} onChange={(v) => update("move", v)} /><Range label="GROW / SHRINK" value={settings.grow} min={-4} max={6} suffix="%" onChange={(v) => update("grow", v)} /><button className={settings.mirror ? "toggle on" : "toggle"} onClick={() => update("mirror", !settings.mirror)}>MIRROR<br /><small>{settings.mirror ? "ALTERNATE" : "OFF"}</small></button><button className="toggle colour" onClick={() => update("colour", (settings.colour + 1) % COLORS.length)}>COLOUR<br /><small>SET {settings.colour + 1}</small></button></div><div className="stage-actions"><CodeButton onClick={() => setShowCode(true)} /><button onClick={exportArt} disabled={!progress}>↓ EXPORT IMAGE</button><label className="title-field"><span>TITLE</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Orbiting Home" /></label></div>{before && <div className="comparison"><header><span className="step-dot">C</span><b>COMPARE & REVISE</b><small>Changing your mind is part of making.</small></header><figure><figcaption>BEFORE</figcaption><img src={before} alt="Artwork before revision" /></figure><figure className={!after ? "waiting" : ""}><figcaption>AFTER</figcaption>{after ? <img src={after} alt="Artwork after revision" /> : <p>Change one instruction and run again.</p>}</figure></div>}{showCode && <CodeModal lines={lines} active={running ? 1 + (progress % Math.max(1, lines.length - 2)) : undefined} onClose={() => setShowCode(false)} />}</ArtFrame>;
}

function ArtFrame({ kicker, title, copy, children }: { kicker: string; title: string; copy: string; children: ReactNode }) { return <div className="art-stage"><header className="stage-heading"><div><span>{kicker}</span><h2>{title}</h2></div><p>{copy}</p></header>{children}</div>; }

function AlgorithmArtScene() {
  const [stage, setStage] = useState<ArtStage>("wave"); const current = ART_STAGES.findIndex((item) => item.id === stage);
  return <SceneFrame kicker="SCENE 02 · CREATIVE LAB" title="Algorithm Art Studio" copy="Give instructions to light, shape, colour, and time."><nav className="art-nav" aria-label="Algorithm Art stages">{ART_STAGES.map((item, index) => <button className={stage === item.id ? "active" : ""} key={item.id} onClick={() => setStage(item.id)}><span>{index + 1}</span><b>{item.label}</b><small>{item.idea}</small></button>)}</nav>{stage === "wave" && <WaveStage />}{stage === "bloom" && <BloomStage />}{stage === "multiply" && <MultiplyStage />}{stage === "create" && <CreateStage />}<div className="internal-nav"><button disabled={current === 0} onClick={() => setStage(ART_STAGES[current - 1].id)}>← PREVIOUS STAGE</button><span>{current + 1} / 4</span><button disabled={current === ART_STAGES.length - 1} onClick={() => setStage(ART_STAGES[current + 1].id)}>NEXT STAGE →</button></div></SceneFrame>;
}

export default function Home() {
  const [scene, setScene] = useState<CourseScene>(1); const index = useMemo(() => COURSE.findIndex((item) => item.n === scene), [scene]);
  return <main><div className="bauhaus-bg" /><header className="topbar"><button className="brand" onClick={() => setScene(1)}><span><i /><i /><i /></span><b>MARO&apos;S WORKSHOP</b></button><div><span>CREATIVE CODING</span><strong>SCENE {String(scene).padStart(2, "0")} / 02</strong></div></header><nav className="course-nav" aria-label="Workshop scenes">{COURSE.map((item) => <button key={item.n} className={scene === item.n ? "active" : ""} onClick={() => setScene(item.n)}><span>{String(item.n).padStart(2, "0")}</span><b>{item.name}</b><small>{item.idea}</small></button>)}</nav><div className="content">{scene === 1 && <PatternScene />}{scene === 2 && <AlgorithmArtScene />}</div><footer><button disabled={index === 0} onClick={() => setScene(COURSE[index - 1].n)}>← PREVIOUS SCENE</button><div><i /><i /></div><button disabled={index === COURSE.length - 1} onClick={() => setScene(COURSE[index + 1].n)}>NEXT SCENE →</button></footer></main>;
}
