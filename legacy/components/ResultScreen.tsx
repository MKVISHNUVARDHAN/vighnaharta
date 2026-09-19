import React, { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";

interface Props {
  onRunAgain: () => void;
  onViewRoute: () => void;
  onMainMenu: () => void;
}
const names = ["Road Rally", "Modak Catch", "Flower Festival", "Dhol Utsav", "Monsoon Crossing", "Rangoli Lightworks"];
export default function ResultScreen({ onRunAgain, onMainMenu }: Props) {
  const stats = useGameStore((s) => s.currentRunStats);
  const best = useGameStore((s) => s.personalBest);
  const update = useGameStore((s) => s.updatePersonalBest);
  const complete = stats.goodTurns === 6;
  useEffect(() => {
    if (stats.goodTurns > best.score)
      update({
        score: stats.goodTurns,
        time: stats.timeElapsed,
        grade: stats.grade,
        rangolisDiscovered: stats.rangolisFound,
      });
  }, [stats, best.score, update]);
  const time = `${Math.floor(stats.timeElapsed / 60)}:${String(stats.timeElapsed % 60).padStart(2, "0")}`;
  return (
    <div className="result-journey">
      <div className="result-petals">
        {Array.from({ length: 22 }, (_, i) => (
          <i
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 8) * 0.18}s`,
            }}
          />
        ))}
      </div>
      <section>
        <span>
          {complete
            ? "THE CITY FOLLOWED YOUR LIGHT"
            : "THE FESTIVAL WAITS FOR YOU"}
        </span>
        <h1>{complete ? "GANPATI BAPPA MORYA" : "THE JOURNEY RESTS"}</h1>
        <p>
          {complete
            ? "Every Vighna became a light. Every neighbourhood moves together."
            : "Return with Mooshak and clear the remaining roads before the festival clock ends."}
        </p>
        <div className="completion-seal">
          <strong>
            {stats.goodTurns}
            <small>/6</small>
          </strong>
          <span>ROADS CLEARED</span>
        </div>
        <div className="result-stages">
          {names.map((n, i) => (
            <div className={i < stats.goodTurns ? "cleared" : ""} key={n}>
              <b>{i < stats.goodTurns ? "✓" : i + 1}</b>
              <span>{n}</span>
              <em>{i < stats.goodTurns ? "CLEARED" : "WAITING"}</em>
            </div>
          ))}
        </div>
        <div className="result-meta"><span>LIGHT POINTS <b>{stats.score}</b></span><span>BEST CHAIN <b>{stats.maxCombo}</b></span>
          <span>
            JOURNEY TIME <b>{time}</b>
          </span>
          <span>
            FINAL RANGOLI <b>{complete ? "AWAKENED" : "LOCKED"}</b>
          </span>
        </div>
        <div className="result-actions">
          <button onClick={onRunAgain}>RUN THE FESTIVAL AGAIN</button>
          <button onClick={onMainMenu}>MAIN MENU</button>
        </div>
      </section>
    </div>
  );
}
