import Breadcrumb from "../components/Breadcrumb";

export default function Configurations() {
  return (
    <div>
      <Breadcrumb items={[{ label: "Configurations" }]} />

      <div className="bg-white dark:bg-gray-800 rounded-xl card-shadow p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 dark:bg-gray-700/50 grid place-items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
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
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Configurations
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          Out of scope for the MVP. This is where admins will manage scoring
          weights, violation tiers, brand mappings, and reviewer roles.
        </p>
      </div>
    </div>
  );
}
