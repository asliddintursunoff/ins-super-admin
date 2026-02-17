"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { superLogin, superMe } from "@/lib/api";
import { setAuthToken } from "@/lib/authToken";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function LoginClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await superLogin(username, password);
      setAuthToken(token.access_token);

      const me = await superMe();
      toast.success(`Welcome, ${me.first_name} ${me.last_name}`);
      router.replace(next);
    } catch (err: any) {
      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6">
          <h1 className="text-xl font-semibold">Admin login</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in with your superuser credentials.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <Button className="w-full" loading={loading} type="submit">
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-500">
          Tip: If you see “Server returned HTML”, your backend URL is wrong or Railway is returning an HTML error page.
        </div>
      </div>
    </div>
  );
}
