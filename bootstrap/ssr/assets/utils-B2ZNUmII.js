import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function isSameAccountId(left, right) {
  if (left == null || right == null) return false;
  const leftNum = Number(left);
  const rightNum = Number(right);
  if (!Number.isNaN(leftNum) && !Number.isNaN(rightNum)) {
    return leftNum === rightNum;
  }
  return String(left) === String(right);
}
export {
  cn as c,
  isSameAccountId as i
};
