import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

export const SceneTagline = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const zoom = interpolate(frame, [0, durationInFrames], [1.05, 1.18]);
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  const tagS = spring({ frame: frame - 15, fps, config: { damping: 12 } });
  const tagScale = interpolate(tagS, [0, 1], [0.6, 1]);
  const tagOp = interpolate(tagS, [0, 1], [0, 1]);

  const sub1S = spring({ frame: frame - 50, fps, config: { damping: 14 } });
  const sub1Op = interpolate(sub1S, [0, 1], [0, 1]);
  const sub1Y = interpolate(sub1S, [0, 1], [20, 0]);

  const logoS = spring({ frame: frame - 90, fps, config: { damping: 14 } });
  const logoScale = interpolate(logoS, [0, 1], [0, 1]);

  const urlS = spring({ frame: frame - 110, fps, config: { damping: 14 } });
  const urlOp = interpolate(urlS, [0, 1], [0, 1]);
  const urlScale = interpolate(urlS, [0, 1], [0.7, 1]);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, opacity: fadeIn }}>
        <Img src={staticFile("images/ad/scene7-viewpoint.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 50%, rgba(0,0,0,0.85) 100%)" }} />

      {/* Tagline */}
      <div style={{
        position: "absolute", left: 40, right: 40, top: "55%",
        textAlign: "center", opacity: tagOp, transform: `translateY(-50%) scale(${tagScale})`,
      }}>
        <div style={{ fontSize: 70, fontWeight: 800, color: "white", lineHeight: 1.05, letterSpacing: -2, textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
          Plan badle,
        </div>
        <div style={{
          display: "inline-block", marginTop: 10,
          background: "rgba(255,255,255,0.95)", color: TEAL,
          fontSize: 70, fontWeight: 800, lineHeight: 1.05,
          letterSpacing: -2, padding: "4px 28px", borderRadius: 16,
        }}>
          Trip nahi. ✈️
        </div>
      </div>

      {/* Subline */}
      <div style={{
        position: "absolute", left: 40, right: 40, bottom: 380,
        textAlign: "center", opacity: sub1Op, transform: `translateY(${sub1Y}px)`,
        fontSize: 28, color: "white", fontWeight: 500,
      }}>
        Group ho ya solo… travel hai easy with{" "}
        <span style={{ color: TEAL, background: "rgba(255,255,255,0.95)", padding: "2px 12px", borderRadius: 10, fontWeight: 800 }}>Roamio</span>
      </div>

      {/* Logo */}
      <div style={{
        position: "absolute", left: "50%", bottom: 240,
        transform: `translateX(-50%) scale(${logoScale})`,
        width: 110, height: 110, borderRadius: "50%",
        overflow: "hidden", border: "4px solid white",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <Img src={staticFile("images/roamio-logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* URL */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 130,
        textAlign: "center", opacity: urlOp,
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(255,255,255,0.95)", color: TEAL,
          padding: "12px 28px", borderRadius: 14,
          fontSize: 32, fontWeight: 800,
          transform: `scale(${urlScale})`,
        }}>
          www.travelwithroamio.com
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 60,
        textAlign: "center", opacity: urlOp,
      }}>
        <div style={{
          display: "inline-block", background: CORAL, color: "white",
          padding: "8px 20px", borderRadius: 20, fontSize: 18, fontWeight: 700, letterSpacing: 1,
        }}>
          DOWNLOAD NOW 🚀
        </div>
      </div>
    </AbsoluteFill>
  );
};
