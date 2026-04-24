import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ─── TEAMS ────────────────────────────────────────────────────────
  const teamAlpha = await prisma.team.upsert({
    where: { name: 'Team Alpha' },
    update: {},
    create: { name: 'Team Alpha' },
  });
  const teamBeta = await prisma.team.upsert({
    where: { name: 'Team Beta' },
    update: {},
    create: { name: 'Team Beta' },
  });
  console.log('Teams seeded');

  // ─── USERS ────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('Vertical@123', 10);

  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@vertical.ai' },
    update: {},
    create: {
      name: 'Arjun Mehta', email: 'arjun@vertical.ai', passwordHash: hash,
      role: 'SUPER_ADMIN', avatar: 'AM', phone: '+91 98765 43210',
      territory: 'All India', isActive: true,
    },
  });
  const priya = await prisma.user.upsert({
    where: { email: 'priya@vertical.ai' },
    update: {},
    create: {
      name: 'Priya Sharma', email: 'priya@vertical.ai', passwordHash: hash,
      role: 'TEAM_LEAD', avatar: 'PS', phone: '+91 98765 43211',
      territory: 'North India', teamId: teamAlpha.id, isActive: true,
    },
  });
  const ravi = await prisma.user.upsert({
    where: { email: 'ravi@vertical.ai' },
    update: {},
    create: {
      name: 'Ravi Kumar', email: 'ravi@vertical.ai', passwordHash: hash,
      role: 'TEAM_LEAD', avatar: 'RK', phone: '+91 98765 43212',
      territory: 'South India', teamId: teamBeta.id, isActive: true,
    },
  });
  const neha = await prisma.user.upsert({
    where: { email: 'neha@vertical.ai' },
    update: {},
    create: {
      name: 'Neha Singh', email: 'neha@vertical.ai', passwordHash: hash,
      role: 'BDE', avatar: 'NS', phone: '+91 98765 43213',
      territory: 'Delhi NCR', teamId: teamAlpha.id, isActive: true,
    },
  });
  const akash = await prisma.user.upsert({
    where: { email: 'akash@vertical.ai' },
    update: {},
    create: {
      name: 'Akash Patel', email: 'akash@vertical.ai', passwordHash: hash,
      role: 'BDE', avatar: 'AP', phone: '+91 98765 43214',
      territory: 'Rajasthan', teamId: teamAlpha.id, isActive: true,
    },
  });
  const kavya = await prisma.user.upsert({
    where: { email: 'kavya@vertical.ai' },
    update: {},
    create: {
      name: 'Kavya Nair', email: 'kavya@vertical.ai', passwordHash: hash,
      role: 'BDE', avatar: 'KN', phone: '+91 98765 43215',
      territory: 'Kerala', teamId: teamBeta.id, isActive: true,
    },
  });
  const deepak = await prisma.user.upsert({
    where: { email: 'deepak@vertical.ai' },
    update: {},
    create: {
      name: 'Deepak Verma', email: 'deepak@vertical.ai', passwordHash: hash,
      role: 'BDE', avatar: 'DV', phone: '+91 98765 43216',
      territory: 'Karnataka', teamId: teamBeta.id, isActive: false,
    },
  });
  const sonia = await prisma.user.upsert({
    where: { email: 'sonia@vertical.ai' },
    update: {},
    create: {
      name: 'Sonia Gupta', email: 'sonia@vertical.ai', passwordHash: hash,
      role: 'BDE', avatar: 'SG', phone: '+91 98765 43217',
      territory: 'UP', teamId: teamAlpha.id, isActive: true,
    },
  });
  console.log('Users seeded');

  // ─── MILESTONES ───────────────────────────────────────────────────
  const milestoneData = [
    { name: 'New',              order: 1,  color: '#6366f1' },
    { name: 'First Call',       order: 2,  color: '#06b6d4' },
    { name: 'Demo Scheduled',   order: 3,  color: '#8b5cf6' },
    { name: 'Demo Completed',   order: 4,  color: '#f59e0b' },
    { name: 'Demo Postponed',   order: 5,  color: '#f97316' },
    { name: 'Proposal Shared',  order: 6,  color: '#3b82f6' },
    { name: 'PS & Dropped',     order: 7,  color: '#9ca3af' },
    { name: 'Negotiation',      order: 8,  color: '#ec4899' },
    { name: 'Deal Closed',      order: 9,  color: '#10b981' },
    { name: 'Not Interested',   order: 10, color: '#ef4444' },
  ];

  const milestones: Record<string, any> = {};
  for (const m of milestoneData) {
    milestones[m.name] = await prisma.milestone.upsert({
      where: { name: m.name }, update: {}, create: m,
    });
  }
  console.log('Milestones seeded');

  // ─── DISPOSITIONS ─────────────────────────────────────────────────
  const dispositionData = [
    { milestone: 'New',            name: 'Not Contacted',     type: 'neutral'  as const, isDefault: true,  description: 'Lead has not been contacted yet' },
    { milestone: 'First Call',     name: 'Call Connected',    type: 'positive' as const, isDefault: true,  description: 'Successfully connected on call' },
    { milestone: 'First Call',     name: 'Call Not Picked',   type: 'neutral'  as const, isDefault: true,  description: 'Call was not answered' },
    { milestone: 'First Call',     name: 'Invalid Number',    type: 'negative' as const, isDefault: true,  description: 'Phone number is invalid' },
    { milestone: 'First Call',     name: 'Callback Requested',type: 'positive' as const, isDefault: true,  description: 'Lead requested a callback' },
    { milestone: 'Demo Scheduled', name: 'Interest Confirmed',type: 'positive' as const, isDefault: true,  description: 'Lead confirmed interest in product' },
    { milestone: 'Demo Scheduled', name: 'Not Interested',    type: 'negative' as const, isDefault: true,  description: 'Lead is not interested' },
    { milestone: 'Demo Scheduled', name: 'Meeting Scheduled', type: 'positive' as const, isDefault: false, description: 'Meeting has been booked' },
    { milestone: 'Demo Completed', name: 'Demo Scheduled',    type: 'positive' as const, isDefault: true,  description: 'Product demo has been scheduled' },
    { milestone: 'Demo Completed', name: 'Demo Completed',    type: 'positive' as const, isDefault: true,  description: 'Demo was successfully completed' },
    { milestone: 'Demo Completed', name: 'Demo No-Show',      type: 'negative' as const, isDefault: true,  description: 'Lead did not attend demo' },
    { milestone: 'Demo Postponed', name: 'Proposal Sent',     type: 'positive' as const, isDefault: true,  description: 'Proposal has been sent to lead' },
    { milestone: 'Demo Postponed', name: 'Proposal Viewed',   type: 'positive' as const, isDefault: true,  description: 'Lead has opened the proposal' },
    { milestone: 'Demo Postponed', name: 'Needs Revision',    type: 'neutral'  as const, isDefault: false, description: 'Proposal needs changes' },
    { milestone: 'Negotiation',    name: 'Price Discussion',  type: 'neutral'  as const, isDefault: true,  description: 'Negotiating on pricing' },
    { milestone: 'Negotiation',    name: 'Contract Review',   type: 'positive' as const, isDefault: false, description: 'Lead reviewing contract' },
    { milestone: 'Deal Closed',    name: 'Deal Closed',       type: 'positive' as const, isDefault: true,  description: 'Deal has been successfully closed' },
    { milestone: 'Not Interested', name: 'Chose Competitor',  type: 'negative' as const, isDefault: true,  description: 'Lead chose a competitor product' },
    { milestone: 'Not Interested', name: 'Budget Constraint', type: 'negative' as const, isDefault: true,  description: 'Lead does not have budget' },
    { milestone: 'Not Interested', name: 'No Response',       type: 'negative' as const, isDefault: true,  description: 'Lead stopped responding' },
  ];

  const dispositions: Record<string, any> = {};
  for (const d of dispositionData) {
    const key = `${d.milestone}:${d.name}`;
    dispositions[key] = await prisma.disposition.create({
      data: {
        milestoneId: milestones[d.milestone].id,
        name: d.name, type: d.type, isDefault: d.isDefault,
        description: d.description, isActive: true,
      },
    });
  }
  console.log('Dispositions seeded');

  // ─── LEADS ────────────────────────────────────────────────────────
  const leadsData = [
    {
      companyName: 'TechNova Solutions', contactName: 'Suresh Reddy',
      email: 'suresh@technova.com', phone: '+91 99001 12345',
      source: 'Website', assignedTo: neha, milestone: 'Demo Scheduled',
      disposition: 'Demo Scheduled', score: 85, priority: 'High' as const,
      value: 180000, probability: 70, status: 'active' as const,
      expectedClose: new Date('2026-05-15'), tags: ['SaaS', 'Enterprise'],
      notes: 'Interested in AI calling solution',
    },
    {
      companyName: 'GreenBridge Infra', contactName: 'Ananya Krishnan',
      email: 'ananya@greenbridge.in', phone: '+91 99002 23456',
      source: 'LinkedIn', assignedTo: akash, milestone: 'First Call',
      disposition: 'Call Connected', score: 72, priority: 'Medium' as const,
      value: 95000, probability: 50, status: 'active' as const,
      expectedClose: new Date('2026-05-30'), tags: ['Real Estate'],
      notes: 'Needs demo next week',
    },
    {
      companyName: 'FinEdge Capital', contactName: 'Mohit Agarwal',
      email: 'mohit@finedge.com', phone: '+91 99003 34567',
      source: 'Referral', assignedTo: kavya, milestone: 'Proposal Shared',
      disposition: 'Proposal Sent', score: 91, priority: 'High' as const,
      value: 350000, probability: 80, status: 'active' as const,
      expectedClose: new Date('2026-05-01'), tags: ['FinTech', 'Enterprise'],
      notes: 'Decision expected end of April',
    },
    {
      companyName: 'SwiftLogix', contactName: 'Divya Menon',
      email: 'divya@swiftlogix.com', phone: '+91 99004 45678',
      source: 'Google Ads', assignedTo: sonia, milestone: 'Negotiation',
      disposition: 'Price Discussion', score: 88, priority: 'High' as const,
      value: 220000, probability: 85, status: 'active' as const,
      expectedClose: new Date('2026-04-28'), tags: ['Logistics'],
      notes: 'Budget approved, negotiating terms',
    },
    {
      companyName: 'HealthFirst Clinics', contactName: 'Rajesh Pillai',
      email: 'rajesh@healthfirst.in', phone: '+91 99005 56789',
      source: 'Website', assignedTo: neha, milestone: 'First Call',
      disposition: 'Call Not Picked', score: 45, priority: 'Low' as const,
      value: 60000, probability: 20, status: 'active' as const,
      expectedClose: new Date('2026-06-30'), tags: ['Healthcare'],
      notes: 'Follow up needed',
    },
    {
      companyName: 'EduSpark Academy', contactName: 'Pooja Iyer',
      email: 'pooja@eduspark.com', phone: '+91 99006 67890',
      source: 'Website', assignedTo: akash, milestone: 'Deal Closed',
      disposition: 'Deal Closed', score: 95, priority: 'High' as const,
      value: 145000, probability: 100, status: 'won' as const,
      expectedClose: new Date('2026-04-10'), tags: ['EdTech'],
      notes: 'Closed successfully',
    },
    {
      companyName: 'RetailMax Chain', contactName: 'Amit Joshi',
      email: 'amit@retailmax.com', phone: '+91 99007 78901',
      source: 'Partner', assignedTo: kavya, milestone: 'Not Interested',
      disposition: 'Chose Competitor', score: 30, priority: 'Low' as const,
      value: 80000, probability: 0, status: 'lost' as const,
      expectedClose: new Date('2026-03-31'), tags: ['Retail'],
      notes: 'Went with competitor',
    },
    {
      companyName: 'Cloudify Systems', contactName: 'Nisha Batra',
      email: 'nisha@cloudify.io', phone: '+91 99008 89012',
      source: 'LinkedIn', assignedTo: sonia, milestone: 'New',
      disposition: 'Not Contacted', score: 60, priority: 'Medium' as const,
      value: 120000, probability: 30, status: 'active' as const,
      expectedClose: new Date('2026-06-15'), tags: ['SaaS'],
      notes: 'Fresh lead from campaign',
    },
    {
      companyName: 'Sunrise Builders', contactName: 'Venkat Rao',
      email: 'venkat@sunrisebuilders.com', phone: '+91 99009 90123',
      source: 'Google Ads', assignedTo: neha, milestone: 'Demo Completed',
      disposition: 'Demo Completed', score: 78, priority: 'Medium' as const,
      value: 165000, probability: 60, status: 'active' as const,
      expectedClose: new Date('2026-05-20'), tags: ['Real Estate', 'Construction'],
      notes: 'Demo went well, proposal pending',
    },
    {
      companyName: 'Nexus Digital', contactName: 'Sara Khan',
      email: 'sara@nexusdigital.in', phone: '+91 99010 01234',
      source: 'Referral', assignedTo: deepak, milestone: 'Demo Scheduled',
      disposition: 'Meeting Scheduled', score: 66, priority: 'Medium' as const,
      value: 75000, probability: 45, status: 'active' as const,
      expectedClose: new Date('2026-06-01'), tags: ['Digital Marketing'],
      notes: 'Product fit confirmed',
    },
  ];

  const leads: any[] = [];
  for (const l of leadsData) {
    const milestoneObj = milestones[l.milestone];
    const dispKey = `${l.milestone}:${l.disposition}`;
    const dispositionObj = dispositions[dispKey];

    const lead = await prisma.lead.create({
      data: {
        companyName: l.companyName, contactName: l.contactName,
        email: l.email, phone: l.phone, source: l.source,
        milestoneId: milestoneObj?.id, dispositionId: dispositionObj?.id,
        status: l.status, priority: l.priority, score: l.score,
        value: l.value, probability: l.probability,
        expectedClose: l.expectedClose, tags: l.tags, notes: l.notes,
        assignedToId: l.assignedTo.id, createdById: arjun.id,
      },
    });
    leads.push(lead);
  }
  console.log('Leads seeded');

  // ─── INTERACTIONS ─────────────────────────────────────────────────
  await prisma.interaction.createMany({
    data: [
      {
        leadId: leads[0].id, type: 'call', direction: 'outbound',
        duration: '8 min 32 sec', performedById: neha.id,
        summary: 'Discussed AI calling features. Client interested in demo.',
        sentiment: 'positive', hasTranscript: true, hasRecording: true,
      },
      {
        leadId: leads[0].id, type: 'email', direction: 'outbound',
        subject: 'Product Demo Invitation', performedById: neha.id,
        summary: 'Sent demo invitation for April 22nd', sentiment: 'neutral',
      },
      {
        leadId: leads[0].id, type: 'whatsapp', direction: 'inbound',
        performedById: neha.id,
        summary: 'Client confirmed demo timing via WhatsApp', sentiment: 'positive',
      },
      {
        leadId: leads[0].id, type: 'meeting', direction: 'outbound',
        duration: '45 min', performedById: neha.id,
        summary: 'Initial discovery call - identified pain points in current calling solution',
        sentiment: 'positive',
      },
      {
        leadId: leads[2].id, type: 'call', direction: 'outbound',
        duration: '12 min 04 sec', performedById: kavya.id,
        summary: 'Followed up on proposal. Timeline pushed to end of April.',
        sentiment: 'neutral', hasTranscript: true,
      },
      {
        leadId: leads[2].id, type: 'email', direction: 'outbound',
        subject: 'Proposal - FinEdge Capital', performedById: kavya.id,
        summary: 'Sent detailed proposal with pricing', sentiment: 'positive',
      },
    ],
  });
  console.log('Interactions seeded');

  // ─── TASKS ────────────────────────────────────────────────────────
  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const dueDate = new Date(Date.now() + (i - 2) * 86400000);
    const status = i % 4 === 0 ? 'completed' : (i % 3 === 0 ? 'overdue' : 'pending');
    const assignedUser = [neha, akash, kavya, sonia, deepak][i % 5];

    await prisma.task.create({
      data: {
        title: `Follow up with ${lead.companyName}`,
        leadId: lead.id, assignedToId: assignedUser.id,
        createdById: arjun.id, dueDate, status: status as any,
      },
    });
  }
  console.log('Tasks seeded');

  // ─── CLIENTS ──────────────────────────────────────────────────────
  const c1 = await prisma.client.create({
    data: {
      companyName: 'EduSpark Academy', contactName: 'Pooja Iyer',
      email: 'pooja@eduspark.com', phone: '+91 99006 67890',
      linkedLeadId: leads[5].id,
      products: ['AI Calling', 'CRM'], orderValue: 145000,
      contractDuration: '12 months',
      startDate: new Date('2026-04-15'), renewalDate: new Date('2027-04-15'),
      accountManagerId: kavya.id, status: 'active', industry: 'EdTech',
    },
  });
  const c2 = await prisma.client.create({
    data: {
      companyName: 'Apex Manufacturing', contactName: 'Rahul Desai',
      email: 'rahul@apexmfg.com', phone: '+91 99011 11111',
      products: ['AI Calling', 'Analytics'], orderValue: 280000,
      contractDuration: '24 months',
      startDate: new Date('2026-01-01'), renewalDate: new Date('2028-01-01'),
      accountManagerId: neha.id, status: 'active', industry: 'Manufacturing',
    },
  });
  const c3 = await prisma.client.create({
    data: {
      companyName: 'GlobalTrade Corp', contactName: "Jennifer D'souza",
      email: 'jennifer@globaltrade.com', phone: '+91 99012 22222',
      products: ['CRM', 'Analytics'], orderValue: 195000,
      contractDuration: '12 months',
      startDate: new Date('2025-10-01'), renewalDate: new Date('2026-10-01'),
      accountManagerId: akash.id, status: 'renewal_due', industry: 'Trade',
    },
  });
  const c4 = await prisma.client.create({
    data: {
      companyName: 'TechWave Labs', contactName: 'Siddharth Jain',
      email: 'sid@techwavlabs.com', phone: '+91 99013 33333',
      products: ['AI Calling', 'CRM', 'Analytics'], orderValue: 420000,
      contractDuration: '24 months',
      startDate: new Date('2026-02-01'), renewalDate: new Date('2028-02-01'),
      accountManagerId: sonia.id, status: 'active', industry: 'Technology',
    },
  });
  console.log('Clients seeded');

  // ─── INVOICES ─────────────────────────────────────────────────────
  const invoiceData = [
    {
      invoiceNumber: 'INV-2026-001', client: c1, amount: 145000, gst: 26100, total: 171100,
      status: 'paid' as const, issueDate: new Date('2026-04-15'), dueDate: new Date('2026-04-30'),
      paidDate: new Date('2026-04-20'),
      items: [{ description: 'AI Calling - Annual License', amount: 100000 }, { description: 'CRM Module', amount: 45000 }],
    },
    {
      invoiceNumber: 'INV-2026-002', client: c2, amount: 140000, gst: 25200, total: 165200,
      status: 'paid' as const, issueDate: new Date('2026-04-01'), dueDate: new Date('2026-04-15'),
      paidDate: new Date('2026-04-14'),
      items: [{ description: 'AI Calling - Semi-Annual', amount: 90000 }, { description: 'Analytics Dashboard', amount: 50000 }],
    },
    {
      invoiceNumber: 'INV-2026-003', client: c3, amount: 97500, gst: 17550, total: 115050,
      status: 'unpaid' as const, issueDate: new Date('2026-04-10'), dueDate: new Date('2026-04-25'),
      items: [{ description: 'CRM Module - Q2', amount: 48750 }, { description: 'Analytics - Q2', amount: 48750 }],
    },
    {
      invoiceNumber: 'INV-2026-004', client: c4, amount: 210000, gst: 37800, total: 247800,
      status: 'partial' as const, issueDate: new Date('2026-04-01'), dueDate: new Date('2026-04-30'),
      paidAmount: 124000,
      items: [{ description: 'Enterprise Suite - Q2', amount: 210000 }],
    },
    {
      invoiceNumber: 'INV-2026-005', client: c2, amount: 140000, gst: 25200, total: 165200,
      status: 'unpaid' as const, issueDate: new Date('2026-04-20'), dueDate: new Date('2026-05-05'),
      items: [{ description: 'AI Calling - Semi-Annual (Period 2)', amount: 90000 }, { description: 'Analytics Dashboard (Period 2)', amount: 50000 }],
    },
  ];

  for (const inv of invoiceData) {
    await prisma.invoice.create({
      data: {
        invoiceNumber: inv.invoiceNumber,
        clientId: inv.client.id,
        amount: inv.amount, gst: inv.gst, total: inv.total,
        status: inv.status,
        issueDate: inv.issueDate, dueDate: inv.dueDate,
        paidDate: inv.paidDate ?? null,
        paidAmount: inv.paidAmount ?? null,
        items: { create: inv.items },
      },
    });
  }
  console.log('Invoices seeded');

  console.log('Database seeded successfully!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
