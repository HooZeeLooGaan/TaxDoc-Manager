import { useEffect, useState } from "react";
import type { ClientResponse } from "../services/client";
import { getClientRequirements } from "../services/requirement";

interface DocumentRequirement {
    id: string;
    documentType: string;
    belongingTo: "Primary" | "Spouse";
    source: "Derived" | "System Sync" | "Manual";
    status: "OK" | "PEND";
    linkedFile?: string;
}

interface PendingReviewFile {
    id: string;
    fileName: string;
    aiGuessType: string;
    confidence: number;
    taxpayer: string;
    taxYear: number;
}

interface ClientRequirementsProps {
    client: ClientResponse;
    onClose?: () => void;
}

export default function ClientRequirements({ client, onClose }: ClientRequirementsProps) {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string|null>(null);

    const [reviewQueue, setReviewQueue] = useState<PendingReviewFile[]>([]);
    const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
    const [selectedDocTypes, setSelectedDocTypes] = useState<Record<string, string>>({});

    useEffect(() => {
        let mounted = true
        setLoading(true)
        setError(null)
        async function fetchClientRequirements(){
            try{
                const response = await getClientRequirements(client.id)
                if (mounted) {
                    setRequirements(response)
                    setLoading(false)
                }
            } catch(err: any){
                if(mounted){
                    setError(err.message)
                    setLoading(false)
                }
            }
        }

        fetchClientRequirements()
        return (() =>{
            mounted = false
        })
    },[client.id])

    const handleConfirmAssign = (fileId: string) => {
        const file = reviewQueue.find((f) => f.id === fileId);
        if (!file) return;

        const assignedType = selectedDocTypes[fileId] || file.aiGuessType;

        setRequirements((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                documentType: assignedType,
                belongingTo: file.taxpayer === "Jane" ? "Spouse" : "Primary",
                source: "Manual",
                status: "OK",
                linkedFile: file.fileName,
            },
        ]);

        setReviewQueue((prev) => prev.filter((f) => f.id !== fileId));
    };

    const handleReject = (fileId: string) => {
        setReviewQueue((prev) => prev.filter((f) => f.id !== fileId));
    };

    const handleAddManualRequirement = () => {
        const docName = prompt("Enter requirement name (e.g., 1099-INT, 1098 Mortgage):");
        if (!docName) return;

        setRequirements((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                documentType: docName,
                belongingTo: "Primary",
                source: "Manual",
                status: "PEND",
            },
        ]);
    };

    const handleWaiveItem = (reqId: string) => {
        setRequirements((prev) => prev.filter((r) => r.id !== reqId));
    };

    const totalReqs = requirements.length;
    const fulfilledReqs = requirements.filter((r) => r.status === "OK").length;
    const progressPercent = totalReqs > 0 ? Math.round((fulfilledReqs / totalReqs) * 100) : 0;

    return (
        <>
        {loading && (
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-400">
            <span className="animate-pulse">Loading client details...</span>
        </div>
        )}

        {error && (
        <div className="m-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <p className="font-semibold">Error loading client requirements</p>
            <p className="mt-1">{error}</p>
        </div>
        )}

        {!loading && !error &&
        <aside className="w-full h-9/10 flex flex-col bg-white border-l border-slate-300 font-sans text-xs text-slate-800 overflow-hidden shadow-2xl">
            {/* CLIENT HEADER */}
            <header className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Client and Spouse names stacked on separate lines */}
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm leading-tight">
                        Client: {client.primary_name || "John Doe"}
                        </span>
                        {client.spouse_name && (
                        <span className="font-medium text-slate-700 text-xs leading-tight">
                            Spouse: {client.spouse_name}
                        </span>
                        )}
                    </div>

                    {/* Tax Year Badge */}
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px] border border-slate-300">
                        TY {client.tax_year || "2025"}
                    </span>

                    {/* Progress Bar Widget */}
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-300">
                        <span className="font-semibold text-slate-600">Overall Intake Progress:</span>
                        <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
                        <div className="bg-emerald-600 h-full" style={{ width: `${progressPercent}%` }} />
                        </div>
                        <span className="font-bold text-slate-800">
                        [{progressPercent}%] ({fulfilledReqs}/{totalReqs})
                        </span>
                    </div>
                    </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-1 text-slate-500 hover:text-slate-800 font-bold text-base cursor-pointer"
                        title="Close Panel"
                    >
                        ✕
                    </button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
                {/* ⚠️ ATTENTION REQUIRED */}
                {reviewQueue.length > 0 && (
                    <section className="border border-amber-300 bg-amber-50/60 rounded-md p-3 space-y-3">
                        <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                            <span>⚠️ ATTENTION REQUIRED</span>
                            <span>({reviewQueue.length} files pending manual review)</span>
                        </div>

                        {reviewQueue.map((file) => (
                            <div key={file.id} className="bg-white border border-amber-300 rounded p-3 space-y-2 shadow-xs">
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2 font-mono text-slate-800">
                                        <span className="text-slate-500">📄 [PDF Icon]</span>
                                        <span className="font-bold">{file.fileName}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <span>
                                            AI Guess: <strong className="text-slate-900">{file.aiGuessType}</strong> ({file.confidence}% Conf)
                                        </span>
                                        <span>|</span>
                                        <span>Taxpayer: <strong className="text-slate-900">{file.taxpayer}</strong></span>
                                        <span>|</span>
                                        <span>Year: <strong className="text-slate-900">{file.taxYear}</strong></span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1">
                                    <button
                                        onClick={() => alert(`Previewing ${file.fileName}`)}
                                        className="text-indigo-600 hover:underline font-medium"
                                    >
                                        [View Thumbnail]
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500 font-medium">Options:</span>
                                        <select
                                            className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                                            value={selectedDocTypes[file.id] || file.aiGuessType}
                                            onChange={(e) =>
                                                setSelectedDocTypes({ ...selectedDocTypes, [file.id]: e.target.value })
                                            }
                                        >
                                            <option value="W-2">W-2</option>
                                            <option value="Form 1040">Form 1040</option>
                                            <option value="1099-INT">1099-INT</option>
                                            <option value="1099-MISC">1099-MISC</option>
                                            <option value="Government ID">Government ID</option>
                                        </select>

                                        <button
                                            onClick={() => handleConfirmAssign(file.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded"
                                        >
                                            Confirm & Assign
                                        </button>

                                        <button
                                            onClick={() => handleReject(file.id)}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold px-2.5 py-1 rounded"
                                        >
                                            Reject / Blurry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* REQUIRED DOCUMENTS */}
                <section className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-xs">
                    <div className="p-3 bg-slate-100 border-b border-slate-300 flex items-center justify-between">
                        <span className="font-bold text-slate-800 uppercase tracking-wider">REQUIRED DOCUMENTS</span>
                        <button
                            onClick={handleAddManualRequirement}
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-indigo-700 font-bold px-2.5 py-1 rounded shadow-2xs"
                        >
                            + Add Manual Requirement
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                                    <th className="p-2.5 border-r border-slate-200">Status</th>
                                    <th className="p-2.5 border-r border-slate-200">Document Type</th>
                                    <th className="p-2.5 border-r border-slate-200">Belonging To</th>
                                    <th className="p-2.5 border-r border-slate-200">Source</th>
                                    <th className="p-2.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {(!requirements || requirements.length === 0) && 
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-slate-500 font-medium">No requirement documents specified for the client</td>    
                                </tr>}
                                {requirements.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/80">
                                        <td className="p-2.5 border-r border-slate-200 font-bold">
                                            {req.status === "OK" ? (
                                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                                    ✅ OK
                                                </span>
                                            ) : (
                                                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                    ⏳ PEND
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">
                                            {req.documentType}
                                        </td>
                                        <td className="p-2.5 border-r border-slate-200 text-slate-600">
                                            {req.belongingTo}
                                        </td>
                                        <td className="p-2.5 border-r border-slate-200 text-slate-600">
                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-200">
                                                {req.source}
                                            </span>
                                        </td>
                                        <td className="p-2.5">
                                            {req.status === "OK" ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => alert(`Opening ${req.linkedFile}`)}
                                                        className="text-indigo-600 hover:underline font-medium"
                                                    >
                                                        [View File]
                                                    </button>
                                                    <button
                                                        onClick={() => handleWaiveItem(req.id)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        [Unlink]
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => alert(`Uploading file for ${req.documentType}`)}
                                                        className="text-indigo-600 hover:underline font-medium"
                                                    >
                                                        [Upload File]
                                                    </button>
                                                    <button
                                                        onClick={() => handleWaiveItem(req.id)}
                                                        className="text-rose-600 hover:underline font-medium"
                                                    >
                                                        [Waive Item]
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* FAST UPLOAD */}
                <section className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-xs">
                    <div className="p-2.5 bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase tracking-wider">
                        FAST UPLOAD
                    </div>
                    <div className="p-6 border-2 border-dashed border-slate-300 m-3 rounded text-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
                        <span className="text-slate-600 font-medium">
                            Drag & Drop client files here or{" "}
                            <span className="text-indigo-600 font-bold underline">[Browse Files]</span>
                        </span>
                    </div>
                </section>
            </div>
        </aside>
        }
        </>
    );
}