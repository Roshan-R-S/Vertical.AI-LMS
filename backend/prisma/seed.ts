import { PrismaClient, LeadStage } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as XLSX from 'xlsx';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const excelPath = path.resolve(__dirname, '../Copy of Zoominfo - 1014 Leads.xlsx');
  console.log('🌱 Starting comprehensive seed from:', excelPath);

  const workbook = XLSX.readFile(excelPath);
  
  // 1. Create default users for each role
  const roles = ['SUPER_ADMIN', 'SALES_ADMIN', 'TEAM_LEAD', 'BDE'] as const;
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all(roles.map(role => 
    prisma.user.upsert({
      where: { email: `${role.toLowerCase()}@vertical.ai` },
      update: {},
      create: {
        email: `${role.toLowerCase()}@vertical.ai`,
        name: `${role.replace('_', ' ')} User`,
        passwordHash,
        role: role as any,
        isActive: true,
      },
    })
  ));

  // 1a. Create specific BDE users: Muthu and Viswa
  const specificBDEs = [
    { name: 'Viswa', email: 'viswa@vertical.ai' }
  ];

  const bdeUsers = await Promise.all(specificBDEs.map(bde =>
    prisma.user.upsert({
      where: { email: bde.email },
      update: {},
      create: {
        email: bde.email,
        name: bde.name,
        passwordHash,
        role: 'BDE',
        isActive: true,
      },
    })
  ));

  const allBDEs = [...users.filter(u => u.role === 'BDE'), ...bdeUsers];
  const defaultUser = allBDEs[0]!;

  let totalImported = 0;

  for (const sheetName of workbook.SheetNames) {
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName!]!);
    console.log(`\n📄 Processing sheet: "${sheetName}" (${data.length} rows)`);

    let sheetImported = 0;
    for (const row of data) {
      try {
        const leadData = mapRowToLead(row, sheetName, defaultUser.id, allBDEs);
        await prisma.lead.create({ data: leadData });
        sheetImported++;
      } catch (err) {
        // Skip rows with missing critical data if necessary
        // console.error(`Error in sheet ${sheetName}:`, err.message);
      }
    }
    console.log(`   ✅ Imported ${sheetImported} leads.`);
    totalImported += sheetImported;
  }

  console.log(`\n🎯 TOTAL SEEDED: ${totalImported} leads.`);
}

function mapRowToLead(row: any, sheetName: string, defaultUserId: string, bdeUsers: any[]) {
  // Normalize fields based on varying headers
  const name = row['Name'] || row['SPOC Name'] || row[' Company '] || 'Unknown';
  const phone = row['Mobile No'] || row['Phone No '] || row['Contact number'] || row['Phone Number 1'] || row['SPOC Contact'] || row['Board No'] || '';
  const email = row['Email'] ? String(row['Email']) : null;
  const company = row['Company'] || row['Company Name'] || row[' Company '] || sheetName;
  const designation = row['Designation'] || row['Job Title'] || '';
  const remarks = row['Remarks'] || '';
  const milestone = row['Milestone'] || row['Disposition'] || '';
  const submilestone = row['Submilestone'] || '';

  return {
    name: String(name),
    phone: String(phone),
    email: email,
    companyName: String(company),
    designation: String(designation),
    remarks: String(remarks),
    stage: mapMilestoneToStage(milestone, submilestone),
    assignedToId: getAssignedToId(row, defaultUserId, bdeUsers),
    teamId: 'DEFAULT_TEAM',
    source: sheetName,
  };
}

function getAssignedToId(row: any, defaultUserId: string, bdeUsers: any[]) {
  // 'Exe' is the primary column in the Excel file, also support other common names
  const assignedBdeName = row['Exe'] || row['exe'] || row['BDE Name'] || row['Assigned BDE'] || row['Assigned To'] || '';
  if (!assignedBdeName) return defaultUserId;

  const normalized = String(assignedBdeName).trim().toLowerCase();
  const bde = bdeUsers.find(u => 
    u.name.toLowerCase() === normalized ||
    u.name.toLowerCase().includes(normalized) ||
    normalized.includes(u.name.toLowerCase())
  );

  return bde ? bde.id : defaultUserId;
}

function mapMilestoneToStage(milestone: any, submilestone: any): LeadStage {
  const m = String(milestone || '').toLowerCase();
  const s = String(submilestone || '').toLowerCase();

  if (m.includes('negotiation') || s.includes('interested')) return 'MEETING_SCHEDULED';
  if (m.includes('back')) return 'CALL_BACK';
  if (m.includes('call')) return 'YET_TO_CALL';
  if (m.includes('meeting')) return 'MEETING_SCHEDULED';
  if (m.includes('proposal')) return 'PROPOSAL_SHARED';
  if (m.includes('payment') || m.includes('hand')) return 'PAYMENT_COMPLETED';
  if (m.includes('lost') || m.includes('not')) return 'LOST';
  
  return 'YET_TO_CALL';
}

main()
  .catch((e) => {
    console.error('❌ SEED FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
