const delay = () => new Promise(r => setTimeout(r, 800 + Math.random() * 1000));

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchJson<T>(path: string): Promise<T> {
  await delay();
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  getDashboard: () => fetchJson<Record<string, unknown>>("/data/dashboard.json"),
  getCustomers: () => fetchJson<unknown[]>("/data/customers.json"),
  getCustomer: (id: number) => fetchJson<Record<string, unknown>>(`/data/customer-${id}.json`),
  getAnalytics: () => fetchJson<Record<string, unknown>>("/data/analytics.json"),
  getSettings: () => fetchJson<Record<string, unknown>>("/data/settings.json"),
};
