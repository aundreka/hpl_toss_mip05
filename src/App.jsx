import { useEffect, useRef, useState } from "react";
import "./App.css";

const rings = [
  { src: "/ui/rings/ring1.svg" },
  { src: "/ui/rings/ring2.svg" },
  { src: "/ui/rings/ring3.svg" },
  { src: "/ui/rings/ring4.svg" },
];

const DEFAULT_RING4_SIZE = 598.5;
const INNER_RING_RATIO = 118.5 / DEFAULT_RING4_SIZE;

const getRingSize = (index, ring4Size) => {
  if (rings.length === 1) {
    return ring4Size;
  }

  const progress = index / (rings.length - 1);
  const ratio = INNER_RING_RATIO + (1 - INNER_RING_RATIO) * progress;

  return ratio * ring4Size;
};

function App() {
  const heroRef = useRef(null);
  const stageRef = useRef(null);
  const pointsRef = useRef(null);
  const ctaRef = useRef(null);
  const [ringLayout, setRingLayout] = useState({
    centerY: 180,
    ring4Size: DEFAULT_RING4_SIZE,
  });

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
      const ctaCenterY = ctaRect.top - heroRect.top + ctaRect.height / 2;
      const ring4Size = Math.max(ctaCenterY - pointsCenterY, 0);
      const centerY = (pointsCenterY + ctaCenterY) / 2 - (stageRect.top - heroRect.top);

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

  return (
    <>
      <main className="app">
        <section className="hero" ref={heroRef}>
          <img className="logo" src="/ui/logo.svg" alt="Toss" />
          <img
            className="header"
            src="/ui/header.svg"
            alt="Receive points whenever Toss users appear nearby"
          />
          <img
            className="points"
            ref={pointsRef}
            src="/ui/points.svg"
            alt="You got 0.4 cent"
          />

          <div className="rings-stage" ref={stageRef} aria-hidden="true">
            {rings.map((ring, index) => (
              <img
                key={ring.src}
                className="ring"
                src={ring.src}
                alt=""
                style={{
                  top: `${ringLayout.centerY}px`,
                  width: `${getRingSize(index, ringLayout.ring4Size)}px`,
                  zIndex: index,
                }}
              />
            ))}

            <img className="cta" ref={ctaRef} src="/ui/cta.svg" alt="Download Toss" />
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
