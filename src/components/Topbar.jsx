export default function Topbar({ dark, onToggle }) {
  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle theme"
        className="w-9 h-9 grid place-items-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {dark ? (
          // Sun (visible while dark)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-yellow-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          // Moon (visible while light)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        )}
      </button>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700 dark:text-gray-200">Marypaz</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 grid place-items-center text-white text-sm font-semibold">
          M
        </div>
      </div>
    </header>
  );
}
