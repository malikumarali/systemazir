'use client'

import { useRef, useState } from 'react'
import { Upload, X, AlertCircle, CheckCircle } from 'lucide-react'

interface ExcelUploadProps {
  onData: (data: Record<string, string>) => void
  expectedFields: string[]
}

export default function ExcelUpload({ onData, expectedFields }: ExcelUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle')
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [fileName, setFileName] = useState('')
  const [showPanel, setShowPanel] = useState(false)

  const handleFile = async (file: File) => {
    setFileName(file.name)
    setStatus('parsing')

    try {
      // Dynamic import to avoid SSR issues
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws)

      if (rows.length === 0) {
        setStatus('error')
        setMissingFields(['No data rows found'])
        return
      }

      // Use first row
      const row = rows[0] as Record<string, string>

      // Map common aliases
      const normalized: Record<string, string> = {}
      Object.entries(row).forEach(([k, v]) => {
        normalized[k] = String(v)
        // Normalize key to camelCase
        const camel = k.replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/\s+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toLowerCase())
        normalized[camel] = String(v)
      })

      // Find missing required fields
      const missing = expectedFields.filter(f => !normalized[f] && !Object.keys(normalized).some(k => k.toLowerCase() === f.toLowerCase()))
      setMissingFields(missing)

      onData(normalized)
      setStatus('success')
      setShowPanel(true)
    } catch (err) {
      console.error('Excel parse error:', err)
      setStatus('error')
      setMissingFields(['Failed to parse file. Ensure it is a valid .xlsx or .csv'])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{
          background: 'rgba(92, 124, 250, 0.1)',
          border: '1px solid rgba(92, 124, 250, 0.3)',
          color: '#818cf8',
        }}
        id="excel-upload-btn"
      >
        <Upload className="w-4 h-4" />
        Upload Excel / CSV
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        className="hidden"
        id="excel-file-input"
      />

      {/* Status panel */}
      {showPanel && (
        <div
          className="absolute right-0 top-10 z-50 w-72 rounded-xl p-4 shadow-2xl"
          style={{ background: '#0f1629', border: '1px solid rgba(45, 58, 94, 0.8)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {status === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-white text-sm font-medium">
                {status === 'success' ? 'File imported' : 'Import error'}
              </span>
            </div>
            <button onClick={() => setShowPanel(false)} className="text-gray-500 hover:text-gray-300">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-gray-400 text-xs mb-2 truncate">{fileName}</p>

          {missingFields.length > 0 && (
            <div className="mt-2">
              <p className="text-red-400 text-xs font-medium mb-1">Missing required fields:</p>
              <ul className="space-y-0.5">
                {missingFields.map(f => (
                  <li key={f} className="text-red-300 text-xs flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-gray-500 text-xs mt-2">
                Please fill missing fields manually before saving.
              </p>
            </div>
          )}

          {status === 'success' && missingFields.length === 0 && (
            <p className="text-emerald-400 text-xs">All fields mapped successfully. Review and submit.</p>
          )}
        </div>
      )}
    </div>
  )
}
