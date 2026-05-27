import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = `${siteConfig.name} research-use molecule catalog`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "linear-gradient(135deg, #fffaf2 0%, #efe4d6 58%, #171411 100%)",
          color: "#171411",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          width: "100%",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.88)",
            border: "1px solid rgba(23, 20, 17, 0.12)",
            borderRadius: 48,
            boxShadow: "0 28px 80px rgba(23, 20, 17, 0.28)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
            padding: 56,
            width: "100%",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 24,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "#ea7500",
                borderRadius: 28,
                color: "white",
                display: "flex",
                fontSize: 44,
                fontWeight: 800,
                height: 104,
                justifyContent: "center",
                letterSpacing: -4,
                width: 104,
              }}
            >
              ECW
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 42, fontWeight: 800 }}>
                {siteConfig.name}
              </div>
              <div
                style={{
                  color: "#a24b00",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 4,
                  textTransform: "uppercase",
                }}
              >
                Premium research supply
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1.02,
              maxWidth: 900,
            }}
          >
            Precision molecule catalog for qualified research.
          </div>
          <div
            style={{
              color: "#62564c",
              fontSize: 30,
              lineHeight: 1.35,
              maxWidth: 930,
            }}
          >
            Research-use molecules, blends, sprays, and reconstitution supplies
            with compliant product presentation.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
