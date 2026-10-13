"use client";

import { useEffect, useState, useCallback } from "react";
import { useVehicle } from "@/components/context/vehicle-context";
import AddDocumentModal from "@/components/modals/add-document-modal";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  Building,
} from "lucide-react";

interface EnrichedDocument {
  id: string;
  vehicleId: string;
  title: string;
  type: string;
  documentNumber?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  provider?: string | null;
  notes?: string | null;
  fileUrl?: string | null;
  computedStatus: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NO_DATE";
  statusLabel: string;
  daysRemaining: number | null;
  badgeClass: string;
}

export default function DocumentsPage() {
  const { activeVehicle } = useVehicle();
  const [documents, setDocuments] = useState<EnrichedDocument[]>([]);
  const [_loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!activeVehicle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/documents?vehicleId=${activeVehicle.id}`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeVehicle]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchDocs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const expiringSoonCount = documents.filter((d) => d.computedStatus === "EXPIRING_SOON").length;
  const expiredCount = documents.filter((d) => d.computedStatus === "EXPIRED").length;
  const activeCount = documents.filter((d) => d.computedStatus === "ACTIVE").length;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-5">
      {/* Header & Add CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Vehicle Documents
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Compliance & validity"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Expiry Status Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3">
          <p className="text-[10px] uppercase font-semibold text-zinc-500">Active</p>
          <p className="mt-1 text-xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3">
          <p className="text-[10px] uppercase font-semibold text-zinc-500">Expiring Soon</p>
          <p className="mt-1 text-xl font-bold text-amber-400">{expiringSoonCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3">
          <p className="text-[10px] uppercase font-semibold text-zinc-500">Expired</p>
          <p className="mt-1 text-xl font-bold text-red-400">{expiredCount}</p>
        </div>
      </div>

      {/* Document Cards */}
      <section className="flex flex-col gap-3">
        {documents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No documents tracked</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Add your Registration Certificate (RC), Insurance Policy, and Pollution certificate to monitor renewal dates.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400"
            >
              Add First Document
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 transition hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-zinc-100">
                      {doc.title}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${doc.badgeClass}`}
                    >
                      {doc.statusLabel}
                    </span>
                  </div>

                  {/* Document Number & Provider */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-400">
                    {doc.documentNumber && (
                      <span className="font-mono text-[11px] text-zinc-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {doc.documentNumber}
                      </span>
                    )}

                    {doc.provider && (
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Building className="h-3 w-3 text-zinc-500" />
                        {doc.provider}
                      </span>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 border-t border-zinc-800/60 pt-2.5">
                    {doc.issueDate && (
                      <span>
                        Issued: {new Date(doc.issueDate).toLocaleDateString()}
                      </span>
                    )}
                    {doc.expiryDate && (
                      <span className="flex items-center gap-1 font-medium text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        Expires: {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="mt-2 text-xs text-zinc-400 italic">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-zinc-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete document"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchDocs}
        />
      )}
    </div>
  );
}
