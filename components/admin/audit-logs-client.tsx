"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Search, ShieldAlert, Clock, User, Activity } from "lucide-react"

export interface AuditLogItem {
  id: string
  action: string
  target_type: string
  target_id: string | null
  actor_email: string | null
  ip_address: string | null
  details: Record<string, any>
  created_at: string
}

interface AuditLogsClientProps {
  initialLogs: AuditLogItem[]
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs)
  const [search, setSearch] = useState("")

  const filtered = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target_type.toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_email && log.actor_email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            Security & Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable tracking of administrator logins, event edits, category modifications, and role updates
          </p>
        </div>

        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-950/30 gap-1.5 self-start">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Engine Active
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Filter audit logs by action, admin, or target..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs h-10"
        />
      </div>

      {/* Logs Table */}
      <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
        <CardHeader className="pb-3 border-b border-slate-800">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Recent Administrative Activity ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor / Admin</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {log.actor_email || "System"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="uppercase text-[10px] font-bold text-slate-500 mr-1">{log.target_type}:</span>
                    <span className="font-mono">{log.target_id ? log.target_id.slice(0, 8) : "N/A"}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {log.ip_address || "127.0.0.1"}
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No audit records logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
