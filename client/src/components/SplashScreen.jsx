// src/components/SplashScreen.jsx
import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <Player
        autoplay
        speed={1.5}
        loop={true}
        src="/loader-lottie.json"   // keep your Lottie file in public/
        style={{ height: 400, width: 400 }}
      />
    </div>
  );
}
