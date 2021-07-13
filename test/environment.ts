import * as path from "path";
import { DockerComposeEnvironment, StartedDockerComposeEnvironment, Wait } from 'testcontainers';

const composeFile = 'docker-compose.e2e.yml';
const composeFilePath = path.resolve(__dirname, `..`);

export class Environment {
  private static instance: Environment;
  private environment: StartedDockerComposeEnvironment;

  public static get Instance(): Environment {
    if (!this.instance) {
      this.instance = new Environment();
    }

    return this.instance;
  }

  public async createEnvironment(): Promise<void> {
    this.environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
      .withEnv('PORT', process.env.PORT as string)
      .withEnv('MYSQL_HOST', process.env.MYSQL_HOST)
      .withEnv('MYSQL_ROOT_PASSWORD', process.env.MYSQL_ROOT_PASSWORD as string)
      .withEnv('MYSQL_USER', process.env.MYSQL_USER as string)
      .withEnv('MYSQL_PASSWORD', process.env.MYSQL_PASSWORD as string)
      .withEnv('MYSQL_DATABASE', process.env.MYSQL_DATABASE as string)
      .withEnv('DEFAULT_DB_RUN_MIGRATIONS', process.env.DEFAULT_DB_RUN_MIGRATIONS as string)
      .withEnv('DEFAULT_DB_DROP_SCHEMA', process.env.DEFAULT_DB_DROP_SCHEMA as string)
      .withEnv('DEFAULT_DB_LOGGING', process.env.DEFAULT_DB_LOGGING as string)
      .withEnv('PRIVATE_KEY', process.env.PRIVATE_KEY as string)
      .withWaitStrategy('nest-test-app', Wait.forLogMessage(/Server started on port = 9000/))
      .withWaitStrategy("mysql-e2e-test", Wait.forLogMessage(/ready for connections./))
      .up();
  };
      
  public getEnvironment(): StartedDockerComposeEnvironment {
    return this.environment;
  };

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
  };
};

const environmentInstance = Environment.Instance;

export const setupEnv = async (): Promise<void> => {
  try {
    await environmentInstance.createEnvironment();
  } catch (error) {
    console.log(error);
  }
};

export const downEnv = async (): Promise<void> => {
  try {
    await environmentInstance.getEnvironment().down();
  } catch (error) {
    console.log(error);
  }
};
