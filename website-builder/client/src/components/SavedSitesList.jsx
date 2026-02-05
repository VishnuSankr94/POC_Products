import React from 'react';

export function SavedSitesList({ sites, onPreview, loading }) {
  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;
  if (!sites || sites.length === 0) {
    return <p className="text-sm text-gray-500">No builds yet. Create one with the form above.</p>;
  }

  return (
    <ul className="space-y-2">
      {sites.map((site) => (
        <li
          key={site.id}
          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{site.id}</p>
            {site.prompt && (
              <p className="text-xs text-gray-500 truncate" title={site.prompt}>
                {site.prompt}
              </p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onPreview(site.id)}
              className="text-sm text-blue-600 hover:underline"
            >
              Preview
            </button>
            <a
              href={`/preview/${site.id}/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Open in new tab
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
