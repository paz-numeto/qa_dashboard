import { Link } from "react-router-dom";

// items: [{ label, to? }] — the last item has no link.
export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="text-sm mb-4">
      <ol className="flex items-center flex-wrap gap-1.5 text-gray-500 dark:text-gray-400">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <span key={i} className="flex items-center gap-1.5">
              {!isLast && item.to ? (
                <li>
                  <Link
                    to={item.to}
                    className="hover:text-gray-900 dark:hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ) : (
                <li className="text-gray-900 dark:text-white font-medium">
                  {item.label}
                </li>
              )}
              {!isLast && (
                <li className="text-gray-300 dark:text-gray-600">/</li>
              )}
            </span>
          );
        })}
      </ol>
    </nav>
  );
}
