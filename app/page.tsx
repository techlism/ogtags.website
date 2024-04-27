import type { ImageResponse } from "next/og";
import GenerateImage from "./api/imageResponse/og";
export default async function Page() {
  const element : JSX.Element = (<div tw="text-5xl rounded-md text-center text-blue-500">Kundan</div>);
  const image = await GenerateImage(element);
  // console.log(image);
  return (
    <main className="flex justify-center align-middle items-center m-5 min-h-screen">  
      <img src={`data:image/png;base64,${image}`} alt="base64" />
    </main>
  );
}