declare module "qrcode.react" {
  import type { SVGProps } from "react";

  interface QRCodeSVGProps extends SVGProps<SVGSVGElement> {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate?: boolean;
      x?: number;
      y?: number;
    };
  }

  export function QRCodeSVG(props: QRCodeSVGProps): JSX.Element;
  export function QRCodeCanvas(props: QRCodeSVGProps): JSX.Element;
}
