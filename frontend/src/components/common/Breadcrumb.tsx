import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex py-3 text-slate-500 dark:text-slate-400 text-xs font-medium" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center hover:text-primary dark:hover:text-white transition-colors">
            <Home className="h-3.5 w-3.5 mr-1.5" />
            Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 mx-1 flex-shrink-0" />
            {item.path ? (
              <Link to={item.path} className="hover:text-primary dark:hover:text-white transition-colors">
                {item.name}
              </Link>
            ) : (
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
