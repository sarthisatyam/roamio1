import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const TEAL = "#04a5c2";
const CORAL = "#d94f6e";

export const SceneAlone = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // slow zoom in
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.15]);
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const lineS = spring({ frame: frame - 25, fps, config: { damping: 18 } });
  const lineOp = interpolate(lineS, [0, 1], [0, 1]);
  const lineY = interpolate(lineS, [0, 1], [20, 0]);

  // Roamio app reveal at the end
  const appS = spring({ frame: frame - 110, fps, config: { damping: 14 } });
  const appScale = interpolate(appS, [0, 1], [0.5, 1]);
  const appOp = interpolate(appS, [0, 1], [0, 1]);

  // Search text typing
  const searchText = "solo travel india";
  const charsShown = Math.max(0, Math.min(searchText.length, Math.floor((frame - 70) / 2)));

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, opacity: fadeIn }}>
        <Img src={staticFile("images/ad/scene5-alone.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.8)" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.85) 100%)" }} />

      {/* Top quiet caption */}
      <div style={{
        position: "absolute", top: 100, left: 40, right: 40, textAlign: "center",
        opacity: lineOp, transform: `translateY(${lineY}px)`,
      }}>
        <div style={{ fontSize: 32, fontWeight: 600, color: "white", textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>
          Sab cancel… ab kya?
        </div>
      </div>

      {/* Phone search reveal */}
      {frame > 60 && (
        <div style={{
          position: "absolute", left: "50%", top: "55%",
          transform: "translate(-50%, -50%)",
          background: "white", borderRadius: 30, padding: "16px 24px",
          width: 520, display: "flex", alignItems: "center", gap: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ fontSize: 28 }}>🔍</div>
          <div style={{ fontSize: 26, color: "#333", fontWeight: 600 }}>
            {searchText.slice(0, charsShown)}
            {charsShown < searchText.length && <span style={{ opacity: Math.sin(frame * 0.3) * 0.5 + 0.5 }}>|</span>}
          </div>
        </div>
      )}

      {/* Roamio app card pops up */}
      {frame > 105 && (
        <div style={{
          position: "absolute", left: "50%", bottom: 120,
          transform: `translateX(-50%) scale(${appScale})`, opacity: appOp,
          background: "white", borderRadius: 24, padding: 20, width: 520,
          display: "flex", alignItems: "center", gap: 18,
          boxShadow: "0 20px 60px rgba(255,255,255,0.2), 0 0 0 3px " + TEAL,
        }}>
          <div style={{ width: 80, height: 80, borderRadius: 18, overflow: "hidden", flexShrink: 0 }}>
            <Img src={staticFile("images/roamio-logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#222" }}>Roamio</div>
            <div style={{ fontSize: 18, color: TEAL, fontWeight: 600 }}>Travel Solo, Not Alone ✨</div>
            <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>★★★★★ · 50K+ travelers</div>
          </div>
          <div style={{ background: CORAL, color: "white", padding: "10px 18px", borderRadius: 20, fontSize: 16, fontWeight: 700 }}>OPEN</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
