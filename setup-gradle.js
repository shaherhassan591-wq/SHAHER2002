import fs from 'fs';
import https from 'https';
import path from 'path';

const JAR_URL = 'https://raw.githubusercontent.com/gradle/gradle/v8.2.1/gradle/wrapper/gradle-wrapper.jar';

const paths = [
  path.join(process.cwd(), 'android-config', 'gradle-wrapper.jar'),
  path.join(process.cwd(), 'android', 'gradle', 'wrapper', 'gradle-wrapper.jar')
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    
    // If destination contains 'android/' but the native structure wasn't initialized yet,
    // skip it (it will be copied by GitHub Actions or Capacitor sync during build).
    if (dest.includes('android/') && !fs.existsSync(path.join(process.cwd(), 'android'))) {
      resolve();
      return;
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      // Handle potential redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        reject(new Error(`Server responded with HTTP ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);
        console.log(`Successfully validated: ${dest} (${stats.size} bytes)`);
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('====================================================');
  console.log('       Ana Muslim - Seamless Gradle Hydrator        ');
  console.log('====================================================');
  console.log('Fetching stable Gradle Wrapper JAR...');
  for (const dest of paths) {
    try {
      await download(JAR_URL, dest);
    } catch (err) {
      console.warn(`Could not sync jar to: ${dest}`);
      console.warn(`Reason: ${err.message}`);
    }
  }

  // Set executable permission for gradlew
  const gradlewPath = path.join(process.cwd(), 'android', 'gradlew');
  if (fs.existsSync(gradlewPath)) {
    try {
      fs.chmodSync(gradlewPath, 0o755);
      console.log('Successfully set executable permissions for gradlew.');
    } catch (chmodErr) {
      console.warn('Failed to set permissions for gradlew:', chmodErr.message);
    }
  }
  console.log('====================================================');
}

run();
