import { config } from 'dotenv';
import { cwd } from 'process';
import { IClient, createClient } from 'postchain-client';
import {
  GenericContainer,
  Network,
  StartedNetwork,
  StartedTestContainer,
  Wait,
} from 'testcontainers';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

config();

export interface TestEnvironment {
  client: IClient;
  chromiaNode: StartedTestContainer;
  postgres: StartedPostgreSqlContainer;
  network: StartedNetwork;
}

export async function getTestEnvironment(): Promise<TestEnvironment> {
  // Start a new network for containers
  const network = await new Network().start();

  // Start a PostgreSQL container
  const postgres = await new PostgreSqlContainer('postgres:14.9-alpine3.18')
    .withNetwork(network)
    .withExposedPorts(5432)
    .withDatabase('postchain')
    .withPassword('postchain')
    .withUsername('postchain')
    .withNetworkAliases('postgres')
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections')
    )
    .withStartupTimeout(60000)
    .start();

  const chromiaNodePort = 7740;

  const chromiaNode = await new GenericContainer(process.env.CLI_IMAGE)
    .withNetwork(network)
    .withCopyDirectoriesToContainer([{ source: cwd(), target: '/usr/app' }])
    .withExposedPorts({ container: chromiaNodePort, host: chromiaNodePort })
    .withEnvironment({
      CHR_DB_URL: 'jdbc:postgresql://postgres/postchain',
    })
    .withCommand(['chr', 'node', 'start', '-p', `api.port=${chromiaNodePort}`])
    .withWaitStrategy(
      Wait.forLogMessage(
        'chain-id=0] - [main] BaseBlockchainProcessManager startBlockchain()'
      )
    )
    .withStartupTimeout(60000)
    .start();

  const nodePort = chromiaNode.getMappedPort(chromiaNodePort);

  const client = await createClient({
    nodeUrlPool: `http://localhost:${nodePort}`,
    blockchainIid: 0,
  });

  return {
    client,
    chromiaNode,
    postgres,
    network,
  };
}

export async function teardown(
  network: StartedNetwork,
  chromiaNode: StartedTestContainer,
  postgres: StartedPostgreSqlContainer
) {
  await chromiaNode.stop();
  await postgres.stop();
  await network.stop();
}
