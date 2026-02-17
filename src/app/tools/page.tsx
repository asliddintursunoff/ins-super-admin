"use client";

import React from "react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { rebase, superMe } from "@/lib/api";

type ToolKey = "subjects" | "proffs" | "groups" | "classes" | "users";

export default function ToolsPage() {
  const [meLabel, setMeLabel] = React.useState("");
  const [tool, setTool] = React.useState<ToolKey>("subjects");
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await superMe();
        setMeLabel(`${me.username}${me.is_root ? " (root)" : ""}`);
      } catch {
        setMeLabel("");
      }
    })();
  }, []);

  async function onUpload() {
    if (!file) {
      toast.error("Choose a CSV file first");
      return;
    }
    setLoading(true);
    try {
      const fn = rebase[tool];
      await fn(file);
      toast.success("Uploaded successfully");
      setFile(null);
      // reset input value by re-render
      const el = document.getElementById("csvfile") as HTMLInputElement | null;
      if (el) el.value = "";
    } catch (e: any) {
      toast.error(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell userLabel={meLabel}>
      <div className="grid gap-6">
        <Card title="CSV Rebase Tools" subtitle="Uploads multipart/form-data file to your rebase endpoints.">
          <div className="grid gap-3 md:grid-cols-3 md:items-end">
            <Select label="Tool" value={tool} onChange={(e) => setTool(e.target.value as ToolKey)}>
              <option value="subjects">/subjects/rebase-with-csv</option>
              <option value="proffs">/proffs/rebase-with-csv</option>
              <option value="groups">/group/rebase-with-csv</option>
              <option value="classes">/class/rebase-with-csv</option>
              <option value="users">/user/rebase-with-csv</option>
            </Select>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">CSV file</span>
              <input
                id="csvfile"
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              />
            </label>

            <Button onClick={onUpload} loading={loading}>
              Upload
            </Button>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            Make sure your CSV matches the backend format used by your service.
          </div>
        </Card>
      </div>
    </Shell>
  );
}
