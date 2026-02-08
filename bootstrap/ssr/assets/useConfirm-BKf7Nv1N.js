import "react/jsx-runtime";
import { useContext, createContext } from "react";
import "./Button-ymbdH_NY.js";
const ConfirmContext = createContext(null);
function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context.confirm;
}
export {
  useConfirm as u
};
