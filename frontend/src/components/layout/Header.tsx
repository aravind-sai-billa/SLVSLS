interface HeaderProps {
  onMenuClick: () => void;
}

function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700 transition"
          aria-label="Open navigation menu"
        >
          <span className="text-2xl leading-none">☰</span>
        </button>

        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            SLVSLS
          </h1>

          <p className="hidden sm:block text-xs text-gray-500">
            Sri Lakshmi Venkateswara Swamy Lorry Service
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-gray-800">
            Administrator
          </p>

          <p className="text-xs text-gray-500">
            Admin
          </p>
        </div>

        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          A
        </div>
      </div>
    </header>
  );
}

export default Header;