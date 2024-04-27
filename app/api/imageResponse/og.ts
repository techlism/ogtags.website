import { ImageResponse } from "next/og";
import { ReactElement } from "react";
export default async function GenerateImage(element: ReactElement) {
  const img = new ImageResponse(element, { width: 1200, height: 630});

  const buffer = await img.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  return base64;
}