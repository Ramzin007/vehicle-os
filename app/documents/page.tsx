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
  Eye,
  ExternalLink,
  X,
  Edit2,
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
  const [selectedDoc, setSelectedDoc] = useState<EnrichedDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<EnrichedDocument | null>(null);

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
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8">
      {/* Header & Add CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            Vehicle Documents
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {activeVehicle ? `${activeVehicle.name} • ${activeVehicle.model}` : "Compliance & validity"}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-amber-400 shadow-lg shadow-amber-500/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      {/* Expiry Status Cards */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">Active</p>
          <p className="mt-1 text-3xl font-bold text-emerald-400 font-mono tabular-nums">{activeCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">Expiring Soon</p>
          <p className="mt-1 text-3xl font-bold text-amber-400 font-mono tabular-nums">{expiringSoonCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
          <p className="text-[11px] uppercase font-semibold text-zinc-400 tracking-wider">Expired</p>
          <p className="mt-1 text-3xl font-bold text-rose-400 font-mono tabular-nums">{expiredCount}</p>
        </div>
      </div>

      {/* Document Cards */}
      <section className="flex flex-col gap-3">
        {documents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/40">
            <FileText className="mx-auto h-8 w-8 text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-zinc-300">No documents tracked</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
              Add your Registration Certificate (RC), Insurance Policy, and Pollution certificate to monitor renewal dates.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400"
            >
              Add First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 transition hover:border-zinc-750 flex flex-col justify-between"
              >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-zinc-100">
                      {doc.title}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold font-mono ${doc.badgeClass}`}
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
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 border-t border-zinc-800/60 pt-2.5 font-mono">
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

                  {doc.fileUrl && (
                    <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Attachment</span>
                      </button>
                      <span className="text-[10px] text-zinc-500 font-mono">Scan available</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingDoc(doc)}
                      className="text-zinc-500 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Edit document"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800 transition"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </section>

      {/* Document View / Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{selectedDoc.title}</h3>
                <p className="text-xs text-zinc-400 font-mono">{selectedDoc.documentNumber || "No document number"}</p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-auto flex items-center justify-center bg-zinc-950 rounded-2xl p-2 border border-zinc-800 min-h-[260px]">
              {selectedDoc.fileUrl?.startsWith("data:image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedDoc.fileUrl}
                  alt={selectedDoc.title}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-md"
                />
              ) : selectedDoc.fileUrl?.startsWith("data:application/pdf") ? (
                <div className="text-center p-6">
                  <FileText className="mx-auto h-12 w-12 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold text-zinc-200">PDF Document Stored</p>
                  <a
                    href={selectedDoc.fileUrl}
                    download={`${selectedDoc.title}.pdf`}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                </div>
              ) : (
                <div className="text-center p-6 text-xs text-zinc-500">
                  Attachment format preview not directly supported.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <AddDocumentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchDocs}
        />
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <AddDocumentModal
          isOpen={Boolean(editingDoc)}
          initialData={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSuccess={() => {
            setEditingDoc(null);
            fetchDocs();
          }}
        />
      )}
    </div>
  );
}
