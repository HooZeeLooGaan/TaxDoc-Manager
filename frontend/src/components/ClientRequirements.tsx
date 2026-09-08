// import { useEffect, useState } from "react"
// import { getClientById } from "../services/client"
// import { type RequirementStatus, getClientRequirements } from "../services/requirement"

// interface ClientRequirementProps{
//     clientId: string,    
//     onClose?: () => void
// }

// export default function ClientRequirements({clientId, onClose}: ClientRequirementProps){
//     const [loading, setLoading] = useState<boolean>(true)
//     const [error, setError] = useState<string | null>(null)
//     const [clientInfo, setClientInfo] = useState<any>(null)
//     const [clientRequirements, setClientRequirements] = useState<any[]>([])

//     useEffect(()=>{
//         let mounted = true

//         const fetchClientData = async() =>{
//             setLoading(true)
//             setError(null)

//             try{
//                 const [clientResponse, requirementResponse] = await Promise.all([
//                     getClientById(clientId),
//                     getClientRequirements(clientId)
//                 ])

//                 if(mounted){
//                     setClientInfo(clientResponse)
//                     setClientRequirements(requirementResponse)
//                     setLoading(false)
//                 }
//             }
//             catch(err: any){
//                 if (mounted) {
//                     setLoading(false)
//                     setError(err.message || "Failed to fetch clients")
//                 }
//             }
//         }

//         if(clientId){
//             fetchClientData()
//         }
//         return () => {
//             mounted = false
//         }
//     },[clientId])

//     const handleStatusChange = async (reqId: string, newStatus: string) => {
//         try {
//             // const updated = await updateRequirement(reqId, { status: newStatus })
//             // setRequirements((prev) =>
//             //     prev.map((req) => (req.id === reqId ? updated : req))
//             // )
//             return
//         } catch (err: any) {
//             alert("Failed to update requirement status: " + (err.message || "Server error"))
//         }
//     }

//     const getStatusStyle = (status: string) => {
//         switch (status) {
//             case "FULFILLED":
//                 return "bg-emerald-50 text-emerald-700 border-emerald-200"
//             case "WAIVED":
//                 return "bg-slate-100 text-slate-600 border-slate-200"
//             case "PENDING":
//             default:
//                 return "bg-amber-50 text-amber-700 border-amber-200"
//         }
//     }

//     return (
//         <aside className="w-full h-full min-h-screen flex flex-col bg-white border-l border-slate-200 shadow-lg font-sans">
//             {/* ---------------- Sticky Header with Personal Details ---------------- */}
//             <div className="p-6 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 flex flex-col gap-4">
//                 <div className="flex items-start justify-between">
//                     <div>
//                         <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
//                             Client Workspace
//                         </span>
//                         <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-1">
//                             {clientInfo?.name || "Tax Requirements"}
//                         </h2>
//                     </div>

//                     {/* Close Button */}
//                     {onClose && (
//                         <button
//                             onClick={onClose}
//                             className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
//                             aria-label="Close panel"
//                         >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                             </svg>
//                         </button>
//                     )}
//                 </div>

//                 {/* Personal Details Information Box */}
//                 <div className="grid grid-cols-3 gap-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
//                     <div>
//                         <span className="text-slate-400 block font-medium text-[11px]">Primary Taxpayer</span>
//                         <span className="font-semibold text-slate-700 mt-0.5 block truncate">
//                             {clientInfo?.primary_name || "—"}
//                         </span>
//                     </div>

//                     <div>
//                         <span className="text-slate-400 block font-medium text-[11px]">Spouse Name</span>
//                         <span className="font-semibold text-slate-700 mt-0.5 block truncate">
//                             {clientInfo?.spouse_name || "N/A"}
//                         </span>
//                     </div>

//                     <div>
//                         <span className="text-slate-400 block font-medium text-[11px]">Tax Year</span>
//                         <span className="font-bold text-indigo-700 mt-0.5 block">
//                             {clientInfo?.tax_year ? `TY ${clientInfo.tax_year}` : "—"}
//                         </span>
//                     </div>
//                 </div>
//             </div>

//             {/* ---------------- Scrollable Requirements Workspace ---------------- */}
//             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
//                 {/* Loading State */}
//                 {loading && (
//                     <div className="flex flex-col items-center justify-center h-64 text-slate-400">
//                         <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
//                         <p className="text-xs font-medium">Fetching document requirements...</p>
//                     </div>
//                 )}

