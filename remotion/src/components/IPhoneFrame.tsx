import { AbsoluteFill, Img, staticFile } from "remotion";

const BEZEL_RADIUS = 44;
const NOTCH_WIDTH = 160;
const NOTCH_HEIGHT = 34;

export const IPhoneFrame = ({
  screenSrc,
  scale = 1,
  style = {},
}: {
  screenSrc: string;
  scale?: number;
  style?: React.CSSProperties;
}) => {
  const phoneW = 300;
  const phoneH = 620;

  return (
    <div
      style={{
        width: phoneW,
        height: phoneH,
        borderRadius: BEZEL_RADIUS,
        background: "#1a1a1a",
        padding: 8,
        boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.1)",
        transform: `scale(${scale})`,
        position: "relative",
        ...style,
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: NOTCH_WIDTH,
          height: NOTCH_HEIGHT,
          background: "#1a1a1a",
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          zIndex: 10,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            width: 60,
            height: 8,
            borderRadius: 4,
            background: "#333",
          }}
        />
      </div>

      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: BEZEL_RADIUS - 6,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <Img
          src={staticFile(screenSrc)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Home indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 100,
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.3)",
          zIndex: 10,
        }}
      />
    </div>
  );
};
