// ============================================
// MOCK DATA — THE VERTICAL AI LMS
// ============================================

export const USERS = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun@vertical.ai', role: 'Super Admin', avatar: 'AM', status: 'active', phone: '+91 98765 43210', team: null, createdAt: '2024-01-10', lastLogin: '2026-04-22 09:00' },
  { id: 2, name: 'Priya Sharma', email: 'priya@vertical.ai', role: 'Team Lead', avatar: 'PS', status: 'active', phone: '+91 98765 43211', team: 'Team Alpha', createdAt: '2024-02-15', lastLogin: '2026-04-22 08:45' },
  { id: 3, name: 'Ravi Kumar', email: 'ravi@vertical.ai', role: 'Team Lead', avatar: 'RK', status: 'active', phone: '+91 98765 43212', team: 'Team Beta', createdAt: '2024-02-20', lastLogin: '2026-04-21 17:30' },
  { id: 4, name: 'Neha Singh', email: 'neha@vertical.ai', role: 'BDE', avatar: 'NS', status: 'active', phone: '+91 98765 43213', team: 'Team Alpha', createdAt: '2024-03-01', lastLogin: '2026-04-22 09:15' },
  { id: 5, name: 'Akash Patel', email: 'akash@vertical.ai', role: 'BDE', avatar: 'AP', status: 'active', phone: '+91 98765 43214', team: 'Team Alpha', createdAt: '2024-03-05', lastLogin: '2026-04-22 08:50' },
  { id: 6, name: 'Kavya Nair', email: 'kavya@vertical.ai', role: 'BDE', avatar: 'KN', status: 'active', phone: '+91 98765 43215', team: 'Team Beta', createdAt: '2024-03-10', lastLogin: '2026-04-22 09:05' },
  { id: 7, name: 'Deepak Verma', email: 'deepak@vertical.ai', role: 'BDE', avatar: 'DV', status: 'inactive', phone: '+91 98765 43216', team: 'Team Beta', createdAt: '2024-03-15', lastLogin: '2026-04-10 14:00' },
  { id: 8, name: 'Sonia Gupta', email: 'sonia@vertical.ai', role: 'BDE', avatar: 'SG', status: 'active', phone: '+91 98765 43217', team: 'Team Alpha', createdAt: '2024-04-01', lastLogin: '2026-04-22 09:20' },
];

