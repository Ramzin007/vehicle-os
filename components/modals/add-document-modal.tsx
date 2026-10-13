"use client";

import { useState } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { useVehicle } from "@/components/context/vehicle-context";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDocumentModal({ isOpen, onClose, onSuccess }: AddDocumentModalProps) {
  const { activeVehicle } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState("RC");
  const [title, setTitle] = useState("Registration Certificate (RC)");
  const [documentNumber, setDocumentNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === "RC") setTitle("Registration Certificate (RC)");
    else if (newType === "INSURANCE") setTitle("Insurance Policy");
    else if (newType === "PUC") setTitle("Pollution Under Control (PUC)");
    else if (newType === "LICENSE") setTitle("Driving License");
    else if (newType === "FITNESS") setTitle("Fitness Certificate");
    else setTitle("Vehicle Document");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVehicle) {
      setError("No active vehicle selected");
      return;
    }
    if (!title) {
      setError("Please enter a document title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: activeVehicle.id,
          title,
          type,
          documentNumber: documentNumber || null,
          provider: provider || null,
          issueDate: issueDate ? new Date(issueDate).toISOString() : null,
          expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
          notes: notes || null,
          fileUrl: fileUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save document");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Add Vehicle Document</h2>
              <p className="text-xs text-zinc-400">Track validity and expiration alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Document Type</label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="RC">RC (Registration)</option>
                <option value="INSURANCE">Insurance Policy</option>
                <option value="PUC">PUC (Emission)</option>
                <option value="LICENSE">Driving License</option>
                <option value="FITNESS">Fitness Certificate</option>
                <option value="OTHER">Other / Warranty</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Document Number</label>
              <input
                type="text"
                placeholder="e.g. KL102024..."
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Title / Label</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Issuing Authority / Provider</label>
            <input
              type="text"
              placeholder="e.g. HDFC ERGO / Transport Dept"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Issue Date (Optional)</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Digital copy stored in DigiLocker"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Document Attachment / Photo */}
          <div>
            <label className="text-xs font-medium text-zinc-400">Attach Document Scan or Photo</label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/60 p-3 text-xs text-zinc-400 hover:border-blue-500 hover:text-blue-400 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                <span className="truncate">
                  {fileName ? fileName : "Upload RC / Insurance photo (Max 5MB)"}
                </span>
              </label>

              {fileUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setFileUrl(null);
                    setFileName(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 p-2"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500 py-2.5 text-xs font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
