// services/analytics.js — lightweight client analytics using localStorage
export const Analytics = {
  track: (event, data = {}) => {
    const log = JSON.parse(localStorage.getItem("tn_analytics") || "[]");
    log.push({ event, data, ts: Date.now() });
    localStorage.setItem("tn_analytics", JSON.stringify(log.slice(-200)));
  },
  getTopSites: () => {
    const log  = JSON.parse(localStorage.getItem("tn_analytics") || "[]");
    const views = log.filter(e => e.event === "site_view");
    const counts = {};
    views.forEach(v => { counts[v.data.name] = (counts[v.data.name] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
  },
};
export default Analytics;
