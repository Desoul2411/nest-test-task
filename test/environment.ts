import * as path from "path";
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';
import * as dotenv from "dotenv";


/* console.log(`============ env-setup (environment) Loaded ===========`);
dotenv.config({ path: path.resolve(process.cwd(), 'test', 'settings', '.test.env') }); */

/* import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

import { rabbitmqExchanges } from 'enums/rabbitmq';
 */
/* import configuration, { Config } from '../config/configuration'; */

const composeFile = 'docker-compose.e2e.yml';
const composeFilePath = path.resolve(__dirname, `..`);


export class Environment {
  private static instance: Environment;
  private environment: StartedDockerComposeEnvironment;
/*   private amqpConnection: AmqpConnection;
  private config: Config;
 */

/*   private constructor() {
    this.config = configuration();
  }
 */
  public static get Instance(): Environment {
    if (!this.instance) {
      this.instance = new Environment();
    }

    return this.instance;
  }

  public async createEnvironment(): Promise<void> {
    console.log('composeFilePath', composeFilePath);
    this.environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
      .withEnv('MYSQL_HOST', process.env.MYSQL_HOST)
      .withEnv('MYSQL_ROOT_PASSWORD', process.env.MYSQL_ROOT_PASSWORD as string)
      .withEnv('MYSQL_USER', process.env.MYSQL_USER as string)
      .withEnv('MYSQL_PASSWORD', process.env.MYSQL_PASSWORD as string)
      .withEnv('MYSQL_DATABASE', process.env.MYSQL_DATABASE as string)
      .withEnv('DEFAULT_DB_RUN_MIGRATIONS', process.env.DEFAULT_DB_RUN_MIGRATIONS as string)
      .withEnv('DEFAULT_DB_DROP_SCHEMA', process.env.DEFAULT_DB_DROP_SCHEMA as string)
      .withEnv('DEFAULT_DB_LOGGING', process.env.DEFAULT_DB_LOGGING as string)
      .withEnv('PRIVATE_KEY', process.env.PRIVATE_KEY as string)
      .up();
     /*  .withWaitStrategy('mysql-e2e-test', Wait.forLogMessage(/Server startup complete/))
      .withWaitStrategy('srv-socket-cluster-service', Wait.forLogMessage(/Successfully connected a RabbitMQ channel/)) */
    
  }
      

/*   public createAmpqConnection(): void {
    this.amqpConnection = new AmqpConnection({
      connectionInitOptions: { timeout: 30000, wait: true },
      exchanges: [{ name: rabbitmqExchanges.main }],
      uri: this.config.amqp_url,
    });
  } */


/* 
  public async initAmpqConnection(): Promise<void> {
    await this.amqpConnection.init();
  }

  public getAmqpConnection(): AmqpConnection {
    return this.amqpConnection;
  }
 */
  public getEnvironment(): StartedDockerComposeEnvironment {
    return this.environment;
  }

  public async waitForLog(container_name: string, log: string): Promise<void> {
    const logs = await this.environment.getContainer(container_name).logs();

    return new Promise<void>((resolve, reject) => {
      logs
        .on('data', (line: string) => {
          if (line.includes(log)) {
            resolve();
          }
        })
        .on('err', () => {
          reject();
        })
        .on('end', () => {
          reject();
        });
    });
  }
}

const environmentInstance = Environment.Instance;

export const setupEnv = async (): Promise<void> => {
/*   beforeAll(async () => {
    try { */

    try {
      await environmentInstance.createEnvironment();
    } catch (error) {
      console.log(error);
    }
      
/*       environmentInstance.createAmpqConnection();
      await environmentInstance.initAmpqConnection(); */
/*     } catch (error) {
      console.log(error);
    }
  }); */
};

export const downEnv = (): void => {
  afterAll(async () => {
    try {
     // await environmentInstance.getAmqpConnection().connection.close();
      await environmentInstance.getEnvironment().down();
    } catch (error) {
      console.log(error);
    }
  });
};
