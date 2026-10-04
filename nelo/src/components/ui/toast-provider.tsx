"use client";

import { createContext, ReactNode, useContext, useState } from "react";

import { CheckCircle2, CircleAlert, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function removeToast(id: number) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(message: string, type: ToastType = "info") {
    const id = Date.now();

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div className="fixed right-4 top-24 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon =
            toast.type === "success"
              ? CheckCircle2
              : toast.type === "error"
                ? CircleAlert
                : Info;

          return (
            <div
              key={toast.id}
              className="theme-surface theme-border flex items-start gap-3 rounded-xl border p-4 shadow-xl"
            >
              <Icon
                size={20}
                className={
                  toast.type === "error"
                    ? "text-red-500"
                    : toast.type === "success"
                      ? "theme-accent"
                      : "theme-accent"
                }
              />

              <p className="min-w-0 flex-1 text-sm">{toast.message}</p>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="theme-text-secondary"
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
