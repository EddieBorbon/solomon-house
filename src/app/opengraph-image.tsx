import { ImageResponse } from "next/og";

const size = {
  width: 1200,
  height: 630,
};

const fetchFont = async () => {
  const fontUrl = new URL(
    "../public/fuentes/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf",
    import.meta.url
  );
  const response = await fetch(fontUrl);

  if (!response.ok) {
    throw new Error("No se pudo cargar la fuente para la imagen OG.");
  }

  return response.arrayBuffer();
};

export const runtime = "edge";
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fontData = await fetchFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background:
            "radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.35), transparent 55%), radial-gradient(circle at 80% 30%, rgba(255, 0, 128, 0.35), transparent 55%), #05010f",
          color: "#ffffff",
          padding: "80px",
        }}
      >
        <div
          style={{
            textTransform: "uppercase",
            fontSize: 28,
            letterSpacing: "0.4em",
            color: "rgba(255, 255, 255, 0.65)",
            marginBottom: 24,
          }}
        >
          Collaborative 3D Musical Creation
        </div>
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.1,
            color: "#00f0ff",
            textShadow: "0 0 20px rgba(0, 240, 255, 0.75)",
            marginBottom: 32,
          }}
        >
          Solomon&apos;s House
        </div>
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            maxWidth: 720,
            color: "rgba(255, 255, 255, 0.8)",
          }}
        >
          Genera paisajes sonoros inmersivos con WebGL, Three.js y audio
          colaborativo en tiempo real.
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Nunito Sans",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}

