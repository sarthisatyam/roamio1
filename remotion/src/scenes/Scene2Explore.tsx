import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700"], subsets: ["latin"] });

const CORAL = "#d94f6e";
const CORAL_DARK = "#c44562";
const TEAL = "#04a5c2";

const FeatureCard = ({ title, icon, delay, yPos }: { title: string; icon: string; delay: number; yPos: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } });
  const x = interpolate(s, [0, 1], [600, 0]);
  const op = interpolate(s, [0, 1], [0, 1]);

  return (
    <div style={{
      position: "absolute",
      left: 60,
      right: 60,
      top: yPos,
      transform: `translateX(${x}px)`,
      opacity: op,
      background: "rgba(255,255,255,0.12)",
      borderRadius: 24,
      padding: "28px 32px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      border: "1px solid rgba(255,255,255,0.2)",
    }}>
      <div style={{
        width: 64,
        height: 64,
        borderRadius: 16,
        background: TEAL,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: 30, fontWeight: 600, color: "white" }}>{title}</span>
    </div>
  );
};

export const Scene2Explore = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const headerY = interpolate(spring({ frame, fps, config: { damping: 15 } }), [0, 1], [-40, 0]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${CORAL} 0%, ${CORAL_DARK} 50%, ${CORAL} 100%)`,
      fontFamily,
    }}>
      <div style={{
        position: "absolute",
        top: 180,
        left: 60,
        opacity: headerOp,
        transform: `translateY(${headerY}px)`,
      }}>
        <div style={{
          background: `rgba(255,255,255,0.15)`,
          border: `1px solid rgba(255,255,255,0.3)`,
          borderRadius: 40,
          padding: "10px 28px",
          color: TEAL,
          fontSize: 22,
          fontWeight: 600,
          display: "inline-block",
          marginBottom: 20,
        }}>
          ✈️ Explore
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "white", lineHeight: 1.2, marginTop: 16 }}>
          Discover Plans{"\n"}& Join Trips
        </div>
      </div>

      <FeatureCard title="Browse travel plans nearby" icon="🌍" delay={20} yPos={520} />
      <FeatureCard title="Request to join any trip" icon="🤝" delay={35} yPos={660} />
      <FeatureCard title="Create your own plan" icon="📝" delay={50} yPos={800} />
      <FeatureCard title="AI-powered cover images" icon="🎨" delay={65} yPos={940} />
    </AbsoluteFill>
  );
};
