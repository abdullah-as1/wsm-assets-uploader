'use client';

import { useState } from 'react';
import { Cloud, CheckCircle, AlertCircle, Copy } from 'lucide-react';

const slugify = (text: string) => 
  text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [tenant, setTenant] = useState('');
  const [directory, setDirectory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !tenant || !directory) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenant', slugify(tenant));
    formData.append('directory', slugify(directory));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      setUrl(data.url);
      setFile(null);
      setTenant('');
      setDirectory('');
    } catch (err) {
      setError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-100 to-slate-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl mb-6">
            <Cloud className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold text-balance mb-3 text-foreground">
            Upload to S3
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-border transition-shadow hover:shadow-2xl">
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Tenant Name</label>
              <input
                type="text"
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                placeholder="e.g., My Company"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground bg-input transition-all placeholder-muted-foreground"
                required
              />
              {tenant && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Slug:</span>
                  <code className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-mono">
                    {slugify(tenant)}
                  </code>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-foreground">Directory Name</label>
              <input
                type="text"
                value={directory}
                onChange={(e) => setDirectory(e.target.value)}
                placeholder="e.g., Product Images"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground bg-input transition-all placeholder-muted-foreground"
                required
              />
              {directory && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Slug:</span>
                  <code className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md font-mono">
                    {slugify(directory)}
                  </code>
                </div>
              )}
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-primary bg-primary/5 scale-105'
                  : 'border-border hover:border-primary/50 bg-secondary/30'
              }`}
            >
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
                id="file-input"
                accept="image/*"
              />
              <label htmlFor="file-input" className="cursor-pointer block">
                <div className="flex flex-col items-center justify-center">
                  {file ? (
                    <>
                      <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6 text-accent" />
                      </div>
                      <p className="font-semibold text-foreground">{file.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setFile(null);
                        }}
                        className="mt-3 text-xs px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                      >
                        Change File
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                        <Cloud className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-lg font-semibold text-foreground">Click to select image</p>
                      <p className="text-sm text-muted-foreground mt-1">or drag and drop</p>
                      <p className="text-xs text-muted-foreground mt-3">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || !tenant || !directory || uploading}
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground py-4 rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                'Upload File'
              )}
            </button>
          </form>

          {url && (
            <div className="mt-8 p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Upload successful!</p>
                  <p className="text-xs text-muted-foreground">Your file is now available on the CDN</p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="w-full px-4 py-3 bg-white border border-accent/20 rounded-lg text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-accent/30"
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary rounded-md transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircle className="w-5 h-5 text-accent" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setFile(null);
                }}
                className="mt-4 w-full py-2 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Upload Another
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
