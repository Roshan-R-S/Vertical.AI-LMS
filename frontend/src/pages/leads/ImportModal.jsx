import React, { useState } from 'react';
import { Download, Upload, X, CheckCircle } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const ImportModal = ({ onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  const downloadTemplate = () => {
    const headers = [
      "companyName",
      "contactName",
      "email",
      "phone",
      "source",
      "value",
      "priority",
      "notes",
    ];
    const csvContent =
      headers.join(",") +
      "\n" +
      "Sample Corp,John Doe,john@sample.com,9876543210,Website,50000,High,Interesting prospect";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Leads_Import_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim());
      const data = lines.slice(1).map((line) => {
        const values = line
          .split(",")
          .map((v) => v.trim().replace(/^"|"$/g, ""));
        const obj = {};
        headers.forEach((h, i) => {
          if (values[i]) obj[h] = values[i];
        });
        return obj;
      });
      setPreview(data);
    };
    reader.readAsText(f);
  };

  const footer = file && (
    <div className="flex gap-3">
      <Button variant="secondary" onClick={() => { setFile(null); setPreview([]); }}>
        Back
      </Button>
      <Button 
        loading={loading}
        onClick={async () => {
          setLoading(true);
          await onImport(preview);
          setLoading(false);
        }}
        icon={<CheckCircle size={15} />}
      >
        Import {preview.length} Leads
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Bulk Import Leads"
      footer={footer}
    >
      {!file ? (
        <div className="text-center py-5">
          <div className="mb-6">
            <p className="text-xs text-secondary mb-3">
              Download our template to ensure your data is formatted correctly.
            </p>
            <Button variant="secondary" onClick={downloadTemplate} icon={<Download size={14} />}>
              Download CSV Template
            </Button>
          </div>

          <div
            onClick={() => document.getElementById("csvInput").click()}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 20px',
              minHeight: 130,
              borderColor: 'var(--brand-primary)',
              borderWidth: 2,
              borderStyle: 'dashed',
              borderRadius: 12,
              background: 'rgba(99,102,241,0.03)',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: 20,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.07)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.03)'}
          >
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Upload size={20} color="#6366f1" />
            </div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: 'var(--text-primary)' }}>Click to upload CSV</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max file size: 5MB</div>
            <input id="csvInput" type="file" accept=".csv" hidden onChange={handleFile} />
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-surface p-3 rounded-xl flex justify-between items-center mb-5">
            <div className="text-xs">
              <div className="font-bold">{file.name}</div>
              <div className="text-secondary">Ready to import {preview.length} leads</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview([]); }}>
              <X size={14} />
            </Button>
          </div>
          
          <div className="max-h-[300px] overflow-auto border border-subtle rounded-lg">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="text-[10px]">Company</th>
                  <th className="text-[10px]">Contact</th>
                  <th className="text-[10px]">Phone</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((p, i) => (
                  <tr key={i}>
                    <td className="text-[11px]">{p.companyName}</td>
                    <td className="text-[11px]">{p.contactName}</td>
                    <td className="text-[11px]">{p.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <div className="p-2 text-center text-[10px] text-muted border-t border-subtle">
                + {preview.length - 10} more leads
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ImportModal;
