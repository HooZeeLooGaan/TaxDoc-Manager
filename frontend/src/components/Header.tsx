export default function Header() {
  return (
    <header className="w-full h-16 bg-slate-900 text-white shadow-md border-b border-slate-800 grid grid-cols-3 items-center px-6 select-none flex-shrink-0">
      {/* Left Slot: Empty spacer to preserve perfect center alignment */}
      <div className="flex items-center">
        {/* <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/50">
          Yo
        </span> */}
      </div>

      {/* Center Slot: Application Title */}
      <h1 className="text-lg font-bold tracking-wide text-center text-white truncate">
        Tax Document Collector
      </h1>

      {/* Right Slot: Floating Action Button
      <div className="flex justify-end items-center">
        <button
          onClick={onOpenCreateForm}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all duration-150 ease-in-out flex items-center gap-1.5 cursor-pointer"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span>Client</span>
        </button>
      </div> */}
    </header>
  )
}