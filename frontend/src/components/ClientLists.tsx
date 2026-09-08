import { useState, type MouseEvent } from "react"
import { deleteClient, type ClientResponse } from "../services/client"

interface ClientsListProps {
  clients: ClientResponse[]
  loading: boolean
  error: string | null
  selectedClientId?: string | null
  onSelectClient?: (client: ClientResponse) => void
  onClientDeleted?: (deletedId: string) => void
}

export function ClientsList({ clients, loading, error, selectedClientId, onSelectClient, onClientDeleted }: ClientsListProps) {
    const [deletingId, setDeletingId] = useState<string|null>(null)

    const handleClientDelete = async (e: MouseEvent, clientId: string) => {
        e.stopPropagation()

        if(!confirm("Are you sure you want to delete thhis client record?")){
            return
        }

        setDeletingId(clientId)
        try{
            await deleteClient(clientId)
            setDeletingId(null)
            if(onClientDeleted){
                onClientDeleted(clientId)
            }
        }
        catch(err: any){
            setDeletingId(null)
            alert(err.message || "Failed to delete client")
        }
    }


  if (loading) {
    return <div className="p-6 text-xs text-text-muted animate-pulse">Loading roster...</div>
  }

  if (error) {
    return <div className="m-4 p-3 bg-rose-50 text-xs text-rose-700 rounded-lg">{error}</div>
  }

  if (clients.length === 0) {
    return <div className="p-8 text-xs text-text-muted text-center">No clients onboarded yet.</div>
  }
  return (
    <>      
        {loading && (
        <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-400">
            <span className="animate-pulse">Loading clients...</span>
        </div>
        )}

        {error && (
        <div className="m-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <p className="font-semibold">Error loading clients</p>
            <p className="mt-1">{error}</p>
        </div>
        )}

        {!loading && !error && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {clients.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">
                No clients onboarded yet. Click "+ Client" to start.
            </div>
            ) : (
            clients.map((client) => {
                const isSelected = selectedClientId === client.id
                const isDeleting = deletingId === client.id

                return (
                <div
                    key={client.id}
                    onClick={() => onSelectClient && onSelectClient(client)}
                    className={`group p-4 cursor-pointer transition flex items-center justify-between border-l-4 ${
                    isSelected
                        ? "border-l-4 border-l-indigo-600 border-y-transparent border-r-transparent bg-indigo-50/70"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                >
                    <div className="flex flex-col gap-0.5">
                        <span
                            className={`text-sm font-semibold text-text-main${
                            isSelected ? "text-indigo-950" : "text-slate-800"
                            }`}
                        >
                            {client.primary_name}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded">
                            TY {client.tax_year}
                        </span>

                        {/* Delete Bin Icon Button */}
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={(e) => handleClientDelete(e, client.id)}
                            title="Delete Client"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                        >
                            {isDeleting ? (
                            <span className="text-[10px] font-medium text-rose-500">...</span>
                            ) : (
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.75"
                                viewBox="0 0 24 24"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                            </svg>
                            )}
                        </button>
                    </div>
                </div>
                )
            })
            )}
        </div>
        )}
    </>
  )
}

export default ClientsList