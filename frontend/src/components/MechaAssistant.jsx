function MechaAssistant({ mode = "idle", className = "" }) {
  const resolvedMode = ["idle", "scanning", "walking", "combat", "attack"].includes(mode)
    ? mode
    : "idle";

  return (
    <div className={`mecha-shell ${className}`.trim()}>
      <div className={`mecha-robot mode-${resolvedMode}`}>
        <div className="mecha-head">
          <div className="mecha-antenna" />
          <div className="mecha-eye left" />
          <div className="mecha-eye right" />
        </div>

        <div className="mecha-body">
          <div className="mecha-core" />
        </div>

        <div className="mecha-arm left" />
        <div className="mecha-arm right" />
        <div className="mecha-leg left" />
        <div className="mecha-leg right" />
        <div className="mecha-scan-beam" />
      </div>
    </div>
  );
}

export default MechaAssistant;
