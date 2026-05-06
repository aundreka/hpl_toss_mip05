import { useEffect } from "react";
import { imageAssets, soundAssets } from "../assets";
import { useSound } from "../hooks/useSound";
import Phone from "./Phone";
import "./Endcard.css";

const CTA_READY_CHIME_DELAY_MS = 900;

function Endcard({ onCtaClick, onSoundPlay }) {
  const playIntroWhoosh = useSound(soundAssets.woosh, 0.45, onSoundPlay);
  const playCtaClickSound = useSound(soundAssets.click2, 0.6, onSoundPlay);
  const playReadyChime = useSound(soundAssets.correct, 0.45, onSoundPlay);

  useEffect(() => {
    playIntroWhoosh();

    const timeoutId = window.setTimeout(() => {
      playReadyChime();
    }, CTA_READY_CHIME_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [playIntroWhoosh, playReadyChime]);

  const handleCtaClick = () => {
    playCtaClickSound();
    onCtaClick?.();
  };

  return (
    <section className="endcard" aria-label="End card">
      <img className="endcard__logo" src={imageAssets.logo} alt="Logo" />
      <div className="endcard__phone">
        <Phone onSoundPlay={onSoundPlay} />
      </div>
      <button
        className="endcard__cta-button"
        type="button"
        onClick={handleCtaClick}
        aria-label="Download Toss"
      >
        <img className="endcard__cta" src={imageAssets.cta} alt="" aria-hidden="true" />
      </button>
      <img className="endcard__footer" src={imageAssets.footer} alt="" />
    </section>
  );
}

export default Endcard;