export const LEADS = [
  { id: 'L001', companyName: 'TechNova Solutions', contactName: 'Suresh Reddy', email: 'suresh@technova.com', phone: '+91 99001 12345', source: 'Website', assignedBDE: 'Neha Singh', assignedTL: 'Priya Sharma', milestone: 'Demo Scheduled', disposition: 'Demo Scheduled', score: 85, priority: 'High', value: 180000, probability: 70, expectedClose: '2026-05-15', createdAt: '2026-03-10', tags: ['SaaS', 'Enterprise'], notes: 'Interested in AI calling solution', status: 'active' },
  { id: 'L002', companyName: 'GreenBridge Infra', contactName: 'Ananya Krishnan', email: 'ananya@greenbridge.in', phone: '+91 99002 23456', source: 'LinkedIn', assignedBDE: 'Akash Patel', assignedTL: 'Priya Sharma', milestone: 'First Call', disposition: 'Call Connected', score: 72, priority: 'Medium', value: 95000, probability: 50, expectedClose: '2026-05-30', createdAt: '2026-03-15', tags: ['Real Estate'], notes: 'Needs demo next week', status: 'active' },
  { id: 'L003', companyName: 'FinEdge Capital', contactName: 'Mohit Agarwal', email: 'mohit@finedge.com', phone: '+91 99003 34567', source: 'Referral', assignedBDE: 'Kavya Nair', assignedTL: 'Ravi Kumar', milestone: 'Proposal Shared', disposition: 'Proposal Sent', score: 91, priority: 'High', value: 350000, probability: 80, expectedClose: '2026-05-01', createdAt: '2026-02-28', tags: ['FinTech', 'Enterprise'], notes: 'Decision expected end of April', status: 'active' },
  { id: 'L004', companyName: 'SwiftLogix', contactName: 'Divya Menon', email: 'divya@swiftlogix.com', phone: '+91 99004 45678', source: 'Google Ads', assignedBDE: 'Sonia Gupta', assignedTL: 'Priya Sharma', milestone: 'Negotiation', disposition: 'Price Discussion', score: 88, priority: 'High', value: 220000, probability: 85, expectedClose: '2026-04-28', createdAt: '2026-02-20', tags: ['Logistics'], notes: 'Budget approved, negotiating terms', status: 'active' },
  { id: 'L005', companyName: 'HealthFirst Clinics', contactName: 'Rajesh Pillai', email: 'rajesh@healthfirst.in', phone: '+91 99005 56789', source: 'Website', assignedBDE: 'Neha Singh', assignedTL: 'Priya Sharma', milestone: 'First Call', disposition: 'Call Not Picked', score: 45, priority: 'Low', value: 60000, probability: 20, expectedClose: '2026-06-30', createdAt: '2026-04-01', tags: ['Healthcare'], notes: 'Follow up needed', status: 'active' },
  { id: 'L006', companyName: 'EduSpark Academy', contactName: 'Pooja Iyer', email: 'pooja@eduspark.com', phone: '+91 99006 67890', source: 'Website', assignedBDE: 'Akash Patel', assignedTL: 'Priya Sharma', milestone: 'Deal Closed', disposition: 'Deal Closed', score: 95, priority: 'High', value: 145000, probability: 100, expectedClose: '2026-04-10', createdAt: '2026-02-01', tags: ['EdTech'], notes: 'Closed successfully', status: 'won' },
  { id: 'L007', companyName: 'RetailMax Chain', contactName: 'Amit Joshi', email: 'amit@retailmax.com', phone: '+91 99007 78901', source: 'Partner', assignedBDE: 'Kavya Nair', assignedTL: 'Ravi Kumar', milestone: 'Not Interested', disposition: 'Chose Competitor', score: 30, priority: 'Low', value: 80000, probability: 0, expectedClose: '2026-03-31', createdAt: '2026-01-15', tags: ['Retail'], notes: 'Went with competitor', status: 'lost' },
  { id: 'L008', companyName: 'Cloudify Systems', contactName: 'Nisha Batra', email: 'nisha@cloudify.io', phone: '+91 99008 89012', source: 'LinkedIn', assignedBDE: 'Sonia Gupta', assignedTL: 'Priya Sharma', milestone: 'New', disposition: 'Not Contacted', score: 60, priority: 'Medium', value: 120000, probability: 30, expectedClose: '2026-06-15', createdAt: '2026-04-18', tags: ['SaaS'], notes: 'Fresh lead from campaign', status: 'active' },
  { id: 'L009', companyName: 'Sunrise Builders', contactName: 'Venkat Rao', email: 'venkat@sunrisebuilders.com', phone: '+91 99009 90123', source: 'Google Ads', assignedBDE: 'Neha Singh', assignedTL: 'Priya Sharma', milestone: 'Demo Completed', disposition: 'Demo Completed', score: 78, priority: 'Medium', value: 165000, probability: 60, expectedClose: '2026-05-20', createdAt: '2026-03-25', tags: ['Real Estate', 'Construction'], notes: 'Demo went well, proposal pending', status: 'active' },
  { id: 'L010', companyName: 'Nexus Digital', contactName: 'Sara Khan', email: 'sara@nexusdigital.in', phone: '+91 99010 01234', source: 'Referral', assignedBDE: 'Deepak Verma', assignedTL: 'Ravi Kumar', milestone: 'Demo Scheduled', disposition: 'Meeting Scheduled', score: 66, priority: 'Medium', value: 75000, probability: 45, expectedClose: '2026-06-01', createdAt: '2026-04-05', tags: ['Digital Marketing'], notes: 'Product fit confirmed', status: 'active' },
];

