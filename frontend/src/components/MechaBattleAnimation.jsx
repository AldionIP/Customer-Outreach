import { useEffect, useState } from "react";

const PHASE_DURATIONS = {
  idle: 4000,
  crossRight: 7000,
  crossingPause: 2000,
  crossLeft: 7000,
  battlePause: 3000,
  battleApproach: 4000,
  battle: 5000,
  battleReturn: 4000,
  waiting: 15000,
};

const NEXT_PHASE = {
  idle: "crossRight",
  crossRight: "crossingPause",
  crossingPause: "crossLeft",
  crossLeft: "battlePause",
  battlePause: "battleApproach",
  battleApproach: "battle",
  battle: "battleReturn",
  battleReturn: "waiting",
  waiting: "idle",
};

function MechaRobot({ side, phase }) {
  return (
    <div className={`battle-robot scene-robot scene-${phase}-${side}`}>
      <div className="battle-robot-frame">
        <div className="battle-antenna" />
        <div className="battle-head">
          <span className="battle-eye" />
        </div>
        <div className="battle-body">
          <span className="battle-core" />
        </div>
        <div className="battle-arm battle-arm-front" />
        <div className="battle-arm battle-arm-back" />
        <div className="battle-leg battle-leg-front" />
        <div className="battle-leg battle-leg-back" />
      </div>
    </div>
  );
}

function MechaBattleAnimation() {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPhase(NEXT_PHASE[phase]);
    }, PHASE_DURATIONS[phase]);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  const robots = {
    crossRight: <MechaRobot side="right" phase="cross" />,
    crossLeft: <MechaRobot side="left" phase="cross" />,
    battleApproach: (
      <>
        <MechaRobot side="left" phase="approach" />
        <MechaRobot side="right" phase="approach" />
      </>
    ),
    battle: (
      <>
        <MechaRobot side="left" phase="battle" />
        <MechaRobot side="right" phase="battle" />
      </>
    ),
    battleReturn: (
      <>
        <MechaRobot side="left" phase="return" />
        <MechaRobot side="right" phase="return" />
      </>
    ),
  };

  if (!robots[phase]) {
    return null;
  }

  return (
    <div className={`mecha-battle-layer scene-phase-${phase}`} aria-hidden="true">
      <div className="mecha-battle-stage">
        {robots[phase]}
        {phase === "battle" && (
          <>
            <div className="battle-sparks">✦</div>
            <div className="battle-swords">&#x2694;</div>
            <div className="battle-impact">&#x1F4A5;</div>
          </>
        )}
      </div>
    </div>
  );
}

export default MechaBattleAnimation;
