import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh grid place-items-center p-4 text-sm text-slate-600">
          Loading...
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
