import React, { useState, useEffect, useCallback } from 'react';
import { PromptInput } from './components/PromptInput';
import { RequirementUpload } from './components/RequirementUpload';
import { ProviderSelect } from './components/ProviderSelect';
import { BuildButton } from './components/BuildButton';
import { SavedSitesList } from './components/SavedSitesList';
import { PreviewFrame } from './components/PreviewFrame';

// Use environment variable for API URL, fallback to '/api' for relative paths
const API = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState([]);
  const [provider, setProvider] = useState('ollama');
  const [availability, setAvailability] = useState({ ollama: false, openai: false, anthropic: false, groq: false, gemini: false });
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(true);
  const [buildLoading, setBuildLoading] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch(`${API}/sites/availability`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data);
        // Only auto-pick a default when current provider is not available (don't overwrite user choice)
        setProvider((current) => {
          if (data[current]) return current;
          if (data.ollama) return 'ollama';
          if (data.groq) return 'groq';
          if (data.openai) return 'openai';
          if (data.anthropic) return 'anthropic';
          if (data.gemini) return 'gemini';
          return current;
        });
      }
    } catch (_) {}
  }, []);

  const fetchSites = useCallback(async () => {
    setSitesLoading(true);
    try {
      const res = await fetch(`${API}/sites`);
      if (res.ok) {
        const data = await res.json();
        setSites(data);
      }
    } catch (_) {
      setSites([]);
    } finally {
      setSitesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
    fetchSites();
  }, [fetchAvailability, fetchSites]);

  const handleBuild = async () => {
    setBuildError(null);
    setBuildLoading(true);
    try {
      const form = new FormData();
      form.append('prompt', prompt);
      form.append('provider', provider);
      files.forEach((f) => form.append('requirements', f));

      const res = await fetch(`${API}/build`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setBuildError(data.error || res.statusText || 'Build failed');
        return;
      }
      await fetchSites();
      setPreviewId(data.id);
    } catch (err) {
      setBuildError(err.message || 'Build failed');
    } finally {
      setBuildLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900">Website Builder</h1>
        <p className="text-sm text-gray-500">Describe your site, add requirements, pick a provider, and build.</p>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
          <PromptInput value={prompt} onChange={setPrompt} disabled={buildLoading} />
          <RequirementUpload files={files} onChange={setFiles} disabled={buildLoading} />
          <ProviderSelect
            value={provider}
            onChange={setProvider}
            availability={availability}
            disabled={buildLoading}
          />
          <BuildButton onClick={handleBuild} loading={buildLoading} />
          {buildError && (
            <p className="text-sm text-red-600" role="alert">
              {buildError}
            </p>
          )}
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Saved sites</h2>
          <SavedSitesList sites={sites} onPreview={setPreviewId} loading={sitesLoading} />
        </section>
      </main>

      {previewId && <PreviewFrame siteId={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}

export default App;