export const CLIENTS = [
  { id: 'C001', companyName: 'EduSpark Academy', contactName: 'Pooja Iyer', email: 'pooja@eduspark.com', phone: '+91 99006 67890', linkedLead: 'L006', products: ['AI Calling', 'CRM'], orderValue: 145000, contractDuration: '12 months', startDate: '2026-04-15', renewalDate: '2027-04-15', accountManager: 'Kavya Nair', status: 'active', documents: ['proposal_eduspark.pdf', 'contract_eduspark.pdf', 'invoice_001.pdf'], industry: 'EdTech' },
  { id: 'C002', companyName: 'Apex Manufacturing', contactName: 'Rahul Desai', email: 'rahul@apexmfg.com', phone: '+91 99011 11111', linkedLead: null, products: ['AI Calling', 'Analytics'], orderValue: 280000, contractDuration: '24 months', startDate: '2026-01-01', renewalDate: '2028-01-01', accountManager: 'Neha Singh', status: 'active', documents: ['contract_apex.pdf', 'invoice_apex_001.pdf'], industry: 'Manufacturing' },
  { id: 'C003', companyName: 'GlobalTrade Corp', contactName: 'Jennifer D\'souza', email: 'jennifer@globaltrade.com', phone: '+91 99012 22222', linkedLead: null, products: ['CRM', 'Analytics'], orderValue: 195000, contractDuration: '12 months', startDate: '2025-10-01', renewalDate: '2026-10-01', accountManager: 'Akash Patel', status: 'renewal_due', documents: ['contract_global.pdf'], industry: 'Trade' },
  { id: 'C004', companyName: 'TechWave Labs', contactName: 'Siddharth Jain', email: 'sid@techwavélabs.com', phone: '+91 99013 33333', linkedLead: null, products: ['AI Calling', 'CRM', 'Analytics'], orderValue: 420000, contractDuration: '24 months', startDate: '2026-02-01', renewalDate: '2028-02-01', accountManager: 'Sonia Gupta', status: 'active', documents: ['agreement_techwave.pdf', 'kyc_techwave.pdf', 'invoice_001.pdf', 'invoice_002.pdf'], industry: 'Technology' },
];

export const MILESTONES = [
  { id: 'M1', name: 'New', order: 1, color: '#6366f1' },
  { id: 'M2', name: 'First Call', order: 2, color: '#06b6d4' },
  { id: 'M3', name: 'Demo Scheduled', order: 3, color: '#8b5cf6' },
  { id: 'M4', name: 'Demo Completed', order: 4, color: '#f59e0b' },
  { id: 'M5', name: 'Demo Postponed', order: 5, color: '#f97316' },
  { id: 'M6', name: 'Proposal Shared', order: 6, color: '#3b82f6' },
  { id: 'M7', name: 'PS & Dropped', order: 7, color: '#9ca3af' },
  { id: 'M8', name: 'Negotiation', order: 8, color: '#ec4899' },
  { id: 'M9', name: 'Deal Closed', order: 9, color: '#10b981' },
  { id: 'M10', name: 'Not Interested', order: 10, color: '#ef4444' },
];

