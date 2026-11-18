// Underwater background: crisp, anime-style caustics seen from below, plus rising bubbles.
// One WebGL quad + one 2D canvas. Pauses when hidden, off screen, paused by the viewer, or under reduced motion.

const FS = `precision highp float;uniform vec2 r;uniform float t;uniform vec3 cDeep,cMid,cHi;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
float cell(vec2 p){vec2 i=floor(p),f=fract(p);float a=8.,b=8.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 o=h2(i+g);o=.5+.42*sin(t*.5+6.2831*o);
    float d=length(g+o-f);if(d<a){b=a;a=d;}else if(d<b)b=d;}return b-a;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=gl_FragCoord.xy/r.y;float aa=8./r.y;
  float top=smoothstep(.40,.95,uv.y);
  vec2 q=vec2(p.x*4.2,(p.y-1.)*8.+p.x*.6);q+=.16*sin(q.yx*1.3+t*.7);
  float e=cell(q);float line=1.-smoothstep(.05-aa,.05+aa,e);float band=1.-smoothstep(.20-aa,.20+aa,e);
  vec2 s=vec2(.7*r.x/r.y,1.4);vec2 d=p-s;float ang=atan(d.x,-d.y);
  float w=.5+.5*sin(ang*24.+sin(ang*7.+t*.3)*2.+t*.22);
  float ray=smoothstep(.72,.78,w)*smoothstep(1.5,.15,length(d));
  vec3 col=mix(cDeep,cMid,smoothstep(0.,.65,uv.y));col=mix(col,cHi,smoothstep(.55,1.,uv.y));
  col+=ray*vec3(.45,.8,1.)*.16;col=mix(col,col+vec3(.18,.38,.55),band*top*.55);
  col=mix(col,vec3(.86,.98,1.),line*top*(.75+.25*sin(t*2.+q.x*1.7)));
  gl_FragColor=vec4(col,1.);}`;
const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const rgb = (hex) => { const h = hex.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };

/**
 * @param {object} o
 * @param {HTMLCanvasElement} o.canvas     WebGL water
 * @param {HTMLCanvasElement} [o.bubbles]  2D bubbles overlay
 * @param {HTMLCanvasElement} [o.tint]     optional low-res copy (for multiply over a white layer)
 * @param {HTMLButtonElement} [o.pauseButton]  toggles; aria-pressed reflects state; state remembered
 * @param {{deep:string,mid:string,hi:string}} [o.colors]
 * @param {{pause:string,play:string}} [o.labels]
 */
export function createWater(o) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = o.canvas, gl = cv.getContext('webgl', { antialias: true });
  const bctx = o.bubbles?.getContext('2d'), tctx = o.tint?.getContext('2d');
  const colors = o.colors || { deep: '#030D57', mid: '#0A4DE0', hi: '#1A8CFF' };
  const labels = o.labels || { pause: 'Pause water', play: 'Play water' };
  let draw = () => {};
  if (gl) {
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n) => gl.getUniformLocation(pr, n);
    gl.uniform3fv(u('cDeep'), rgb(colors.deep)); gl.uniform3fv(u('cMid'), rgb(colors.mid)); gl.uniform3fv(u('cHi'), rgb(colors.hi));
    const ur = u('r'), ut = u('t');
    draw = (t) => {
      gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(ur, cv.width, cv.height); gl.uniform1f(ut, t); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (tctx) tctx.drawImage(cv, 0, 0, o.tint.width, o.tint.height);
    };
  }
  let W = 0, H = 0, bub = [];
  const spawn = (any) => ({ x: Math.random() * W, y: any ? Math.random() * H : H + 20, r: 2 + Math.random() * Math.random() * 11, v: 18 + Math.random() * 40, ph: Math.random() * 6.28 });
  const size = () => {
    const box = cv.getBoundingClientRect(); W = box.width; H = box.height;
    const sd = Math.min(1.5, devicePixelRatio || 1), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * sd); cv.height = Math.round(H * sd);
    if (o.tint) { o.tint.width = Math.round(W * 0.5); o.tint.height = Math.round(H * 0.5); }
    if (o.bubbles) { o.bubbles.width = Math.round(W * dpr); o.bubbles.height = Math.round(H * dpr); bctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    bub = Array.from({ length: Math.round(W / 40) }, () => spawn(true));
    draw(3);
  };
  addEventListener('resize', size); size();

  let paused = false, onScreen = true, last = performance.now(), raf = 0;
  try { paused = localStorage.getItem('ds-water-paused') === '1'; } catch { /* storage blocked */ }
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(cv);
  const PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5 19 12 7 19.5z" fill="currentColor"/></svg>';
  const setPaused = (p) => {
    paused = p;
    try { localStorage.setItem('ds-water-paused', p ? '1' : '0'); } catch { /* storage blocked */ }
    const b = o.pauseButton; if (!b) return;
    b.setAttribute('aria-pressed', String(p));
    b.innerHTML = p ? PLAY : PAUSE;                       // static icon markup
    const s = document.createElement('span'); s.textContent = p ? labels.play : labels.pause; b.append(s);
  };
  if (o.pauseButton) { o.pauseButton.addEventListener('click', () => setPaused(!paused)); if (reduce) o.pauseButton.hidden = true; }
  setPaused(paused);

  const frame = (t) => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!document.hidden && onScreen && !paused) {
      draw(t / 1000);
      if (bctx) {
        bctx.clearRect(0, 0, W, H);
        for (const b of bub) {
          b.y -= b.v * dt * (1 + b.r / 14); b.ph += dt * 2; const x = b.x + Math.sin(b.ph) * b.r * 0.8;
          bctx.beginPath(); bctx.arc(x, b.y, b.r, 0, 6.283); bctx.strokeStyle = 'rgba(170,240,255,.8)'; bctx.lineWidth = 1.3; bctx.stroke();
          if (b.r > 5) { bctx.beginPath(); bctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.22, 0, 6.283); bctx.fillStyle = 'rgba(255,255,255,.9)'; bctx.fill(); }
          if (b.y < -20) Object.assign(b, spawn(false));
        }
      }
    }
    raf = requestAnimationFrame(frame);
  };
  if (!reduce) raf = requestAnimationFrame(frame);
  return { setPaused, get paused() { return paused; }, destroy() { cancelAnimationFrame(raf); removeEventListener('resize', size); } };
}
