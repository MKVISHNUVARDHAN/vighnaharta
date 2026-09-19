export type Medal = "BRONZE" | "SILVER" | "GOLD" | "ASSISTED";

export type ChallengeProps = {
  assisted: boolean;
  onWin: (medal?: Medal) => void;
  onFail: () => void;
};

export const formatTime = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, Math.ceil(seconds % 60))).padStart(2, "0")}`;

export function MiniHud({ left, right }: { left: string; right: string }) {
  return (
    <div className="mini-hud">
      <strong>{left}</strong>
      <b>{right}</b>
    </div>
  );
}
