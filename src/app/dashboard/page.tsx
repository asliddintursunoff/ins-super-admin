"use client";

import React from "react";
import { toast } from "sonner";
import { Shell } from "@/components/Shell";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Select } from "@/components/Select";
import { PROGRAMS, YEARS, type AcademicYear, type Program } from "@/lib/constants";
import { getMatrix, downloadMatrixExcel, superMe } from "@/lib/api";
import type { MatrixResponse } from "@/lib/types";

function cellClass(status: string, absence?: number, late?: number) {
  if (status === "na") return "bg-slate-50 text-slate-400";
  if (status === "dropped") return "bg-amber-50 text-amber-800";
  // enrolled
  const a = absence || 0;
  const l = late || 0;
  if (a === 0 && l === 0) return "bg-emerald-50 text-emerald-800";
  if (a <= 1 && l <= 1) return "bg-sky-50 text-sky-800";
  return "bg-rose-50 text-rose-800";
}

export default function DashboardPage() {
  const [meLabel, setMeLabel] = React.useState<string>("");

  const [program, setProgram] = React.useState<Program>("BM");
  const [year, setYear] = React.useState<AcademicYear>("freshman");
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<MatrixResponse | null>(null);

  // Mobile UX: select ONE subject and show per-student status as cards
  const [mobileSubjectId, setMobileSubjectId] = React.useState<string>("");

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

  async function load() {
    setLoading(true);
    try {
      const res = await getMatrix(program, year);
      setData(res);
      if (!mobileSubjectId && res?.subjects?.length) {
        setMobileSubjectId(res.subjects[0].id);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to load matrix");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!data?.subjects?.length) return;
    if (!mobileSubjectId || !data.subjects.some((s) => s.id === mobileSubjectId)) {
      setMobileSubjectId(data.subjects[0].id);
    }
  }, [data, mobileSubjectId]);

  async function onDownload() {
    try {
      await downloadMatrixExcel(program, year);
      toast.success("Excel downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Download failed");
    }
  }

  return (
    <Shell userLabel={meLabel}>
      <div className="grid gap-6">
        <Card
          title="Attendance Matrix"
          subtitle="Pick program + year. Columns are subjects from your API response. Cells show absence/late."
        >
          <div className="grid gap-3 md:grid-cols-4 md:items-end">
            <Select label="Program" value={program} onChange={(e) => setProgram(e.target.value as Program)}>
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>

            <Select label="Academic year" value={year} onChange={(e) => setYear(e.target.value as AcademicYear)}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>

            <Button variant="secondary" loading={loading} onClick={load}>
              Refresh
            </Button>

            <Button onClick={onDownload} variant="primary">
              Download Excel
            </Button>
          </div>
        </Card>

        <Card
          title="Matrix"
          subtitle={
            data
              ? `Program ${data.program}, cohort ${data.cohort}. Students: ${data.rows.length}. Subjects: ${data.subjects.length}.`
              : "No data"
          }
        >
          {!data ? (
            <div className="text-sm text-slate-600">No data loaded.</div>
          ) : (
            <div className="grid gap-3">
              {/* Mobile-friendly view */}
              <div className="md:hidden grid gap-3">
                <Select label="Subject" value={mobileSubjectId} onChange={(e) => setMobileSubjectId(e.target.value)}>
                  {data.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {(s.short_name ? `${s.short_name} — ` : "") + s.name}
                    </option>
                  ))}
                </Select>

                <div className="grid gap-2">
                  {data.rows.map((r) => {
                    const cell = r.cells[mobileSubjectId];
                    const label = `${r.student.last_name} ${r.student.first_name}`;

                    return (
                      <div
                        key={r.student.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold leading-5 truncate">{label}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">
                            {r.student.student_id} • {r.student.group_name}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {!cell ? (
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">—</span>
                          ) : cell.status === "enrolled" ? (
                            <span
                              className={
                                "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold " +
                                cellClass(cell.status, cell.absence, cell.late)
                              }
                            >
                              A:{cell.absence} L:{cell.late}
                            </span>
                          ) : (
                            <span
                              className={
                                "inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold " +
                                cellClass(cell.status)
                              }
                            >
                              {cell.status}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-xs text-slate-500">
                  Tip: The full “Excel-like” table view is available on desktop / larger screens.
                </div>
              </div>

              {/* Desktop view: full matrix table */}
              <div className="hidden md:block overflow-auto rounded-xl border border-slate-200 bg-white">
                <table className="min-w-[1100px] w-full text-sm">
                  <thead className="sticky top-0 bg-slate-50">
                    <tr>
                      <th className="p-3 text-left font-semibold border-b border-slate-200">Student</th>
                      <th className="p-3 text-left font-semibold border-b border-slate-200">Group</th>
                      {data.subjects.map((s) => (
                        <th key={s.id} className="p-3 text-left font-semibold border-b border-slate-200">
                          <div className="leading-4">{s.short_name || "—"}</div>
                          <div className="text-xs text-slate-500">{s.name}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((r) => (
                      <tr key={r.student.id} className="odd:bg-white even:bg-slate-50/30">
                        <td className="p-3 border-b border-slate-100">
                          <div className="font-semibold">
                            {r.student.last_name} {r.student.first_name}
                          </div>
                          <div className="text-xs text-slate-500">{r.student.student_id}</div>
                        </td>
                        <td className="p-3 border-b border-slate-100">{r.student.group_name}</td>
                        {data.subjects.map((s) => {
                          const cell = r.cells[s.id];
                          if (!cell)
                            return (
                              <td key={s.id} className="p-3 border-b border-slate-100 text-slate-400">
                                —
                              </td>
                            );

                          if (cell.status === "enrolled") {
                            return (
                              <td key={s.id} className={"p-3 border-b border-slate-100"}>
                                <span
                                  className={
                                    "inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold " +
                                    cellClass(cell.status, cell.absence, cell.late)
                                  }
                                >
                                  A:{cell.absence} L:{cell.late}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td key={s.id} className={"p-3 border-b border-slate-100"}>
                              <span
                                className={
                                  "inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold " + cellClass(cell.status)
                                }
                              >
                                {cell.status}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Shell>
  );
}