//                 {/* Error State */}
//                 {error && (
//                     <div className="p-4 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium">
//                         {error}
//                     </div>
//                 )}

//                 {/* Empty State */}
//                 {!loading && !error && clientRequirements.length === 0 && (
//                     <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200 p-8">
//                         <h3 className="text-sm font-semibold text-slate-700">No Document Requirements</h3>
//                         <p className="text-xs text-slate-400 mt-1">
//                             There are currently no tax document requirements flagged for this client.
//                         </p>
//                     </div>
//                 )}

//                 {/* Requirements List */}
//                 {!loading && !error && clientRequirements.length > 0 && (
//                     <div className="space-y-3">
//                         <div className="flex items-center justify-between px-1 mb-1">
//                             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                                 Required Documents ({clientRequirements.length})
//                             </span>
//                         </div>

//                         {clientRequirements.map((req) => (
//                             <div
//                                 key={req.id}
//                                 className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-start justify-between gap-4"
//                             >
//                                 {/* Left Info Block */}
//                                 <div className="space-y-1.5 flex-1">
//                                     <div className="flex items-center gap-2">
//                                         <span className="font-bold text-slate-800 text-sm">
//                                             {req.document_type}
//                                         </span>
//                                         {req.is_mandatory && (
//                                             <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
//                                                 Required
//                                             </span>
//                                         )}
//                                     </div>

//                                     {req.description && (
//                                         <p className="text-xs text-slate-500 leading-relaxed">
//                                             {req.description}
//                                         </p>
//                                     )}

//                                     <div className="flex items-center gap-2 pt-1">
//                                         <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-tight">
//                                             Source: {req.source}
//                                         </span>
//                                     </div>
//                                 </div>

//                                 {/* Right Status Switcher */}
//                                 <div className="flex-shrink-0">
//                                     <select
//                                         value={req.status}
//                                         onChange={(e) => handleStatusChange(req.id," e.target.value as RequirementStatus")}
//                                         className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-all ${getStatusStyle(
//                                             req.status
//                                         )}`}
//                                     >
//                                         <option value="PENDING">PENDING</option>
//                                         <option value="FULFILLED">FULFILLED</option>
//                                         <option value="WAIVED">WAIVED</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>
//         </aside>
//     )
// }
import React, { useState } from "react";
import type { ClientResponse } from "../services/client";

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
    const [reviewQueue, setReviewQueue] = useState<PendingReviewFile[]>([
        {
            id: "f1",
            fileName: "Scan_2026_03.pdf",
            aiGuessType: "W-2",
            confidence: 62,
            taxpayer: "John",
            taxYear: 2025,
        },
        {
            id: "f2",
            fileName: "IMG_0092.JPG",
            aiGuessType: "1099-MISC",
            confidence: 45,
            taxpayer: "Jane",
            taxYear: 2025,
        },
    ]);

    const [requirements, setRequirements] = useState<DocumentRequirement[]>([
        { id: "1", documentType: "Form 1040 (Prior Year)", belongingTo: "Primary", source: "Derived", status: "OK", linkedFile: "1040_2024.pdf" },
        { id: "2", documentType: "Government ID", belongingTo: "Primary", source: "Derived", status: "OK", linkedFile: "dl_john.png" },
        { id: "3", documentType: "W-2 (Employer A)", belongingTo: "Primary", source: "Derived", status: "PEND" },
        { id: "4", documentType: "W-2 (Employer B - New)", belongingTo: "Primary", source: "System Sync", status: "PEND" },
        { id: "5", documentType: "W-2 (Employer C)", belongingTo: "Spouse", source: "Derived", status: "OK", linkedFile: "w2_jane.pdf" },
    ]);

    const [selectedDocTypes, setSelectedDocTypes] = useState<Record<string, string>>({});

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
        <aside className="w-full h-full flex flex-col bg-white border-l border-slate-300 font-sans text-xs text-slate-800 overflow-hidden shadow-2xl">
            {/* CLIENT HEADER */}
            <header className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-900 text-sm">
                        CLIENT HEADER: {client.primary_name || "John & Jane Doe"}
                    </span>
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold text-[11px] border border-slate-300">
                        TY {client.tax_year || "2025"}
                    </span>
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
    );
}