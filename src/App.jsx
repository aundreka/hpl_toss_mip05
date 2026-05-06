import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import { characterAssets, imageAssets, pointAssets, ringAssets, soundAssets } from "./assets";
import Endcard from "./components/Endcard";
import TotalEarnings from "./components/TotalEarnings";
import { useSound } from "./hooks/useSound";

const rings = ringAssets.map((src) => ({ src }));

const DEFAULT_RING4_SIZE = 598.5;
const INNER_RING_RATIO = 118.5 / DEFAULT_RING4_SIZE;
const CTA_RING_ANCHOR_RATIO = 0.59;
const RING_STACK_SCALE = 0.95;
const HAND_IDLE_DELAY_MS = 2000;
const POINT_FADE_DELAY_MS = 2000;
const WAVE_STEP_MS = 120;
const BG_BASE_VOLUME = 0.28;
const BG_DUCKED_VOLUME = 0.12;
const BG_DUCK_MS = 700;
const TOTAL_EARNINGS_DELAY_MS = 500;
const TOTAL_EARNINGS_ADVANCE_MS = 3000;
const characterPlacements = [
  { ringIndex: 1, x: 0.85, y: 0.82, size: 0.48 },
  { ringIndex: 1, x: 0.04, y: 0.35, size: 0.48 },
  { ringIndex: 2, x: 0.15, y: 0.85, size: 0.32 },
  { ringIndex: 2, x: 0.53, y: 1, size: 0.32 },
  { ringIndex: 3, x: 0.34, y: 0.18, size: 0.22 },
  { ringIndex: 3, x: 0.69, y: 0.22, size: 0.22 },
];

const getRingSize = (index, ring4Size) => {
  if (rings.length === 1) {
    return ring4Size;
  }

  const progress = index / (rings.length - 1);
  const ratio = INNER_RING_RATIO + (1 - INNER_RING_RATIO) * progress;

  return ratio * ring4Size;
};

const getCharacterStyle = (placement, ringLayout) => {
  const ringSize = getRingSize(placement.ringIndex, ringLayout.ring4Size);
  const xOffset = (placement.x - 0.5) * ringSize;
  const width = ringSize * placement.size;
  const top = ringLayout.centerY + (placement.y - 0.5) * ringSize;

  return {
    left: `calc(50% + ${xOffset}px)`,
    top: `${top}px`,
    width: `${width}px`,
  };
};

