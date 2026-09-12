import { useEffect, useState, useRef } from "react";
import type { ClientResponse } from "../services/client";
import { getClientRequirements, rederiveClientRequirements } from "../services/requirement";
import { getClientDocuments, uploadFile, type IngestedDocumentResponse } from "../services/document";

interface DocumentRequirement {
    id: string;
    document_type: string;
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
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isRederiving, setIsRederiving] = useState<boolean>(false);

    const [reviewQueue, setReviewQueue] = useState<PendingReviewFile[]>([]);
    const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
    const [documents, setDocuments] = useState<IngestedDocumentResponse[]>([])
    const [selectedDocTypes, setSelectedDocTypes] = useState<Record<string, string>>({});

    // Track which specific requirement is currently requesting an upload (if triggered from the table)
    const [activeReqForUpload, setActiveReqForUpload] = useState<string | null>(null);

    // Hidden file input reference
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        let mounted = true
        setLoading(true)
        setError(null)

        async function fetchClientData(){
            try{
                const [requirementResponse, documentResponse] = await Promise.all([
                    getClientRequirements(client.id),
                    getClientDocuments(client.id)
                ])

                if(mounted){
                    setRequirements(requirementResponse)
                    setDocuments(documentResponse)
                }
            } catch(err: any) {
                if (mounted) {
                    setError(err?.message || "Failed to fetch client details");
                }
            } finally{
                if (mounted){
                    setLoading(false)
                }
            }
        }

        fetchClientData()
        return (() =>{
            mounted = false
        })
    },[client.id])

    // Trigger file selection window
    const triggerFileInput = (targetReqId?: string) => {
        if (targetReqId) {
            setActiveReqForUpload(targetReqId);
        } else {
            setActiveReqForUpload(null);
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if(!files || files.length === 0) return
        setIsUploading(true)

        try{
            for(let i = 0; i< files.length; i++){
                const file = files[i]
                await uploadFile({clientId: client.id, file: file, requirementId:""})

                if(activeReqForUpload){
                    setRequirements((prev) => 
                        prev.map((req) => 
                            req.id === activeReqForUpload
                                ? { ...req, status: "OK", linkedFile: file.name, source: "Manual" }
                                : req
                        )
                    )
                } else {
                    // Add generic fast-uploaded file into Review Queue for classification
                    const newReviewItem: PendingReviewFile = {
                        id: Date.now().toString() + i,
                        fileName: file.name,
                        aiGuessType: "Form 1040", // Fallback / mock AI prediction
                        confidence: 85,
                        taxpayer: "Primary",
                        taxYear: Number(client.tax_year) || 2025,
                    };
                    setReviewQueue((prev) => [...prev, newReviewItem]);
                }
            }
        } catch(err: any){
            alert(`File upload failed: ${err?.message || "Unknown error"}`);
        } finally {
            setIsUploading(false);
            setActiveReqForUpload(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset input
            }
        }
    }

    // Handle Drag & Drop events
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (fileInputRef.current) {
                fileInputRef.current.files = e.dataTransfer.files;
                const event = { target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>;
                handleFileChange(event);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleRederiveRequirements = async () => {
        if (!client?.id) return;
        
        setIsRederiving(true);
        try {
            // Call backend endpoint to rederive requirements for this client
            const updatedRequirements = await rederiveClientRequirements(client.id);
            
            // Update local state with the refreshed requirements list
            setRequirements(updatedRequirements);
        } catch (err: any) {
            console.error("Failed to rederive requirements:", err);
            alert(`Error rederiving requirements: ${err?.message || "Something went wrong"}`);
        } finally {
            setIsRederiving(false);
        }
    };

    const handleConfirmAssign = (fileId: string) => {
        const file = reviewQueue.find((f) => f.id === fileId);
        if (!file) return;

        const assignedType = selectedDocTypes[fileId] || file.aiGuessType;

        setRequirements((prev) => [
            ...prev,
            {
                id: Date.now().toString(),
                document_type: assignedType,
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
                document_type: docName,
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
        {/* Hidden File Input for Native Pickers */}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
        />
        
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
                {documents.length > 0 && (
                    <section className="border border-amber-300 bg-amber-50/60 rounded-md p-3 space-y-3">
                        <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                            <span>⚠️ ATTENTION REQUIRED</span>
                            <span>({documents.length} files pending manual review)</span>
                        </div>

                        {documents.map((file) => (
                        <div 
                            key={file.id} 
                            className="bg-white border border-amber-200 hover:border-amber-300 rounded-md p-2.5 flex items-center justify-between gap-3 text-xs shadow-2xs transition-colors"
                        >
                            {/* Left: File Name with inline preview trigger */}
                            <div className="flex items-center gap-2 min-w-0">
                            <button
                                onClick={() => alert(`Previewing ${file.file_name}`)}
                                className="flex items-center gap-1.5 font-mono font-semibold text-slate-800 hover:text-indigo-600 truncate text-left group"
                                title="Click to view thumbnail"
                            >
                                <span className="truncate underline-offset-2 group-hover:underline">{file.file_name}</span>
                            </button>

                            {/* Metadata Badges */}
                            <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
                                {file.flag_reason && 
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200 font-sans px-1.5 py-0.5 rounded text-[11px] font-medium">
                                        {file.flag_reason || "Unassigned"} ({file.confidence_score}%)
                                    </span>
                                }
                                {file.predicted_owner &&
                                    <span>|•{file.predicted_owner}</span>
                                }
                                {file.predicted_year &&
                                    <span>|•{file.predicted_year}</span>
                                }   
                            </div>
                            </div>

                            {/* Right: Inline Controls */}
                            <div className="flex items-center gap-1.5 shrink-0">
                            <select
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={selectedDocTypes[file.id] || file.flag_reason}
                                onChange={(e) =>
                                setSelectedDocTypes({ ...selectedDocTypes, [file.id]: e.target.value })
                                }
                            >
                                <option value="W-2">Assign as W-2</option>
                                <option value="Form 1040">Assign as Form 1040</option>
                                <option value="1099-INT">Assign as 1099-INT</option>
                                <option value="1099-MISC">Assign as 1099-MISC</option>
                                <option value="Government ID">Assign as Government ID</option>
                            </select>

                            <button
                                onClick={() => handleConfirmAssign(file.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-2.5 py-1 rounded transition-colors"
                            >
                                Confirm
                            </button>

                            <button
                                onClick={() => handleReject(file.id)}
                                className="text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 font-medium px-2 py-1 rounded transition-colors"
                                title="Reject or mark as blurry"
                            >
                                Reject
                            </button>
                            </div>
                        </div>
                        ))}
                    </section>
                )}

                {/* REQUIRED DOCUMENTS */}
                <section className="bg-white border border-slate-300 rounded-md overflow-hidden shadow-xs">
                    {/* REQUIRED DOCUMENTS HEADER */}
                        <div className="bg-slate-100 border-b border-slate-300 px-3 py-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                                Required Documents
                                </span>
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-mono px-1.5 py-0.5 rounded">
                                Auto-Derived
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* + ADD MANUAL REQUIREMENT */}
                                <button
                                onClick={handleAddManualRequirement}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded text-xs transition-colors shadow-2xs cursor-pointer"
                                >
                                + Add Requirement
                                </button>
                                {/* 🔄 MANUAL REDERIVE BUTTON */}
                                <button
                                    onClick={handleRederiveRequirements}
                                    disabled={isRederiving}
                                    className="text-slate-500 hover:text-slate-800 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Re-run derivation engine to refresh required document rules"
                                    >
                                    <svg
                                        className={`w-4 h-4 stroke-current ${isRederiving ? "animate-spin" : ""}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                    >
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                        />
                                    </svg>
                                </button>
                            </div>                            
                        </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                                    <th className="p-2.5 border-r border-slate-200">Document Type</th>
                                    <th className="p-2.5 border-r border-slate-200">Status</th>
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
                                        <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">
                                            {req.document_type}
                                        </td>
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
                                                        onClick={() => triggerFileInput(req.id)}
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
                <div className="p-2.5 bg-slate-100 border-b border-slate-300 font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>FAST UPLOAD</span>
                    {isUploading && (
                    <span className="text-xs text-indigo-600 animate-pulse font-normal">
                        Uploading...
                    </span>
                    )}
                </div>
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => triggerFileInput()}
                    className="p-6 border-2 border-dashed border-slate-300 m-3 rounded text-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
                >
                    <span className="text-slate-600 font-medium">
                    {isUploading ? (
                        <span className="text-indigo-600 font-bold">Uploading files...</span>
                    ) : (
                        <>
                        Drag & Drop client files here or{" "}
                        <span className="text-indigo-600 font-bold underline">[Browse Files]</span>
                        </>
                    )}
                    </span>
                </div>
                </section>
            </div>
        </aside>
        }
        </>
    );
}