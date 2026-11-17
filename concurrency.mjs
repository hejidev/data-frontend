const API = process.env.API || 'http://localhost:8080/api';
const res = await Promise.all(
  Array.from({ length: 10 }, () =>
    fetch(`${API}/orders/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TOKEN}` },
      body: JSON.stringify({ planId: process.env.PLAN_ID, phoneNumber: '08031234567' }),
    }).then((r) => r.json())
  )
);
console.log(res.map((r) => r.success ?? r.pending ?? r.code));