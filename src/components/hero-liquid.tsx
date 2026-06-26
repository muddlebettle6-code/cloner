"use client";

import { useEffect, useRef, useState } from "react";
import { Img } from "@/components/img";
import { cn } from "@/lib/utils";

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_res;
uniform vec2 u_img;
uniform vec2 u_mouse;      // normalized, y from top
uniform float u_time;
uniform float u_intensity; // cursor presence 0..1

vec2 coverUV(vec2 uv){
  float ca = u_res.x / u_res.y;
  float ia = u_img.x / u_img.y;
  vec2 s = ca > ia ? vec2(1.0, ia / ca) : vec2(ca / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main(){
  vec2 uv = v_uv;
  vec2 m = vec2(u_mouse.x, 1.0 - u_mouse.y);
  vec2 toM = uv - m;
  float dist = length(toM);
  vec2 dir = dist > 0.0001 ? toM / dist : vec2(0.0);

  // localized liquify near the cursor (tight radius)
  float fall = smoothstep(0.24, 0.0, dist);
  float ripple = sin(dist * 48.0 - u_time * 4.0) * 0.014;
  vec2 disp = dir * ripple * fall * u_intensity;

  // subtle ambient drift so it breathes at rest
  disp += vec2(
    sin(uv.y * 6.0 + u_time * 0.42),
    cos(uv.x * 6.0 + u_time * 0.37)
  ) * 0.0015;

  vec2 cuv = clamp(coverUV(uv + disp), 0.0, 1.0);
  vec3 col = texture2D(u_tex, cuv).rgb;
  col += vec3(0.04) * fall * u_intensity; // soft light near cursor
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

/**
 * Liquid hero: a WebGL fragment shader that liquifies the marble in a tight area
 * around the cursor (ripple displacement) over a gentle ambient drift. Falls
 * back to the static image when WebGL is unavailable or reduced motion is set.
 */
export function HeroLiquid({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false }) as WebGLRenderingContext | null;
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_res");
    const uImg = gl.getUniformLocation(prog, "u_img");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uInt = gl.getUniformLocation(prog, "u_intensity");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([10, 20, 36, 255]));

    let imgW = 1;
    let imgH = 1;
    const image = new Image();
    image.onload = () => {
      imgW = image.naturalWidth;
      imgH = image.naturalHeight;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      setReady(true);
    };
    image.src = src;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: 0.5, y: 0.4 };
    const sm = { x: 0.5, y: 0.4 };
    let targetInt = 0;
    let curInt = 0;
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
      targetInt = e.clientY >= r.top && e.clientY <= r.bottom ? 1 : 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const start = performance.now();
    let raf = 0;
    const render = (t: number) => {
      sm.x += (mouse.x - sm.x) * 0.1;
      sm.y += (mouse.y - sm.y) * 0.1;
      curInt += (targetInt - curInt) * 0.06;

      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uImg, imgW, imgH);
      gl.uniform2f(uMouse, sm.x, sm.y);
      gl.uniform1f(uTime, (t - start) / 1000);
      gl.uniform1f(uInt, curInt);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
      gl.deleteTexture(tex);
    };
  }, [src]);

  return (
    <div className="absolute inset-0">
      <Img src={src} alt="" priority className="absolute inset-0 h-full w-full" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
