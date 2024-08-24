import { readFileSync } from 'fs';
import { TIMEOUT_SETUP, TIMEOUT_TEST } from './utils/constants';
import { getTestEnvironment, teardown, TestEnvironment } from './utils/setup';

describe('Module', () => {
  let environment: TestEnvironment;

  beforeAll(async () => {
    environment = await getTestEnvironment();
  }, TIMEOUT_SETUP);

  afterAll(async () => {
    await teardown(
      environment.network,
      environment.chromiaNode,
      environment.postgres
    );
  }, TIMEOUT_SETUP);

  it(
    'able to deploy dapp with sealed module',
    async () => {
      const module = readFileSync('tests/data/module-config.data.xml', 'utf8');
      const dappConfig = readFileSync(
        'tests/data/dapp-config.data.xml',
        'utf8'
      );

      // Upload module
      await environment.client.sendTransaction({
        name: 'sealed.upload_module',
        args: ['example_dapp1/tracker', module],
      });

      // Create dapp & link module
      const blockchainRid = Buffer.from('DEADBEEF', 'hex');
      await environment.client.sendTransaction({
        name: 'sealed.create_dapp',
        args: [blockchainRid],
      });

      await environment.client.sendTransaction({
        name: 'sealed.link_module',
        args: [blockchainRid, 'example_dapp1/tracker'],
      });

      // Submit deployment
      await environment.client.sendTransaction({
        name: 'sealed.submit_deployment',
        args: [blockchainRid, dappConfig],
      });
    },
    TIMEOUT_TEST
  );
});
