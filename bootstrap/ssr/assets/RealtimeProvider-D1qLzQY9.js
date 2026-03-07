import "react/jsx-runtime";
import { useContext, createContext } from "react";
import "laravel-echo";
import "pusher-js";
const RealtimeContext = createContext(null);
function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }
  return context;
}
export {
  useRealtime as u
};
