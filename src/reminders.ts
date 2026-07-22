import type { Tone } from "./utils.js";

export type DueState = "overdue" | "due-soon" | "on-track" | "done";

export function getDueStateTone(state: DueState): Tone {
  switch (state) {
    case "overdue":
      return "danger";
    case "due-soon":
      return "warning";
    case "done":
      return "success";
    case "on-track":
      return "info";
  }
}

export function formatRelativeDue(daysUntilDue: number): string {
  if (daysUntilDue < 0) {
    const days = Math.abs(daysUntilDue);
    return `${days} day${days === 1 ? "" : "s"} overdue`;
  }

  if (daysUntilDue === 0) {
    return "Due today";
  }

  if (daysUntilDue === 1) {
    return "Due tomorrow";
  }

  return `Due in ${daysUntilDue} days`;
}
