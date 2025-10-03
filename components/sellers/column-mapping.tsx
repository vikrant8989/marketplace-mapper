"use client"
import { useMemo, useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { SellerColumn, MarketplaceAttribute } from "@/lib/types"
import { cn } from "@/lib/utils"

type TemplateToSellerMap = Record<string, string>

export interface ColumnMappingPanelProps {
  templateAttributes: MarketplaceAttribute[]
  sellerColumns: SellerColumn[]
  value: TemplateToSellerMap
  onChange: (next: TemplateToSellerMap) => void
  autoMap?: boolean
  disabled?: boolean
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "")
}
function levenshtein(a: string, b: string) {
  const m = a.length,
    n = b.length
  if (!m) return n
  if (!n) return m
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}
function similarity(a: string, b: string) {
  const na = normalize(a)
  const nb = normalize(b)
  if (!na || !nb) return 0
  if (na === nb) return 1
  if (na.includes(nb) || nb.includes(na)) return 0.85
  const maxLen = Math.max(na.length, nb.length)
  const dist = levenshtein(na, nb)
  return 1 - dist / maxLen
}

function computeDefaults(attrs: MarketplaceAttribute[], sellers: SellerColumn[]) {
  const res: TemplateToSellerMap = {}
  const used = new Set<string>()
  const sellerNames = sellers.map((c) => c.name)

  // exact
  for (const a of attrs) {
    const match = sellerNames.find((s) => normalize(s) === normalize(a.name))
    if (match) {
      res[a.name] = match
      used.add(match)
    }
  }
  // similar
  for (const a of attrs) {
    if (res[a.name]) continue
    let best = ""
    let score = 0
    for (const s of sellerNames) {
      if (used.has(s)) continue
      const sc = similarity(a.name, s)
      if (sc > score) {
        score = sc
        best = s
      }
    }
    if (score >= 0.7 && best) {
      res[a.name] = best
      used.add(best)
    }
  }
  return res
}

export default function ColumnMappingPanel({
  templateAttributes,
  sellerColumns,
  value,
  onChange,
  autoMap = true,
  disabled,
}: ColumnMappingPanelProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!autoMap || !templateAttributes.length || !sellerColumns.length) return
    const defaults = computeDefaults(templateAttributes, sellerColumns)
    // fill only empty keys
    const merged = { ...value }
    let changed = false
    for (const a of templateAttributes) {
      if (!merged[a.name] && defaults[a.name]) {
        merged[a.name] = defaults[a.name]
        changed = true
      }
    }
    if (changed) onChange(merged)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMap, templateAttributes, sellerColumns])

  const requiredNames = useMemo(
    () => new Set(templateAttributes.filter((a) => a.required).map((a) => a.name)),
    [templateAttributes],
  )
  const counts = useMemo(() => {
    const total = templateAttributes.length
    const mapped = Object.values(value).filter(Boolean).length
    const requiredTotal = requiredNames.size
    const requiredMapped = Array.from(requiredNames).filter((n) => !!value[n]).length
    return { total, mapped, requiredTotal, requiredMapped }
  }, [templateAttributes, value, requiredNames])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Column Mapping</h3>
        <div className="text-sm">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-medium text-blue-600">{counts.mapped}</span>
          <span className="text-muted-foreground"> of </span>
          <span className="font-medium">{counts.total}</span>
          {counts.requiredTotal > 0 && (
            <>
              <span className="text-muted-foreground mx-2">|</span>
              <span className="text-muted-foreground">Required: </span>
              <span
                className={
                  counts.requiredMapped === counts.requiredTotal
                    ? "text-green-600 font-medium"
                    : "text-red-600 font-medium"
                }
              >
                {counts.requiredMapped}
              </span>
              <span className="text-muted-foreground"> of </span>
              <span className="font-medium">{counts.requiredTotal}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
        {templateAttributes.map((attr) => {
          const selected = value[attr.name] || ""
          const isReq = attr.required
          return (
            <div key={attr.name} className="flex items-center gap-4">
              <div
                className={cn(
                  "flex-1 rounded-lg border p-3",
                  isReq ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200",
                )}
              >
                <div className="flex items-center justify-between">
                  <p className={cn("text-sm font-medium", isReq ? "text-red-900" : "text-green-900")}>{attr.name}</p>
                  {isReq && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Type: {attr.type}
                  {attr.maxLength ? ` | Max: ${attr.maxLength}` : ""}
                </p>
              </div>

              <div className="flex-1">
                <Popover
                  open={!!open[attr.name]}
                  onOpenChange={(o) => setOpen((prev) => ({ ...prev, [attr.name]: o }))}
                >
                  <PopoverTrigger
                    disabled={disabled}
                    className={cn(
                      "w-full inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm bg-background hover:bg-accent/50",
                      disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    )}
                  >
                    <span className={selected ? "text-foreground truncate" : "text-muted-foreground truncate"}>
                      {selected || "Select column..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-(--radix-popover-trigger-width)">
                    <Command>
                      <CommandInput placeholder="Search columns..." />
                      <CommandEmpty>No columns found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              onChange({ ...value, [attr.name]: "" })
                              setOpen((prev) => ({ ...prev, [attr.name]: false }))
                            }}
                          >
                            <span className="text-muted-foreground">Clear selection</span>
                          </CommandItem>
                          {sellerColumns.map((col) => (
                            <CommandItem
                              key={col.name}
                              onSelect={() => {
                                onChange({ ...value, [attr.name]: col.name })
                                setOpen((prev) => ({ ...prev, [attr.name]: false }))
                              }}
                              className="flex items-center justify-between"
                            >
                              <span className="truncate">{col.name}</span>
                              {selected === col.name ? <Check className="h-4 w-4 text-primary" /> : null}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
