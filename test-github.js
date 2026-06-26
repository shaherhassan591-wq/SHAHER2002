async function searchRepos() {
  const repos = [
    "itqandev/prophet-reminder",
    "bensmida/prophet-reminder",
    "prophet-reminder/prophet-reminder",
    "muslim-remembrance/prophet-reminder",
    "salawat-reminder/prophet-reminder",
    "MuslimAmany/prophet-reminder",
    "AmanyMuslim/prophet-reminder",
    "SallaRemind/prophet-reminder"
  ];
  for (const repo of repos) {
    try {
      console.log(`\nChecking ${repo}...`);
      const res = await fetch(`https://api.github.com/repos/${repo}/contents`, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      console.log("Status:", res.status);
      if (res.status === 200) {
        const data = await res.json();
        const files = Array.isArray(data) ? data.map(f => f.name) : [];
        console.log("Files:", files);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
searchRepos();
