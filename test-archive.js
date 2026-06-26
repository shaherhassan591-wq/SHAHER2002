async function runTest(id, filename) {
  const url = `https://archive.org/download/${id}/${encodeURIComponent(filename)}`;
  try {
    const res = await fetch(url);
    console.log(`${id} (${filename}) -> Status: ${res.status}, Type: ${res.headers.get("content-type")}, Size: ${res.headers.get("content-length")}`);
  } catch (e) {
    console.log(`${id} failed:`, e.message);
  }
}

async function run() {
  await runTest("nbeslo3leh", "النبي صلوا عليه.mp3");
  await runTest("20250205_20250205_1301", "حسين الجسمي - صلوا عليه.mp3");
}
run();
