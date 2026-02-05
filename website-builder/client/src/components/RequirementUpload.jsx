import React, { useRef } from 'react';

const ACCEPT = '.pdf,.docx,.doc,.txt';

export function RequirementUpload({ files, onChange, disabled }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    onChange(list);
  };

  const remove = (index) => {
    const next = files.filter((_, i) => i !== index);
    onChange(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Requirements (PDF, DOCX, TXT)</label>
      <div className="flex items-center gap-2 flex-wrap">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleChange}
          disabled={disabled}
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-2">
              <span>{f.name}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                disabled={disabled}
                className="text-red-600 hover:underline text-xs"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
