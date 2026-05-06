const rings = [
  { src: "/ui/rings/ring1.svg", size: 118.5 },
  { src: "/ui/rings/ring2.svg", size: 258.5 },
  { src: "/ui/rings/ring3.svg", size: 398.5 },
  { src: "/ui/rings/ring4.svg", size: 598.5 },
];

function App() {
  return (
    <>
      <style>{`
        :root {
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #202632;
          background: #EAECEF;
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #EAECEF;
        }

        #root {
          min-height: 100vh;
        }

        .app {
          min-height: 100svh;
          background: #EAECEF;
          overflow: hidden;
        }

        .hero {
          position: relative;
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 20px 48px;
        }

        .logo {
          width: min(234px, 46vw);
          height: auto;
          margin-top: 8px;
          position: relative;
          z-index: 3;
        }

        .header {
          width: min(420px, 90vw);
          height: auto;
          margin-top: 18px;
          position: relative;
          z-index: 3;
        }

        .points {
          width: min(330px, 72vw);
          height: auto;
          margin-top: 18px;
          position: relative;
          z-index: 3;
        }

        .rings-stage {
          position: relative;
          width: min(680px, 165vw);
          aspect-ratio: 1;
          margin-top: -12px;
          flex: 1;
          min-height: 520px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .ring {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          height: auto;
          pointer-events: none;
        }

        .cta {
          position: absolute;
          left: 50%;
          bottom: max(24px, 4svh);
          transform: translateX(-50%);
          width: min(280px, 72vw);
          height: auto;
          z-index: 2;
        }

        @media (max-width: 480px) {
          .hero {
            padding-left: 16px;
            padding-right: 16px;
          }

          .header {
            width: min(360px, 88vw);
          }

          .points {
            width: min(320px, 78vw);
          }

          .rings-stage {
            width: 165vw;
            min-height: 470px;
          }

          .cta {
            width: min(250px, 68vw);
          }
        }
      `}</style>

      <main className="app">
        <section className="hero">
          <img className="logo" src="/ui/logo.svg" alt="Toss" />
          <img
            className="header"
            src="/ui/header.svg"
            alt="Receive points whenever Toss users appear nearby"
          />
          <img className="points" src="/ui/points.svg" alt="You got 0.4 cent" />

          <div className="rings-stage" aria-hidden="true">
            {rings.map((ring, index) => (
              <img
                key={ring.src}
                className="ring"
                src={ring.src}
                alt=""
                style={{
                  width: `min(${ring.size}px, ${28 + index * 34}vw)`,
                  zIndex: index,
                }}
              />
            ))}

            <img className="cta" src="/ui/cta.svg" alt="Download Toss" />
          </div>
        </section>
      </main>
    </>
  );
}

export default App;