export const DISPOSITIONS = [
  { id: 'D01', milestoneId: 'M1', name: 'Not Contacted', type: 'neutral', isActive: true, isDefault: true, description: 'Lead has not been contacted yet' },
  { id: 'D02', milestoneId: 'M2', name: 'Call Connected', type: 'positive', isActive: true, isDefault: true, description: 'Successfully connected on call' },
  { id: 'D03', milestoneId: 'M2', name: 'Call Not Picked', type: 'neutral', isActive: true, isDefault: true, description: 'Call was not answered' },
  { id: 'D04', milestoneId: 'M2', name: 'Invalid Number', type: 'negative', isActive: true, isDefault: true, description: 'Phone number is invalid' },
  { id: 'D05', milestoneId: 'M2', name: 'Callback Requested', type: 'positive', isActive: true, isDefault: true, description: 'Lead requested a callback' },
  { id: 'D06', milestoneId: 'M3', name: 'Interest Confirmed', type: 'positive', isActive: true, isDefault: true, description: 'Lead confirmed interest in product' },
  { id: 'D07', milestoneId: 'M3', name: 'Not Interested', type: 'negative', isActive: true, isDefault: true, description: 'Lead is not interested' },
  { id: 'D08', milestoneId: 'M3', name: 'Meeting Scheduled', type: 'positive', isActive: true, isDefault: false, description: 'Meeting has been booked' },
  { id: 'D09', milestoneId: 'M4', name: 'Demo Scheduled', type: 'positive', isActive: true, isDefault: true, description: 'Product demo has been scheduled' },
  { id: 'D10', milestoneId: 'M4', name: 'Demo Completed', type: 'positive', isActive: true, isDefault: true, description: 'Demo was successfully completed' },
  { id: 'D11', milestoneId: 'M4', name: 'Demo No-Show', type: 'negative', isActive: true, isDefault: true, description: 'Lead did not attend demo' },
  { id: 'D12', milestoneId: 'M5', name: 'Proposal Sent', type: 'positive', isActive: true, isDefault: true, description: 'Proposal has been sent to lead' },
  { id: 'D13', milestoneId: 'M5', name: 'Proposal Viewed', type: 'positive', isActive: true, isDefault: true, description: 'Lead has opened the proposal' },
  { id: 'D14', milestoneId: 'M5', name: 'Needs Revision', type: 'neutral', isActive: true, isDefault: false, description: 'Proposal needs changes' },
  { id: 'D15', milestoneId: 'M6', name: 'Price Discussion', type: 'neutral', isActive: true, isDefault: true, description: 'Negotiating on pricing' },
  { id: 'D16', milestoneId: 'M6', name: 'Contract Review', type: 'positive', isActive: true, isDefault: false, description: 'Lead reviewing contract' },
  { id: 'D17', milestoneId: 'M7', name: 'Deal Closed', type: 'positive', isActive: true, isDefault: true, description: 'Deal has been successfully closed' },
  { id: 'D18', milestoneId: 'M8', name: 'Chose Competitor', type: 'negative', isActive: true, isDefault: true, description: 'Lead chose a competitor product' },
  { id: 'D19', milestoneId: 'M8', name: 'Budget Constraint', type: 'negative', isActive: true, isDefault: true, description: 'Lead does not have budget' },
  { id: 'D20', milestoneId: 'M8', name: 'No Response', type: 'negative', isActive: true, isDefault: true, description: 'Lead stopped responding' },
];

export const INTERACTIONS = [
  { id: 'I001', leadId: 'L001', type: 'call', direction: 'outbound', date: '2026-04-20 10:30', duration: '8 min 32 sec', by: 'Neha Singh', summary: 'Discussed AI calling features. Client interested in demo.', sentiment: 'positive', transcript: true, recording: true },
  { id: 'I002', leadId: 'L001', type: 'email', direction: 'outbound', date: '2026-04-19 14:00', subject: 'Product Demo Invitation', by: 'Neha Singh', summary: 'Sent demo invitation for April 22nd', sentiment: 'neutral' },
  { id: 'I003', leadId: 'L001', type: 'whatsapp', direction: 'inbound', date: '2026-04-19 16:30', by: 'Suresh Reddy', summary: 'Client confirmed demo timing via WhatsApp', sentiment: 'positive' },
  { id: 'I004', leadId: 'L001', type: 'meeting', direction: null, date: '2026-04-18 11:00', duration: '45 min', by: 'Neha Singh', summary: 'Initial discovery call - identified pain points in current calling solution', sentiment: 'positive' },
  { id: 'I005', leadId: 'L003', type: 'call', direction: 'outbound', date: '2026-04-21 09:15', duration: '12 min 04 sec', by: 'Kavya Nair', summary: 'Followed up on proposal. Timeline pushed to end of April.', sentiment: 'neutral', transcript: true },
  { id: 'I006', leadId: 'L003', type: 'email', direction: 'outbound', date: '2026-04-17 11:00', subject: 'Proposal - FinEdge Capital', by: 'Kavya Nair', summary: 'Sent detailed proposal with pricing', sentiment: 'positive' },
];

