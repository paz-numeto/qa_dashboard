import { NavLink, useLocation } from "react-router-dom";
import { pendingReviewCount } from "../lib/qaService";

// Active link styling
const baseLink =
  "flex items-center gap-3 px-4 py-2.5 rounded-lg transition";
const activeLink =
  "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium";
const inactiveLink =
  "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60";

export default function Sidebar() {
  const { pathname } = useLocation();
  const pending = pendingReviewCount();

  // Dashboard tab "owns" agent + chat detail pages too
  const dashboardActive =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/chats");

  return (
    <aside className="w-60 flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4">
        <div className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          QA System
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Account Manager Reviews
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 mt-2 flex-1 space-y-1">
        <NavLink
          to="/dashboard"
          className={`${baseLink} ${
            dashboardActive ? activeLink : inactiveLink
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"
            />
          </svg>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/reviews"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <span className="flex-1">Reviews Queue</span>
          {pending > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500 text-white">
              {pending}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/configurations"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? activeLink : inactiveLink}`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.8}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317a1.724 1.724 0 013.35 0c.18.732 1.02 1.082 1.69.69a1.724 1.724 0 012.37 2.37c-.39.67-.04 1.51.69 1.69a1.724 1.724 0 010 3.35c-.73.18-1.08 1.02-.69 1.69a1.724 1.724 0 01-2.37 2.37c-.67-.39-1.51-.04-1.69.69a1.724 1.724 0 01-3.35 0c-.18-.73-1.02-1.08-1.69-.69a1.724 1.724 0 01-2.37-2.37c.39-.67.04-1.51-.69-1.69a1.724 1.724 0 010-3.35c.73-.18 1.08-1.02.69-1.69a1.724 1.724 0 012.37-2.37c.67.39 1.51.04 1.69-.69z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Configurations</span>
        </NavLink>
      </nav>

      <div className="px-6 py-4 text-[11px] text-gray-400 dark:text-gray-500">
        MVP demo · v0.1
      </div>
    </aside>
  );
}
