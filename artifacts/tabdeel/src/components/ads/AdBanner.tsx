import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.log("AdSense error:", e);
    }
  }, []);

  return (
    <div className="w-full flex justify-center my-6 overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{
          display: "inline-block",
          width: "300px",
          height: "250px",
        }}
        data-ad-client="ca-pub-3491956593400214"
        data-ad-slot="9594047856"
      />
    </div>
  );
}