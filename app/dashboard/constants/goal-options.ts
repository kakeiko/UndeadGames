export const GOAL_OPTIONS = [
  { label: "Jogar 1 hora", targetMinutes: 60, targetTrophes: 0, points: 30, icon: "\u{1F550}" },
  { label: "Jogar 2 horas", targetMinutes: 120, targetTrophes: 0, points: 50, icon: "\u{1F551}" },
  { label: "Jogar 5 horas", targetMinutes: 300, targetTrophes: 0, points: 100, icon: "\u{1F554}" },
  { label: "Conseguir 1 conquista", targetMinutes: 0, targetTrophes: 1, points: 40, icon: "\u{1F3C6}" },
  { label: "Conseguir 2 conquistas", targetMinutes: 0, targetTrophes: 2, points: 70, icon: "\u{1F947}" },
] as const;
