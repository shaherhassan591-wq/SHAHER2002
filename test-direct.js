const list = [
  "https://archive.org/download/remindsalla/remindsalla.mp3",
  "https://archive.org/download/azkar-sound/salah-pro-1.mp3",
  "https://archive.org/download/SalawatReminder/salawat2.mp3",
  "https://archive.org/download/SalawatReminder/salawat3.mp3",
  "https://ia800403.us.archive.org/8/items/azkar-sound/salah-pro-2.mp3"
];

async function run() {
  for (const url of list) {
    try {
      const res = await fetch(url, {
        method: "HEAD", // check with head request
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      console.log(`${url} -> Status: ${res.status}, Type: ${res.headers.get("content-type")}, Size: ${res.headers.get("content-length")}`);
      if (res.status === 302 || res.status === 301) {
        console.log(`Redirects to: ${res.headers.get("location")}`);
      }
    } catch (e) {
      console.log(`Failed on ${url}:`, e.message);
    }
  }
}
run();
