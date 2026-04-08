import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

export const S1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame, fps, config: { damping: 12 } });
  const logoScale = interpolate(logoS, [0, 1], [0, 1]);

  const titleS = spring({ frame: frame - 15, fps, config: { damping: 14 } });
  const titleOp = interpolate(titleS, [0, 1], [0, 1]);
  const titleY = interpolate(titleS, [0, 1], [40, 0]);

  const tagS = spring({ frame: frame - 35, fps, config: { damping: 14 } });
  const tagOp = interpolate(tagS, [0, 1], [0, 1]);

  const subtitleOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const glow = Math.sin(frame * 0.04) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* Glow circle */}
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)`,
        opacity: glow,
      }} />

      {/* Logo */}
      <div style={{
        width: 140,
        height: 140,
        borderRadius: "50%",
        overflow: "hidden",
        border: "4px solid white",
        transform: `scale(${logoScale})`,
        marginBottom: 30,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <Img src={staticFile("images/roamio-logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Title */}
      <div style={{
        opacity: titleOp,
        transform: `translateY(${titleY}px)`,
        fontSize: 80,
        fontWeight: 800,
        color: "white",
        letterSpacing: -3,
        textAlign: "center",
      }}>
        Roamio
      </div>

      {/* Tagline */}
      <div style={{
        opacity: tagOp,
        marginTop: 16,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 40,
        padding: "10px 32px",
      }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: TEAL }}>
          Travel Together, Explore Forever
        </span>
      </div>

      {/* Subtitle */}
      <div style={{
        opacity: subtitleOp,
        marginTop: 24,
        fontSize: 24,
        color: "rgba(255,255,255,0.8)",
        textAlign: "center",
      }}>
        Your all-in-one travel companion app
      </div>
    </AbsoluteFill>
  );
};
