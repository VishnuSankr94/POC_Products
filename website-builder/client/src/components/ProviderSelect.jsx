import React from 'react';

const PROVIDERS = [
  { id: 'ollama', label: 'Ollama (local)' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'groq', label: 'GROQ' },
  { id: 'gemini', label: 'Gemini' },
];

export function ProviderSelect({ value, onChange, availability, disabled }) {
  const avail = availability || { ollama: true, openai: false, anthropic: false, groq: false, gemini: false };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700">LLM Provider</span>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="LLM Provider">
        {PROVIDERS.map((p) => {
          const hasKey = !!avail[p.id];
          const isChecked = value === p.id;
          const inputId = `provider-${p.id}`;
          return (
            <label
              key={p.id}
              htmlFor={inputId}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg border cursor-pointer select-none transition-colors ${
                disabled ? 'opacity-60 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
              } ${isChecked ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50' : ''}`}
            >
              <input
                id={inputId}
                type="radio"
                name="provider"
                value={p.id}
                checked={isChecked}
                onChange={() => !disabled && onChange(p.id)}
                disabled={disabled}
                className="rounded-full border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 w-4 h-4 shrink-0"
              />
              <span className="text-sm font-medium">{p.label}</span>
              {!hasKey && <span className="text-xs text-amber-600">(add key in .env)</span>}
            </label>
          );
        })}
      </div>
    </div>
  );
}
