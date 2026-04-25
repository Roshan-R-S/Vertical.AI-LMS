import { getLeaderboard } from './backend/src/modules/analytics/analytics.controller';

// Mocking Request and Response
const req = {
  query: { period: 'month-1' },
  user: { role: 'SUPER_ADMIN' }
};

const res = {
  json: (data) => console.log(JSON.stringify(data, null, 2))
};

async function test() {
  try {
    await getLeaderboard(req, res);
  } catch (err) {
    console.error(err);
  }
}

test();
