import type { Game } from "./game";
import type { Goal } from "./goal";

export interface NewGoalModalProps {
  open: boolean;
  onClose: () => void;
  games: Game[];
  onConfirm?: (goal: Omit<Goal, "id" | "status" | "currentMinutes">) => void;
}