export const INVOICES = [
  { id: 'INV-2026-001', clientId: 'C001', clientName: 'EduSpark Academy', amount: 145000, gst: 26100, total: 171100, status: 'paid', issueDate: '2026-04-15', dueDate: '2026-04-30', paidDate: '2026-04-20', items: [{ desc: 'AI Calling - Annual License', amount: 100000 }, { desc: 'CRM Module', amount: 45000 }] },
  { id: 'INV-2026-002', clientId: 'C002', clientName: 'Apex Manufacturing', amount: 140000, gst: 25200, total: 165200, status: 'paid', issueDate: '2026-04-01', dueDate: '2026-04-15', paidDate: '2026-04-14', items: [{ desc: 'AI Calling - Semi-Annual', amount: 90000 }, { desc: 'Analytics Dashboard', amount: 50000 }] },
  { id: 'INV-2026-003', clientId: 'C003', clientName: 'GlobalTrade Corp', amount: 97500, gst: 17550, total: 115050, status: 'unpaid', issueDate: '2026-04-10', dueDate: '2026-04-25', paidDate: null, items: [{ desc: 'CRM Module - Q2', amount: 48750 }, { desc: 'Analytics - Q2', amount: 48750 }] },
  { id: 'INV-2026-004', clientId: 'C004', clientName: 'TechWave Labs', amount: 210000, gst: 37800, total: 247800, status: 'partial', issueDate: '2026-04-01', dueDate: '2026-04-30', paidDate: null, paidAmount: 124000, items: [{ desc: 'Enterprise Suite - Q2', amount: 210000 }] },
  { id: 'INV-2026-005', clientId: 'C002', clientName: 'Apex Manufacturing', amount: 140000, gst: 25200, total: 165200, status: 'unpaid', issueDate: '2026-04-20', dueDate: '2026-05-05', paidDate: null, items: [{ desc: 'AI Calling - Semi-Annual (Period 2)', amount: 90000 }, { desc: 'Analytics Dashboard (Period 2)', amount: 50000 }] },
];

export const AI_STATS = {
  totalCalls: 3842,
  sttMinutes: 19210,
  ttsMinutes: 8430,
  llmTokens: 48_200_000,
  avgCostPerClient: 4200,
  callsThisMonth: 642,
  transcriptsGenerated: 3210,
  sentimentAnalyzed: 2980,
  autoScoringRuns: 1856,
};

export const MONTHLY_DATA = [
  { month: 'Nov', leads: 42, won: 8, lost: 5, revenue: 440000 },
  { month: 'Dec', leads: 55, won: 12, lost: 6, revenue: 680000 },
  { month: 'Jan', leads: 61, won: 14, lost: 8, revenue: 820000 },
  { month: 'Feb', leads: 48, won: 10, lost: 7, revenue: 590000 },
  { month: 'Mar', leads: 72, won: 18, lost: 9, revenue: 1100000 },
  { month: 'Apr', leads: 65, won: 15, lost: 4, revenue: 980000 },
];

export const BDE_PERFORMANCE = [
  { name: 'Neha Singh', calls: 142, meetings: 28, deals: 6, revenue: 420000, target: 500000, team: 'Alpha' },
  { name: 'Akash Patel', calls: 118, meetings: 22, deals: 5, revenue: 365000, target: 500000, team: 'Alpha' },
  { name: 'Sonia Gupta', calls: 156, meetings: 31, deals: 7, revenue: 480000, target: 500000, team: 'Alpha' },
  { name: 'Kavya Nair', calls: 134, meetings: 26, deals: 6, revenue: 445000, target: 500000, team: 'Beta' },
  { name: 'Deepak Verma', calls: 62, meetings: 11, deals: 2, revenue: 155000, target: 500000, team: 'Beta' },
];

export const SOURCE_DATA = [
  { source: 'Website', leads: 28, converted: 9, rate: 32 },
  { source: 'LinkedIn', leads: 22, converted: 8, rate: 36 },
  { source: 'Google Ads', leads: 18, converted: 5, rate: 28 },
  { source: 'Referral', leads: 15, converted: 7, rate: 47 },
  { source: 'Partner', leads: 10, converted: 4, rate: 40 },
];

export const FUNNEL_DATA = [
  { stage: 'New', count: 65, color: '#6366f1' },
  { stage: 'Contacted', count: 52, color: '#06b6d4' },
  { stage: 'Qualified', count: 38, color: '#8b5cf6' },
  { stage: 'Demo', count: 26, color: '#f59e0b' },
  { stage: 'Proposal', count: 18, color: '#3b82f6' },
  { stage: 'Negotiation', count: 11, color: '#ec4899' },
  { stage: 'Won', count: 7, color: '#10b981' },
];
