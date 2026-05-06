function TotalEarnings({ visible, onAdvance, dimSrc, earnedSrc }) {
  return (
    <div
      className={`total-earnings-overlay${visible ? " is-visible" : ""}`}
      aria-hidden={visible ? "false" : "true"}
      onClick={visible ? onAdvance : undefined}
      style={{ backgroundImage: `url(${dimSrc})` }}
    >
      <div className="total-earnings-dialog" role="dialog" aria-modal="true">
        <div className="total-earnings-card-shell">
          <img
            className="total-earnings-card"
            src={earnedSrc}
            alt="Congratulations, total earned 22.7 cents"
          />
        </div>
      </div>
    </div>
  );
}

export default TotalEarnings;
