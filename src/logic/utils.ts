export function formatSeconds(s: number): string {
  if (!s || !isFinite(s)) return "0:00";
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

let uidCounter = 0;
export function uid(): string {
  return `uid-${++uidCounter}-${Date.now()}`;
}
