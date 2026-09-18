import { useState, useEffect } from 'react';
import ClientsList from './ClientLists';
import ClientForm from './ClientForm';
import ClientRequirements from './ClientRequirements';
import Header from './Header';
import { getClients, type ClientResponse } from '../services/client';

type RightPanelView =
  | { type: 'DEFAULT' }
  | { type: 'CREATE_CLIENT' }
  | { type: 'CLIENT_DETAILS'; client: ClientResponse };

export default function ClientsPage() {
  const [activeView, setActiveView] = useState<RightPanelView>({
    type: 'DEFAULT',
  });
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getClients()
      .then((data) => {
        if (mounted) {
          setClients(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setLoading(false);
          setError(err.message || 'Failed to fetch clients');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  // const handleClientClick = (client: ClientResponse) => {
  //     setSelectedClientId(client.id)
  //     if (onSelectClient) {
  //     onSelectClient(client)
  //     }
  // }

  const handleClientCreated = (newClient: ClientResponse) => {
    setClients((prev) => [newClient, ...prev]);
    setActiveView({ type: 'CLIENT_DETAILS', client: newClient });
  };

  const handleClientDeleted = (deletedId: string) => {
    // Dynamically update array using spread operator
    setClients((prevClients) => [
      ...prevClients.filter((client) => client.id !== deletedId),
    ]);

    // Reset right workspace if deleted client was currently open
    if (
      activeView.type === 'CLIENT_DETAILS' &&
      activeView.client.id === deletedId
    ) {
      setActiveView({ type: 'DEFAULT' });
    }
  };

  return (
    <>
      <Header />

      <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
        {/* ---------------- Client Rooster Component ---------------- */}
        <header className="h-[10%] min-h-[64px] bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Client Roster
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
              {clients.length} Total
            </span>
          </div>

          {/* Right Slot: Floating Action Button */}
          <div className="flex justify-end items-center">
            <button
              onClick={() => setActiveView({ type: 'CREATE_CLIENT' })}
              className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all duration-150 ease-in-out flex items-center gap-1.5 cursor-pointer"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>Client</span>
            </button>
          </div>
        </header>

        {/* ---------------- Main Split Workspace ---------------- */}
        <div className="flex flex-1 h-[90%] overflow-hidden">
          {/* Left 50% Panel - Client List */}
          <section className="w-1/2 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <ClientsList
              clients={clients}
              loading={loading}
              error={error}
              selectedClientId={
                activeView.type === 'CLIENT_DETAILS'
                  ? activeView.client.id
                  : null
              }
              onSelectClient={(client) =>
                setActiveView({ type: 'CLIENT_DETAILS', client })
              }
              onClientDeleted={handleClientDeleted}
            />
          </section>

          {/* Right 50% Panel - Blank Canvas with Heading */}
          <section className="w-1/2 h-full bg-indigo-100 flex items-center justify-center select-none">
            {/* 1. Default text container*/}
            {activeView.type === 'DEFAULT' && (
              <div className="text-center p-8">
                <h2 className="text-3xl font-extrabold text-slate-300 tracking-wider uppercase">
                  Tax Doc Collector
                </h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  Select a client on the left or add a new return to manage tax
                  requirements
                </p>
              </div>
            )}

            {/* 2. Create client form */}
            {activeView.type === 'CREATE_CLIENT' && (
              <ClientForm
                onCancel={() => setActiveView({ type: 'DEFAULT' })}
                onSuccess={handleClientCreated}
              />
            )}

            {/* 3. Client Requirements Details View */}
            {activeView.type === 'CLIENT_DETAILS' && (
              <div className="p-6 h-full">
                <ClientRequirements
                  client={activeView.client}
                  onClose={() => setActiveView({ type: 'DEFAULT' })}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
