import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtBRL(value: number): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (value < 0 ? '−R$ ' : 'R$ ') + formatted
}

export function fmtPct(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%'
}

export function fmtDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

export function parseLocalDate(str: string | null | undefined): Date | null {
  if (!str) return null
  const s = str.trim()
  let m: RegExpMatchArray | null
  if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) return new Date(+m[3], +m[2] - 1, +m[1])
  if ((m = s.match(/^(\d{4})-(\d{2})-(\d{2})/)))       return new Date(+m[1], +m[2] - 1, +m[3])
  if ((m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)))   return new Date(+m[3], +m[2] - 1, +m[1])
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export function toDateStr(d: Date | null): string | null {
  if (!d) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function toNum(v: unknown): number {
  return parseFloat(String(v ?? 0).replace(/\./g, '').replace(',', '.')) || 0
}

export function pickCol(row: Record<string, unknown>, keys: string[]): unknown {
  const norm = (k: string) => k.toLowerCase().replace(/[\s\-]/g, '_')
  for (const k of keys) {
    const found = Object.keys(row).find(rk => norm(rk) === norm(k))
    if (found !== undefined && row[found] !== null && row[found] !== '') return row[found]
  }
  return null
}

export function dlCSV(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}
