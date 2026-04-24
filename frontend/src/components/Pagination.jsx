import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  total, 
  pageSize, 
  currentPage, 
  onPageChange, 
  onPageSizeChange 
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1 && total <= 5) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing <span style={{ fontWeight: 600 }}>{start}-{end}</span> of <span style={{ fontWeight: 600 }}>{total}</span> entries
      </div>
      
      <div className="pagination-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rows per page:</span>
          <select 
            className="form-select" 
            style={{ width: 'auto', padding: '2px 8px', height: 28, fontSize: 12 }}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

        <button 
          className="page-btn" 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={page} 
            className={`page-btn ${currentPage === page ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button 
          className="page-btn" 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
