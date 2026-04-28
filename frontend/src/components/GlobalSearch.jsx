import { useState, useRef, useEffect } from 'react';
import { Search, Building, User, Phone, Mail, Bell, Clock } from 'lucide-react';
import { useApp } from '../context/AppContextCore';

import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const { leads, notifications } = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const hasUnread = notifications && notifications.some(n => !n.isRead);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const results = query.length > 2 ? leads.filter(l =>
    l.companyName.toLowerCase().includes(query.toLowerCase()) ||
    l.contactName.toLowerCase().includes(query.toLowerCase()) ||
    l.phone?.includes(query) ||
    l.email?.toLowerCase().includes(query.toLowerCase())
  ) : [];

  // Find phone/email values that appear more than once across all leads
  const phoneCounts = leads.reduce((acc, l) => { if (l.phone) acc[l.phone] = (acc[l.phone] || 0) + 1; return acc; }, {});
  const emailCounts = leads.reduce((acc, l) => { if (l.email) acc[l.email] = (acc[l.email] || 0) + 1; return acc; }, {});
  const isDuplicate = (l) => (l.phone && phoneCounts[l.phone] > 1) || (l.email && emailCounts[l.email] > 1);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', padding: '16px 32px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 100 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Global Search: Leads, Phones, Emails..." 
          style={{ paddingLeft: 44, background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        
        {isOpen && query.length > 2 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Search Results ({results.length})
            </div>
            {results.length > 0 ? (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {results.map(lead => (
                  <div key={lead.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={14} color="var(--brand-primary)" /> {lead.companyName}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isDuplicate(lead) && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                            DUPLICATE
                          </span>
                        )}
                        <span className="badge badge-primary">{lead.status}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {lead.contactName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {lead.phone}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {lead.email}</span>
                    </div>
                    {isDuplicate(lead) && (
                      <div style={{ marginTop: 4, fontSize: 11, color: '#f59e0b' }}>
                        ⚠ Same phone/email exists in another lead — possible duplicate
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No leads found.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <Bell size={20} color="var(--text-secondary)" />
          {hasUnread && (
            <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-page)' }} />
          )}
        </div>
      </div>
    </div>
  );
}
