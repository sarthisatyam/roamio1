import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";
const TEAL = "#04a5c2";

const ParentLine: React.FC<{ from: number; who: string; text: string; align: "left" | "right" }> = ({ from, who, text, align }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const op = interpolate(s, [0, 1], [0, 1]);
  const x = interpolate(s, [0, 1], [align === "left" ? -30 : 30, 0]);
  return (
    <div style={{
      position: "absolute",
      [align]: 30,
      bottom: align === "left" ? 280 : 200,
      maxWidth: 460,
      opacity: op,
      transform: `translateX(${x}px)`,
      background: "white",
      padding: "14px 20px",
      borderRadius: 16,
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      fontWeight: 600,
      fontSize: 26,
      color: "#222",
    }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: CORAL, marginBottom: 4 }}>{who}</div>
      {text}
    </div>
  );
};

export const SceneParents = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoom = interpolate(frame, [0, 200], [1.0, 1.08]);
  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });

  const wsS = spring({ frame: frame - 130, fps, config: { damping: 14 } });
  const wsScale = interpolate(wsS, [0, 1], [0.7, 1]);
  const wsOp = interpolate(wsS, [0, 1], [0, 1]);

  const confirmS = spring({ frame: frame - 220, fps, config: { damping: 8 } });
  const confirmScale = interpolate(confirmS, [0, 1], [0, 1.1]);
  const confirmOp = interpolate(confirmS, [0, 0.5, 1], [0, 1, 1]);

  return (
    <AbsoluteFill style={{ background: "#000", fontFamily, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, opacity: fadeIn }}>
        <Img src={staticFile("images/ad/scene2-parents.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4), transparent 25%, transparent 75%, rgba(0,0,0,0.7))" }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 80, left: 40, right: 40, textAlign: "center",
      }}>
        <div style={{ display: "inline-block", background: "rgba(0,0,0,0.7)", color: "white", padding: "10px 22px", borderRadius: 30, fontWeight: 700, fontSize: 24 }}>
          😬 REALITY CHECK
        </div>
      </div>

      <Sequence from={15}>
        <ParentLine from={0} who="MOM" text="Friends ke saath trip? No." align="left" />
      </Sequence>
      <Sequence from={60}>
        <ParentLine from={0} who="DAD" text="Abhi exams khatam hue hain… trip-vrip kuch nahi." align="right" />
      </Sequence>

      {/* WhatsApp group bubble overlay */}
      {frame > 125 && frame < 215 && (
        <div style={{
          position: "absolute", top: "38%", left: "50%",
          transform: `translate(-50%, -50%) scale(${wsScale})`,
          opacity: wsOp,
          background: "white", borderRadius: 18, padding: 18, width: 520,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }}>
          <div style={{ background: "#075E54", color: "white", padding: "8px 14px", borderRadius: 10, marginBottom: 10, fontSize: 18, fontWeight: 700 }}>
            Mission Convince Parents 💀
          </div>
          <div style={{ background: "#DCF8C6", padding: "10px 14px", borderRadius: 12, marginBottom: 6, fontSize: 18, color: "#222" }}>Please please pleaseee 🙏</div>
          <div style={{ background: "#fff", padding: "10px 14px", borderRadius: 12, marginBottom: 6, fontSize: 18, color: "#222", border: "1px solid #eee" }}>Bhai mom maan gayi! 🥹</div>
          <div style={{ background: "#DCF8C6", padding: "10px 14px", borderRadius: 12, fontSize: 18, color: "#222" }}>Mera dad bhi haan bola 🎉</div>
        </div>
      )}

      {/* Confirmed banner */}
      {frame > 215 && (
        <div style={{
          position: "absolute", top: "45%", left: "50%",
          transform: `translate(-50%, -50%) scale(${confirmScale}) rotate(-4deg)`,
          opacity: confirmOp,
          background: TEAL, color: "white",
          padding: "20px 36px", borderRadius: 20,
          fontSize: 52, fontWeight: 800,
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          textAlign: "center",
          letterSpacing: -1,
        }}>
          TRIP CONFIRMED!!! 🎉🔥
        </div>
      )}
    </AbsoluteFill>
  );
};
