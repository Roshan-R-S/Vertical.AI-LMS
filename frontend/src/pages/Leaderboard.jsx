import { useState, useEffect } from 'react';
import { Trophy, Star, Medal, Award, Crown } from 'lucide-react';
import { api } from '../utils/api';
import Pagination from '../components/Pagination';


const generateFilterOptions = () => {
  const now = new Date();
  const options = [];
  
  // Last 3 months
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ label, value: `month-${i}` });
  }
  
  // Current Quarter
  const q = Math.floor(now.getMonth() / 3) + 1;
  options.push({ label: `Q${q} ${now.getFullYear()}`, value: 'current-quarter' });
  
  // Current Year
  options.push({ label: `Year ${now.getFullYear()}`, value: 'current-year' });
  
  return options;
};

export default function Leaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month-0');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filterOptions = generateFilterOptions();

  useEffect(() => {
    api.get(`/analytics/leaderboard?period=${filterPeriod}`)
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filterPeriod]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Calculating standings...</div>
    </div>
  );

  if (!data) return <div>Failed to load leaderboard.</div>;

  const { bde: topBDEs, topTeam } = data;
  const topIndividual = topBDEs[0] || { name: 'N/A', revenue: 0, deals: 0 };
  const runnerUp = topBDEs[1] || { name: 'N/A', revenue: 0, deals: 0 };
  const thirdPlace = topBDEs[2] || { name: 'N/A', revenue: 0, deals: 0 };


  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-subtitle">MANAGEMENT OVERVIEW</div>
          <h1 className="page-title">Leaderboard & Awards</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select 
            className="form-select" 
            value={filterPeriod} 
            onChange={(e) => { setFilterPeriod(e.target.value); setLoading(true); }}
            style={{
              height: 38,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: '0 12px',
              fontSize: 13,
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            {filterOptions.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#1a1a1a' }}>{opt.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-grid">
        
        <div className="studio-card" style={{ background: 'linear-gradient(145deg, rgba(253, 214, 99, 0.1) 0%, rgba(20,20,20,1) 100%)', border: '1px solid rgba(253, 214, 99, 0.2)' }}>
          <div className="card-icon-wrapper yellow">
            <Crown size={16} />
          </div>
          <div className="card-desc" style={{ marginBottom: 4, color: '#fdd663', fontWeight: 600 }}>Top Team of the Period</div>
          <div className="card-title" style={{ fontSize: 28, marginBottom: 8 }}>{topTeam?.teamName || 'N/A'}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Led by {topTeam?.tlName || '—'} &bull; ₹{( (topTeam?.revenue || 0) / 100000).toFixed(1)} L Revenue</div>
        </div>


        <div className="studio-card" style={{ background: 'linear-gradient(145deg, rgba(138, 180, 248, 0.1) 0%, rgba(20,20,20,1) 100%)', border: '1px solid rgba(138, 180, 248, 0.2)' }}>
          <div className="card-icon-wrapper blue">
            <Trophy size={16} />
          </div>
          <div className="card-desc" style={{ marginBottom: 4, color: '#8ab4f8', fontWeight: 600 }}>Top Individual Performer</div>
          <div className="card-title" style={{ fontSize: 28, marginBottom: 8 }}>{topIndividual.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{topIndividual.deals} Deals Won — ₹{(topIndividual.revenue / 100000).toFixed(1)} L Revenue</div>
        </div>

      </div>

      <div className="form-grid" style={{ marginTop: 16 }}>
        
        <div className="studio-card" style={{ background: 'linear-gradient(145deg, rgba(129, 201, 149, 0.1) 0%, rgba(20,20,20,1) 100%)', border: '1px solid rgba(129, 201, 149, 0.2)' }}>
          <div className="card-icon-wrapper green">
            <Star size={16} />
          </div>
          <div className="card-desc" style={{ marginBottom: 4, color: '#81c995', fontWeight: 600 }}>Runner Up</div>
          <div className="card-title" style={{ fontSize: 24, marginBottom: 8 }}>{runnerUp.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>₹{(runnerUp.revenue / 100000).toFixed(1)} L Realized Revenue</div>
        </div>

        <div className="studio-card" style={{ background: 'linear-gradient(145deg, rgba(197, 138, 255, 0.1) 0%, rgba(20,20,20,1) 100%)', border: '1px solid rgba(197, 138, 255, 0.2)' }}>
          <div className="card-icon-wrapper purple">
            <Award size={16} />
          </div>
          <div className="card-desc" style={{ marginBottom: 4, color: '#c58aff', fontWeight: 600 }}>Third Place</div>
          <div className="card-title" style={{ fontSize: 24, marginBottom: 8 }}>{thirdPlace.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>₹{(thirdPlace.revenue / 100000).toFixed(1)} L Realized Revenue</div>
        </div>

      </div>
      
      <div className="table-wrapper" style={{ marginTop: 32 }}>
        <div className="table-header">
           <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>Global Leaderboard</h3>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>BDE Name</th>
              <th>Team</th>
              <th>Revenue Achieved</th>
              <th>Target %</th>
              <th>Deals Won</th>
            </tr>
          </thead>
          <tbody>
            {topBDEs.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((bde, idx) => {
              const i = (currentPage - 1) * pageSize + idx;
              return (

              <tr key={bde.id || i}>
                <td>
                  {i === 0 ? <Medal size={20} color="#fdd663" /> : i === 1 ? <Medal size={20} color="#c4c7c5" /> : i === 2 ? <Medal size={20} color="#f0bb78" /> : <span style={{ paddingLeft: 8 }}>{i + 1}</span>}
                </td>
                <td style={{ fontWeight: 500 }}>{bde.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{bde.team || '—'}</td>
                <td style={{ fontWeight: 600 }}>₹{(bde.revenue / 1000).toFixed(0)}K</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--border-default)', borderRadius: 3, overflow: 'hidden' }}>
                       <div style={{ height: '100%', width: `${Math.min(100, (bde.revenue / 500000) * 100)}%`, background: i === 0 ? '#fdd663' : 'var(--accent-blue)' }}></div>
                    </div>
                    <span style={{ fontSize: 11 }}>{Math.round((bde.revenue / 500000) * 100)}%</span>
                  </div>
                </td>
                <td>{bde.deals}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination 
          total={topBDEs.length}
          pageSize={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
        />
      </div>


    </div>
  );
}
