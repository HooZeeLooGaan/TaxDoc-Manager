import { useState, type SubmitEvent } from "react"
import { createClient, type ClientRequest, type ClientResponse } from "../services/client"

interface createClientFormProps {
    onSuccess?: (newClient: ClientResponse) => void
    onCancel?: () => void
}

export default function ClientForm({onSuccess, onCancel}: createClientFormProps){    
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const [formData, setFormData] = useState<ClientRequest>({
        primary_name: "",
        spouse_name: "",
        tax_year: ""
    })

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault()
        if(!formData.primary_name.trim()){
            setError("Taxpayer's primary name is required")
            return
        }
        setLoading(true)
        setError(null)
        try{
            const response = await createClient(formData)
            setLoading(false)
            if(onSuccess){
                onSuccess(response)
            }
            setFormData({
                primary_name: "",
                spouse_name: "",
                tax_year: ""
            })
        }
        catch(err: any){
            setLoading(false)
            setError(err.message || "Failed to create client")
        }
    }

    return (
        <div className="max-w-fit mx-auto bg-white px-20 py-10 rounded-xl shadow-sm border border-slate-200 mt-4">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
                <div>
                    <h2 className="text-base font-bold text-slate-800">Onboard New Client</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Enter client tax profile details.</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Primary Name */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Primary Taxpayer Name <span className="text-rose-500">*</span>
                    </label>
                <input
                    type="text"
                    required
                    placeholder="Enter taxpayer's name"
                    value={formData.primary_name}
                    onChange={(e) => setFormData({ ...formData, primary_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                </div>

                {/* Spouse Name */}
                <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spouse Name
                </label>
                <input
                    type="text"
                    placeholder="Enter taxpayer's spouse"
                    value={formData.spouse_name}
                    onChange={(e) => setFormData({ ...formData, spouse_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                </div>

                {/* Tax Year */}
                <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Year <span className="text-rose-500">*</span>
                </label>
                <input
                    type="number"
                    required
                    value={formData.tax_year}
                    onChange={(e) => setFormData({ ...formData, tax_year: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                {onCancel && (
                    <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                    Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg shadow-sm transition disabled:opacity-50"
                >
                    {loading ? "Creating..." : "Save Client"}
                </button>
                </div>
            </form>
        </div>
    )
}