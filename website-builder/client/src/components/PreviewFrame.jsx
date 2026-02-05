import React from 'react';

export function PreviewFrame({ siteId, onClose }) {
  if (!siteId) return null;
  const src = `/preview/${siteId}/index.html`;

  return (
    <div className="fixed inset-0 z-10 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <span className="text-sm font-medium text-gray-700">Preview: {siteId}</span>
        <div className="flex gap-2">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline"
          >
            Open in new tab
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
      <iframe
        title="Preview"
        src={src}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts"
      />
    </div>
  );
}
