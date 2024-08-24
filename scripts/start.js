import { exec } from 'child_process';
import dotenv from 'dotenv';
import { process, cwd } from 'process';
import { console } from 'console';

dotenv.config();

// Configuration
const image = process.env.CLI_IMAGE;
const path = cwd();

const command = `docker run --name yours_blockchain -d --network yours_network -p 7740:7740 -p 7750:7750 -p 9090:9090 -v ${path}:/usr/app ${image} chr node start`;
console.log(`>> Starting with command: ${command}`);

exec(command, (err, stdout, stderr) => {
  if (err) {
    console.error('>> Error:', '\n', err);
    return;
  }

  if (stderr) console.error('>> stdError:', '\n', stderr);
  console.log('>> Container running with:', '\n', `  RESULT: ${stdout}`);
});
