import React from "react";

export const Cta = ({ className = "" }) => {
  const mraid = window.mraid || {};

  const handleCTA = () => {
    if (mraid.open && typeof mraid.open === "function") {
      mraid.open();
    } else {
      window.open();
    }
  };

  return (
    <>
      <div className={`flex justify-center items-center ${className}`}>
        <button
        className={`animate-pulsing relative flex items-center justify-center rounded-lg bg-green-600 px-10 py-2 font-semibold text-white mt-5`}
        onClick={handleCTA}
      >
        <span
          className={`absolute animate-ping inset-0 rounded-lg bg-green-400 opacity-30`}
        />
        <span className={`relative text-xl font-normal`}>Continue</span>
      </button>
      </div>
    </>
  );
};
