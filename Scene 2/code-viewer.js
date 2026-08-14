const codeButton = document.createElement("button");
codeButton.type = "button";
codeButton.className = "code-viewer-button";
codeButton.textContent = "<Code>";
codeButton.setAttribute("aria-haspopup", "dialog");
document.body.append(codeButton);

const defaultOperations = [
  "MOVE():\n  next = position + direction\n  IF next is inside board:\n    position = next",
  "TURN_LEFT():\n  direction = direction - 90°",
  "TURN_RIGHT():\n  direction = direction + 90°",
  "REPEAT(count, steps):\n  FOR count TIMES:\n    RUN steps in order",
];

function openCodeViewer() {
  const info = window.getSceneCode?.() || {};
  const overlay = document.createElement("div");
  overlay.className = "code-viewer-overlay";
  overlay.innerHTML = `<section class="code-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="code-viewer-title">
    <header><div><span>LIVE PSEUDOCODE</span><h2 id="code-viewer-title"></h2></div><button type="button" aria-label="Close code">×</button></header>
    <div class="code-viewer-scroll">
      <section><h3>ORDER OF OPERATIONS</h3><p>The computer reads these instructions from top to bottom.</p><pre class="code-viewer-sequence"></pre></section>
      <section class="code-viewer-definitions"><h3>HOW THE FUNCTIONS WORK</h3><p>Scroll here to see what each instruction changes behind the scenes.</p><pre></pre></section>
    </div>
  </section>`;
  overlay.querySelector("h2").textContent = info.title || "WHAT THE GAME IS DOING";
  overlay.querySelector(".code-viewer-sequence").textContent = (info.steps?.length ? info.steps : ["// No instructions yet"]).join("\n");
  overlay.querySelector(".code-viewer-definitions pre").textContent = (info.operations?.length ? info.operations : defaultOperations).join("\n\n");
  const close = () => { overlay.remove(); document.body.classList.remove("code-viewer-open"); codeButton.focus(); };
  overlay.addEventListener("mousedown", (event) => { if (event.target === overlay) close(); });
  overlay.querySelector("header button").addEventListener("click", close);
  overlay.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  document.body.append(overlay);
  document.body.classList.add("code-viewer-open");
  overlay.querySelector("header button").focus();
}

codeButton.addEventListener("click", openCodeViewer);
