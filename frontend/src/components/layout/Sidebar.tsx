interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50
        w-72 h-screen
        bg-slate-900 text-white
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Brand */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-700">
        <div>
          <h2 className="text-lg font-bold">
            SLVSLS
          </h2>

          <p className="text-xs text-slate-400">
            Lorry Service Management
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-800 text-slate-300 transition"
          aria-label="Close navigation menu"
        >
          <span className="text-2xl leading-none">×</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <a
          href="/dashboard"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Dashboard
        </a>

        <a
          href="/financial"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Financial Dashboard
        </a>

        <a
          href="/lorries"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Lorry Management
        </a>

        <a
          href="/trips"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Trips
        </a>

        <a
          href="/expenses"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Monthly Expenses
        </a>

        <a
          href="/reports"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          Reports
        </a>

        <a
          href="/users"
          onClick={onClose}
          className="block px-4 py-3 rounded-lg hover:bg-slate-800 transition"
        >
          User Management
        </a>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-400">
          SLVSLS Management System
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;