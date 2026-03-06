import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    QRCode: any;
  }
}

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}

const QRCODE_CDN =
  "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";

export default function QRCodeDisplay({
  value,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#0a0a0a",
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Load qrcode.js library from CDN
  useEffect(() => {
    if (window.QRCode) {
      setLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = QRCODE_CDN;
    script.onload = () => setLoaded(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // Render QR code to canvas once library is loaded
  useEffect(() => {
    if (!loaded || !canvasRef.current || !window.QRCode) return;
    window.QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        color: { dark: fgColor, light: bgColor },
        margin: 1,
      },
      (err: Error | null) => {
        if (err) setError(true);
      },
    );
  }, [loaded, value, size, bgColor, fgColor]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground text-center p-4"
      >
        Could not load QR code
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-lg"
    />
  );
}
