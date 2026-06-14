import { u as useToast } from "./useToast-BN7qsQL3.js";
import { u as useConfirm } from "./useConfirm-gGqxmsEz.js";
function useNotifications() {
  const { addToast } = useToast();
  const confirm = useConfirm();
  return {
    toast: {
      success: (message, description) => {
        addToast({
          title: message,
          description,
          variant: "success"
        });
      },
      error: (message, description) => {
        addToast({
          title: message,
          description,
          variant: "error"
        });
      },
      warning: (message, description) => {
        addToast({
          title: message,
          description,
          variant: "warning"
        });
      },
      info: (message, description) => {
        addToast({
          title: message,
          description,
          variant: "info"
        });
      }
    },
    confirm
  };
}
export {
  useNotifications as u
};
