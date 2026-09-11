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

      {/* Right Slot: Social Links */}
      <div className="flex items-center justify-end gap-3">
        {/* GitHub */}
        <a
          href="https://github.com/HooZeeLooGaan"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="GitHub"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/in/dhanesh-kudalkar/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="LinkedIn"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.74a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z"/>
          </svg>
        </a>

        {/* Email */}
        <a
          href="mailto:kudalkar.dhanesh@gmail.com"
          className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Send Email"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </a>
      </div>


    </header>
  )
}