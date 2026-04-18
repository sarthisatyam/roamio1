import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Poppins";

const { fontFamily } = loadFont("normal", { weights: ["400", "600", "700", "800"], subsets: ["latin"] });
const CORAL = "#d94f6e";

export const SceneTwist1 = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneS = spring({ frame, fps, config: { damping: 14 } });
  const phoneScale = interpolate(phoneS, [0, 1], [0.7, 1]);
  const phoneOp = interpolate(phoneS, [0, 1], [0, 1]);

  const shake = Math.sin(frame * 0.8) * (frame < 30 ? 6 : 0);

  const reactS = spring({ frame: frame - 90, fps, config: { damping: 14 } });
  const reactOp = interpolate(reactS, [0, 1], [0, 1]);
  const reactY = interpolate(reactS, [0, 1], [20, 0]);

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, #2a2a3a 0%, #1a1a26 100%)`,
      fontFamily,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      {/* Phone frame */}
      <div style={{
        width: 460, height: 900, borderRadius: 44, background: "#000", padding: 10,
        opacity: phoneOp, transform: `scale(${phoneScale}) translateX(${shake}px)`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6)", marginTop: 40,
      }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 40, background: "#ECE5DD", overflow: "hidden", padding: 16 }}>
          <div style={{ background: "#075E54", color: "white", padding: "12px 16px", borderRadius: 10, marginBottom: 14, fontWeight: 700, fontSize: 22, display: "flex", justifyContent: "space-between" }}>
            <span>Trip Squad 🏔️</span>
            <span style={{ fontSize: 16, opacity: 0.8 }}>4 members</span>
          </div>

          <Sequence from={20}>
            <Bubble from={0} text="Guys… plan all set? ✈️" who="Kabir" sent={false} />
          </Sequence>

          <Sequence from={45}>
            <Bubble from={0} text="EMERGENCY HAI 😭" who="Meera" sent={false} highlight />
          </Sequence>

          <Sequence from={70}>
            <Bubble from={0} text="Nani ke ghar jaana padega… can't come 💔" who="Meera" sent={false} />
          </Sequence>

          <Sequence from={110}>
            <div style={{ display: "flex", gap: 4, justifyContent: "flex-end", marginTop: 12 }}>
              <Typing />
            </div>
          </Sequence>
        </div>
      </div>

      {/* Reaction text */}
      <div style={{
        position: "absolute", bottom: 70, left: 40, right: 40,
        textAlign: "center", opacity: reactOp, transform: `translateY(${reactY}px)`,
      }}>
        <div style={{ display: "inline-block", background: CORAL, color: "white", padding: "14px 28px", borderRadius: 30, fontWeight: 700, fontSize: 28 }}>
          Yaar ye kya plot twist hai 😭
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ from: number; text: string; who: string; sent: boolean; highlight?: boolean }> = ({ from, text, who, sent, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - from, fps, config: { damping: 14 } });
  const op = interpolate(s, [0, 1], [0, 1]);
  const y = interpolate(s, [0, 1], [12, 0]);
  return (
    <div style={{
      display: "flex", justifyContent: sent ? "flex-end" : "flex-start", marginBottom: 10,
      opacity: op, transform: `translateY(${y}px)`,
    }}>
      <div style={{
        background: sent ? "#DCF8C6" : (highlight ? "#FFD8DC" : "white"),
        padding: "10px 14px", borderRadius: 12, maxWidth: 380,
        fontSize: 20, color: "#222", fontWeight: highlight ? 700 : 500,
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? "#c0392b" : "#075E54", marginBottom: 3 }}>{who}</div>
        {text}
      </div>
    </div>
  );
};

const Typing: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ background: "white", padding: "10px 14px", borderRadius: 12, display: "flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#666",
          opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame + i * 6) * 0.2)),
        }} />
      ))}
    </div>
  );
};
