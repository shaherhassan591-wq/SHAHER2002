const list = [
  "https://www.islamcan.com/audio/dua/dua1.mp3",
  "https://www.islamcan.com/audio/dua/dua2.mp3",
  "https://www.islamcan.com/audio/dua/dua3.mp3",
  "https://www.islamcan.com/audio/adhkar/adhkar1.mp3",
  "https://www.islamcan.com/audio/adhkar/adhkar2.mp3",
  "https://www.islamcan.com/audio/adhkar/subhanallah.mp3",
  "https://www.islamcan.com/audio/adhkar/allahuakbar.mp3"
];

async function run() {
  for (const url of list) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      console.log(`${url} -> Status: ${res.status}, Size: ${res.headers.get("content-length")}`);
    } catch (e) {
      console.log(`Failed on ${url}:`, e.message);
    }
  }
}
run();
