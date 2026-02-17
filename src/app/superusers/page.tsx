"use client";

import React from "react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { createSuperUser, deleteSuperUser, getSuperUsers, superMe } from "@/lib/api";
import type { SuperUserOut } from "@/lib/types";

export default function SuperusersPage() {
  const [me, setMe] = React.useState<SuperUserOut | null>(null);
  const [rows, setRows] = React.useState<SuperUserOut[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [form, setForm] = React.useState({
    username: "",
    first_name: "",
    last_name: "",
    password: "",
    telegram_id: "",
    is_root: "false",
  });

  async function load() {
    setLoading(true);
    try {
      const m = await superMe();
      setMe(m);

      const list = await getSuperUsers();
      setRows(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load superusers");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!me?.is_root) {
      toast.error("Only root superuser can create new superusers.");
      return;
    }
    setLoading(true);
    try {
      await createSuperUser({
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        telegram_id: form.telegram_id.trim() ? form.telegram_id.trim() : null,
        is_root: form.is_root === "true",
      });
      toast.success("Created");
      setForm({ username:"", first_name:"", last_name:"", password:"", telegram_id:"", is_root:"false" });
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    if (!me?.is_root) {
      toast.error("Only root can delete superusers.");
      return;
    }
    if (!confirm("Delete this superuser?")) return;

    setLoading(true);
    try {
      await deleteSuperUser(id);
      toast.success("Deleted");
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell userLabel={me ? `${me.username}${me.is_root ? " (root)" : ""}` : ""}>
      <div className="grid gap-6">
        <Card title="Superusers" subtitle="View all superusers. Root can create/delete.">
          <div className="overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-[800px] w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left font-semibold border-b border-slate-200">Username</th>
                  <th className="p-3 text-left font-semibold border-b border-slate-200">Name</th>
                  <th className="p-3 text-left font-semibold border-b border-slate-200">Telegram</th>
                  <th className="p-3 text-left font-semibold border-b border-slate-200">Root</th>
                  <th className="p-3 text-left font-semibold border-b border-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="odd:bg-white even:bg-slate-50/30">
                    <td className="p-3 border-b border-slate-100 font-semibold">{u.username}</td>
                    <td className="p-3 border-b border-slate-100">{u.first_name} {u.last_name}</td>
                    <td className="p-3 border-b border-slate-100 text-slate-600">{u.telegram_id || "—"}</td>
                    <td className="p-3 border-b border-slate-100">
                      <span className={u.is_root ? "text-emerald-700 font-semibold" : "text-slate-500"}>{u.is_root ? "yes" : "no"}</span>
                    </td>
                    <td className="p-3 border-b border-slate-100">
                      <Button
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        disabled={!me?.is_root || me.id === u.id}
                        onClick={() => onDelete(u.id)}
                      >
                        Delete
                      </Button>
                      {me?.id === u.id ? <span className="ml-2 text-xs text-slate-500">(you)</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Button variant="secondary" loading={loading} onClick={load}>Refresh</Button>
          </div>
        </Card>

        <Card
          title="Create superuser"
          subtitle={me?.is_root ? "Root only. Creates a new superuser using /superuser/register." : "You are not root. Creation is disabled."}
        >
          <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
            <Input label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required disabled={!me?.is_root} />
            <Input label="Telegram ID (optional)" value={form.telegram_id} onChange={(e) => setForm({ ...form, telegram_id: e.target.value })} disabled={!me?.is_root} />
            <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required disabled={!me?.is_root} />
            <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required disabled={!me?.is_root} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required disabled={!me?.is_root} />
            <Select label="is_root" value={form.is_root} onChange={(e) => setForm({ ...form, is_root: e.target.value })} disabled={!me?.is_root}>
              <option value="false">false</option>
              <option value="true">true</option>
            </Select>

            <div className="md:col-span-2">
              <Button type="submit" loading={loading} disabled={!me?.is_root}>
                Create
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Shell>
  );
}
