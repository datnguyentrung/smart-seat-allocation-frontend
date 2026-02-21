"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      richColors
      className="toaster group"
      toastOptions={{
        style: {
          background: "#1a1a1a",
          border: "1px solid #333",
          color: "#fff",
        },
        classNames: {
          success: "toast-success",
          error: "toast-error",
          warning: "toast-warning",
          info: "toast-info",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
