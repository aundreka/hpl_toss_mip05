import { useEffect, useRef, useState } from "react";
import { imageAssets, soundAssets } from "../assets";
import { useSound } from "../hooks/useSound";
import "./Phone.css";

export default function TossSecurities({ onSoundPlay }) {
  const [phase, setPhase] = useState(0);
  const lastSoundPhaseRef = useRef(0);
  const playPopSound = useSound(soundAssets.pop, 0.32, onSoundPlay);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 650);
    const t3 = setTimeout(() => setPhase(3), 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    if (phase > 0 && phase !== lastSoundPhaseRef.current) {
      playPopSound();
      lastSoundPhaseRef.current = phase;
    }
  }, [phase, playPopSound]);

  const visible = phase >= 3;
  const screenClassName = [
    "phone-screen",
    phase >= 1 ? "is-phase-1" : "",
    phase >= 2 ? "is-phase-2" : "",
    visible ? "is-visible" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="phone-shell">
      <div className="phone-frame">
        <div className={screenClassName}>
          <div className="phone-hero">
            <h1 className="phone-hero__title">
              Investing made easy
              <br />
              With Toss Securities
            </h1>
          </div>

          <div className="phone-dashboard">
            <div className="phone-tabs">
              <Tab label="Toss Securities" active delayClass="delay-0" visible={visible} />
              <Tab label="Bookmark" delayClass="delay-005" visible={visible} />
              <Tab label="Discover" delayClass="delay-010" visible={visible} />
              <div className={`phone-tabs__clip ${visible ? "is-visible delay-014" : ""}`}>
                <span className="phone-tabs__clip-text">N</span>
              </div>
            </div>

            <div className="phone-dashboard__content">
              <AnimRow delayClass="delay-006" visible={visible}>
                <div className="phone-row phone-row--between phone-row--header">
                  <span className="phone-text phone-text--header">
                    My accounts <Chevron />
                  </span>
                  <span className="phone-text phone-text--muted-small">
                    Last refreshed 16:50 <Chevron small />
                  </span>
                </div>
                <div className="phone-account-grid">
                  <AccountCard
                    label="KRW"
                    value="₩100,745"
                    delayClass="delay-012"
                    visible={visible}
                    dir="left"
                  />
                  <AccountCard
                    label="USD"
                    value="$80.64"
                    delayClass="delay-017"
                    visible={visible}
                    dir="right"
                  />
                </div>
              </AnimRow>

              <AnimRow delayClass="delay-024" visible={visible}>
                <div className="phone-portfolio">
                  <div className="phone-text phone-text--header">
                    My Portfolio <Chevron />
                  </div>
                  <div className={`phone-portfolio__value ${visible ? "is-visible" : ""}`}>
                    ₩4,000,000 <span className="phone-portfolio__arrow">›</span>
                  </div>
                  <div className={`phone-portfolio__delta ${visible ? "is-visible" : ""}`}>
                    +₩90,432 (7.2%)
                  </div>
                </div>
              </AnimRow>

              <AnimRow delayClass="delay-040" visible={visible}>
                <div className="phone-row phone-row--between phone-row--filters">
                  <span className="phone-text phone-text--muted">Highest value ↑↓</span>
                  <div className="phone-filter-group">
                    <SegmentedControl
                      options={["Price", "Value"]}
                      selected="Value"
                      delayClass="delay-044"
                      visible={visible}
                    />
                    <SegmentedControl
                      options={["$", "W"]}
                      selected="$"
                      delayClass="delay-048"
                      visible={visible}
                    />
                  </div>
                </div>
              </AnimRow>

              <div className={`phone-divider ${visible ? "is-visible delay-052" : ""}`} />

              <AnimRow delayClass="delay-054" visible={visible}>
                <div className="phone-row phone-row--between phone-row--stock-header">
                  <span className="phone-text phone-text--muted">International stocks</span>
                  <span className="phone-text phone-text--muted">
                    View <Chevron small />
                  </span>
                </div>
                <div className="phone-row phone-row--between phone-stock">
                  <div className="phone-stock__identity">
                    <div className={`phone-stock__icon ${visible ? "is-visible" : ""}`}>
                      <img src={imageAssets.apple} alt="Apple" className="phone-stock__icon-image" />
                    </div>
                    <div>
                      <div className="phone-stock__name">Apple Semiconductor</div>
                      <div className="phone-stock__shares">4 shares</div>
                    </div>
                  </div>
                  <div className="phone-stock__values">
                    <div className="phone-stock__price">$838.91</div>
                    <div className="phone-stock__gain">+2,100 (7.0%)</div>
                  </div>
                </div>
              </AnimRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tab({ label, active, delayClass, visible }) {
  return (
    <div className={`phone-tab ${active ? "is-active" : ""} ${delayClass} ${visible ? "is-visible" : ""}`}>
      <span className="phone-tab__label">{label}</span>
      {active && <div className="phone-tab__indicator" />}
    </div>
  );
}

function SegmentedControl({ options, selected, delayClass, visible }) {
  return (
    <div className={`phone-segmented ${delayClass} ${visible ? "is-visible" : ""}`}>
      {options.map((opt) => {
        const isSelected = opt === selected;

        return (
          <div key={opt} className={`phone-segmented__option ${isSelected ? "is-selected" : ""}`}>
            {opt}
          </div>
        );
      })}
    </div>
  );
}

function AnimRow({ children, delayClass, visible }) {
  return <div className={`phone-anim-row ${delayClass} ${visible ? "is-visible" : ""}`}>{children}</div>;
}

function AccountCard({ label, value, delayClass, visible, dir }) {
  return (
    <div
      className={`phone-account-card phone-account-card--${dir} ${delayClass} ${visible ? "is-visible" : ""}`}
    >
      <div className="phone-account-card__label">{label}</div>
      <div className="phone-account-card__value">{value}</div>
    </div>
  );
}

function Chevron({ small }) {
  return <span className={`phone-chevron ${small ? "phone-chevron--small" : ""}`}>›</span>;
}
