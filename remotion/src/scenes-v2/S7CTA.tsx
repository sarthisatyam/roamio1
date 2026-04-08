import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const S7CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleS = spring({ frame, fps, config: { damping: 12 } });
  const titleScale = interpolate(titleS, [0, 1], [0.3, 1]);
  const titleOp = interpolate(titleS, [0, 1], [0, 1]);

  const hookS = spring({ frame: frame - 20, fps, config: { damping: 14 } });
  const hookOp = interpolate(hookS, [0, 1], [0, 1]);
  const hookY = interpolate(hookS, [0, 1], [30, 0]);

  const urlS = spring({ frame: frame - 50, fps, config: { damping: 14 } });
  const urlScale = interpolate(urlS, [0, 1], [0.5, 1]);
  const urlOp = interpolate(urlS, [0, 1], [0, 1]);

  const logoS = spring({ frame: frame - 70, fps, config: { damping: 14 } });
  const logoScale = interpolate(logoS, [0, 1], [0, 1]);

  const btnS = spring({ frame: frame - 40, fps, config: { damping: 10 } });
  const btnScale = interpolate(btnS, [0, 1], [0.3, 1]);

  const pulse = Math.sin(frame * 0.06) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 40%, ${CORAL} 100%)`,
      fontFamily,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
        opacity: pulse,
      }} />

      {/* Hook text */}
      <div style={{
        opacity: titleOp,
        transform: `scale(${titleScale})`,
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 72, fontWeight: 800, color: "white", lineHeight: 1.1, letterSpacing: -2 }}>
          Stop Planning.
        </div>
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 12,
          padding: "4px 24px",
          display: "inline-block",
          color: TEAL,
        }}>
          Start Living.
        </div>
      </div>

      {/* Subhook */}
      <div style={{
        opacity: hookOp,
        transform: `translateY(${hookY}px)`,
        fontSize: 28,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 1.5,
      }}>
        Join thousands of travelers exploring the world together
      </div>

      {/* CTA */}
      <div style={{
        transform: `scale(${btnScale})`,
        background: TEAL,
        padding: "22px 64px",
        borderRadius: 60,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        marginBottom: 30,
      }}>
        <span style={{ fontSize: 30, fontWeight: 700, color: "white" }}>Try Roamio Free</span>
      </div>

      {/* Logo */}
      <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid white",
        transform: `scale(${logoScale})`,
        marginBottom: 16,
      }}>
        <Img src={staticFile("images/roamio-logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* URL */}
      <div style={{
        opacity: urlOp,
        transform: `scale(${urlScale})`,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 12,
        padding: "8px 28px",
      }}>
        <span style={{ fontSize: 28, color: TEAL, fontWeight: 700 }}>
          www.travelwithroamio.com
        </span>
      </div>
    </AbsoluteFill>
  );
};