function App() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const pointsRef = useRef(null);
  const ctaRef = useRef(null);
  const showEndcardRef = useRef(false);
  const finalPointTimeoutRef = useRef(null);
  const handTimeoutRef = useRef(null);
  const pointFadeTimeoutRef = useRef(null);
  const totalEarningsTimeoutRef = useRef(null);
  const endcardTimeoutRef = useRef(null);
  const backgroundAudioRef = useRef(null);
  const backgroundDuckTimeoutRef = useRef(null);
  const [ringLayout, setRingLayout] = useState({
    centerY: 180,
    ring4Size: DEFAULT_RING4_SIZE,
  });
  const [activePointIndex, setActivePointIndex] = useState(null);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [showHandHint, setShowHandHint] = useState(false);
  const [pulseWaveTick, setPulseWaveTick] = useState(0);
  const [isFinalPulseLooping, setIsFinalPulseLooping] = useState(false);
  const [showTotalEarnings, setShowTotalEarnings] = useState(false);
  const [showEndcard, setShowEndcard] = useState(false);
  const clickUrl = window.clickTag || window.clickUrl;

  useEffect(() => {
    showEndcardRef.current = showEndcard;
  }, [showEndcard]);

  const duckBackgroundAudio = () => {
    const backgroundAudio = backgroundAudioRef.current;

    if (!backgroundAudio) {
      return;
    }

    backgroundAudio.volume = BG_DUCKED_VOLUME;

    if (backgroundDuckTimeoutRef.current !== null) {
      window.clearTimeout(backgroundDuckTimeoutRef.current);
    }

    backgroundDuckTimeoutRef.current = window.setTimeout(() => {
      backgroundAudio.volume = BG_BASE_VOLUME;
      backgroundDuckTimeoutRef.current = null;
    }, BG_DUCK_MS);
  };

  const playClickSound = useSound(soundAssets.click, 0.6, duckBackgroundAudio);
  const playWinSound = useSound(soundAssets.win, 0.75, duckBackgroundAudio);

  useEffect(() => {
    const backgroundAudio = new Audio(soundAssets.bg);
    backgroundAudio.loop = true;
    backgroundAudio.volume = BG_BASE_VOLUME;
    backgroundAudioRef.current = backgroundAudio;

    const tryPlayBackground = () => {
      backgroundAudio.play().catch(() => {});
    };

    tryPlayBackground();

    const resumeBackground = () => {
      if (!showEndcardRef.current && backgroundAudio.paused) {
        tryPlayBackground();
      }
    };

    window.addEventListener("pointerdown", resumeBackground, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", resumeBackground);
      backgroundAudio.pause();
      backgroundAudioRef.current = null;

      if (backgroundDuckTimeoutRef.current !== null) {
        window.clearTimeout(backgroundDuckTimeoutRef.current);
        backgroundDuckTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const updateRingLayout = () => {
      const hero = heroRef.current;
      const stage = stageRef.current;
      const points = pointsRef.current;
      const cta = ctaRef.current;

      if (!hero || !stage || !points || !cta) {
        return;
      }

      const heroRect = hero.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      const pointsRect = points.getBoundingClientRect();
      const ctaRect = cta.getBoundingClientRect();
      const pointsCenterY = pointsRect.top - heroRect.top + pointsRect.height / 2;
      const ctaRingAnchorY = ctaRect.top - heroRect.top + ctaRect.height * CTA_RING_ANCHOR_RATIO;
      const availableRingSpan = Math.max(ctaRingAnchorY - pointsCenterY, 0);
      const ring4Size = availableRingSpan * RING_STACK_SCALE;
      const centerY = pointsCenterY + ring4Size / 2 - (stageRect.top - heroRect.top);

      setRingLayout((current) => {
        if (
          Math.abs(current.centerY - centerY) < 0.5 &&
          Math.abs(current.ring4Size - ring4Size) < 0.5
        ) {
          return current;
        }

        return { centerY, ring4Size };
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateRingLayout);
    });

    if (heroRef.current) resizeObserver.observe(heroRef.current);
    if (stageRef.current) resizeObserver.observe(stageRef.current);
    if (pointsRef.current) resizeObserver.observe(pointsRef.current);
    if (ctaRef.current) resizeObserver.observe(ctaRef.current);

    window.addEventListener("resize", updateRingLayout);
    requestAnimationFrame(updateRingLayout);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateRingLayout);
    };
  }, []);

  useEffect(() => {
    const backgroundAudio = backgroundAudioRef.current;

    if (!backgroundAudio || !showEndcard) {
      return;
    }

    backgroundAudio.pause();
  }, [showEndcard]);

  useEffect(() => {
    return () => {
      if (finalPointTimeoutRef.current !== null) {
        window.clearTimeout(finalPointTimeoutRef.current);
      }
      if (handTimeoutRef.current !== null) {
        window.clearTimeout(handTimeoutRef.current);
      }
      if (pointFadeTimeoutRef.current !== null) {
        window.clearTimeout(pointFadeTimeoutRef.current);
      }
      if (totalEarningsTimeoutRef.current !== null) {
        window.clearTimeout(totalEarningsTimeoutRef.current);
      }
      if (endcardTimeoutRef.current !== null) {
        window.clearTimeout(endcardTimeoutRef.current);
      }
      if (backgroundDuckTimeoutRef.current !== null) {
        window.clearTimeout(backgroundDuckTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setShowHandHint(false);

    if (handTimeoutRef.current !== null) {
      window.clearTimeout(handTimeoutRef.current);
      handTimeoutRef.current = null;
    }

    if (currentCharacterIndex === null) {
      return;
    }

    handTimeoutRef.current = window.setTimeout(() => {
      setShowHandHint(true);
    }, HAND_IDLE_DELAY_MS);

    return () => {
      if (handTimeoutRef.current !== null) {
        window.clearTimeout(handTimeoutRef.current);
        handTimeoutRef.current = null;
      }
    };
  }, [currentCharacterIndex]);

  useEffect(() => {
    if (endcardTimeoutRef.current !== null) {
      window.clearTimeout(endcardTimeoutRef.current);
      endcardTimeoutRef.current = null;
    }

    if (!showTotalEarnings || showEndcard) {
      return;
    }

    endcardTimeoutRef.current = window.setTimeout(() => {
      setShowEndcard(true);
      setShowTotalEarnings(false);
      endcardTimeoutRef.current = null;
    }, TOTAL_EARNINGS_ADVANCE_MS);

    return () => {
      if (endcardTimeoutRef.current !== null) {
        window.clearTimeout(endcardTimeoutRef.current);
        endcardTimeoutRef.current = null;
      }
    };
  }, [showEndcard, showTotalEarnings]);

  useEffect(() => {
    if (pointFadeTimeoutRef.current !== null) {
      window.clearTimeout(pointFadeTimeoutRef.current);
      pointFadeTimeoutRef.current = null;
    }

    if (activePointIndex === null) {
      return;
    }

    pointFadeTimeoutRef.current = window.setTimeout(() => {
      setActivePointIndex((current) => (current === activePointIndex ? null : current));
    }, POINT_FADE_DELAY_MS);

    return () => {
      if (pointFadeTimeoutRef.current !== null) {
        window.clearTimeout(pointFadeTimeoutRef.current);
        pointFadeTimeoutRef.current = null;
      }
    };
  }, [activePointIndex]);

  const handleAdvanceToEndcard = () => {
    if (!showTotalEarnings || showEndcard) {
      return;
    }

    if (endcardTimeoutRef.current !== null) {
      window.clearTimeout(endcardTimeoutRef.current);
      endcardTimeoutRef.current = null;
    }

    setShowEndcard(true);
    setShowTotalEarnings(false);
  };

  const handleClickAction = useCallback(() => {
    const mraid = window.mraid || {};
    if (mraid.open && typeof mraid.open === "function") {
      if (clickUrl) mraid.open(clickUrl);
      else mraid.open();
      return;
    }

    if (clickUrl) window.open(clickUrl, "_blank", "noopener,noreferrer");
    else window.open();
  }, [clickUrl]);

  const handleCharacterClick = () => {
    if (currentCharacterIndex === null) {
      return;
    }

    playClickSound();
    setPulseWaveTick((current) => current + 1);

    if (finalPointTimeoutRef.current !== null) {
      window.clearTimeout(finalPointTimeoutRef.current);
      finalPointTimeoutRef.current = null;
    }
    setShowHandHint(false);
    setIsFinalPulseLooping(false);

    const nextPointIndex =
      activePointIndex === null ? 0 : Math.min(activePointIndex + 1, pointAssets.length - 1);
    const isLastCharacter = currentCharacterIndex === characterAssets.length - 1;

    setActivePointIndex(nextPointIndex);

    if (isLastCharacter) {
      setCurrentCharacterIndex(null);
      setIsFinalPulseLooping(true);
      totalEarningsTimeoutRef.current = window.setTimeout(() => {
        playWinSound();
        setShowTotalEarnings(true);
      }, TOTAL_EARNINGS_DELAY_MS);

      if (nextPointIndex < pointAssets.length - 1) {
        finalPointTimeoutRef.current = window.setTimeout(() => {
          setActivePointIndex(nextPointIndex + 1);
        }, 320);
      }

      return;
    }

    setCurrentCharacterIndex(currentCharacterIndex + 1);
  };

  const innerRingSize = getRingSize(0, ringLayout.ring4Size);
  const visibleCharacterCount =
    currentCharacterIndex === null ? characterAssets.length : currentCharacterIndex + 1;
  const visibleCharacters = characterAssets.slice(0, visibleCharacterCount);

  return (
    <>
      {showEndcard ? (
        <Endcard onCtaClick={handleClickAction} onSoundPlay={duckBackgroundAudio} />
      ) : (
        <main className="app">
          <section className="hero" ref={heroRef}>
            <img className="logo" src={imageAssets.logo} alt="Toss" />
            <img
              className="header"
              src={imageAssets.header}
              alt="Receive points whenever Toss users appear nearby"
            />
            <div className="points-anchor" ref={pointsRef} aria-live="polite">
              {pointAssets.map((src, index) => (
                <img
                  key={src}
                  className={`points-popup${activePointIndex === index ? " is-visible" : ""}`}
                  src={src}
                  alt={activePointIndex === index ? `Points reward ${index + 1}` : ""}
                  aria-hidden={activePointIndex === index ? "false" : "true"}
                />
              ))}
            </div>

            <div className="rings-stage" ref={stageRef}>
              {rings.map((ring, index) => (
                <img
                  key={`${ring.src}-${pulseWaveTick}`}
                  className={`ring${pulseWaveTick > 0 ? " ring-wave" : ""}${
                    isFinalPulseLooping ? " ring-wave-loop" : ""
                  }`}
                  src={ring.src}
                  alt=""
                  style={{
                    top: `${ringLayout.centerY}px`,
                    width: `${getRingSize(index, ringLayout.ring4Size)}px`,
                    zIndex: index,
                    "--wave-delay": `${index * WAVE_STEP_MS}ms`,
                  }}
                />
              ))}

              <div
                className="ring-center"
                style={{
                  top: `${ringLayout.centerY}px`,
                  width: `${innerRingSize}px`,
                  height: `${innerRingSize}px`,
                }}
              >
                <img className="lion" src={imageAssets.lion} alt="" aria-hidden="true" />
              </div>

              {visibleCharacters.map((src, index) => {
                const isActive = index === currentCharacterIndex;

                if (!characterPlacements[index]) {
                  return null;
                }

                const sharedProps = {
                  className: `character-button${isActive ? " is-active" : " is-locked"}${
                    pulseWaveTick > 0 ? " character-wave" : ""
                  }${isFinalPulseLooping ? " character-wave-loop" : ""}`,
                  style: getCharacterStyle(characterPlacements[index], ringLayout),
                };
                const characterKey = `${src}-${index}-${pulseWaveTick}`;
                const waveDelay = characterPlacements[index].ringIndex * WAVE_STEP_MS;

                if (isActive) {
                  return (
                    <button
                      key={characterKey}
                      type="button"
                      onClick={handleCharacterClick}
                      aria-label={`Tap character ${index + 1}`}
                      {...sharedProps}
                      style={{
                        ...sharedProps.style,
                        "--wave-delay": `${waveDelay}ms`,
                      }}
                    >
                      <img className="character" src={src} alt="" aria-hidden="true" />
                      {showHandHint ? (
                        <img
                          className="character-hand"
                          src={imageAssets.hand}
                          alt=""
                          aria-hidden="true"
                        />
                      ) : null}
                    </button>
                  );
                }

                return (
                  <div
                    key={characterKey}
                    aria-hidden="true"
                    {...sharedProps}
                    style={{
                      ...sharedProps.style,
                      "--wave-delay": `${waveDelay}ms`,
                    }}
                  >
                    <img className="character" src={src} alt="" />
                  </div>
                );
              })}

              <button
                className="cta-button"
                ref={ctaRef}
                type="button"
                onClick={handleClickAction}
                aria-label="Download Toss"
              >
                <img className="cta" src={imageAssets.cta} alt="" aria-hidden="true" />
              </button>
            </div>
          </section>
        </main>
      )}
      <TotalEarnings
        visible={showTotalEarnings}
        onAdvance={handleAdvanceToEndcard}
        dimSrc={imageAssets.dim}
        earnedSrc={imageAssets.earned}
      />
    </>
  );
}

export default App;
