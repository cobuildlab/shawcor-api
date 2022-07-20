import { createLogger } from '@cobuildlab/pure-logger';
import {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
} from './constants';

const { log, flush } = createLogger({
  cloudWatch: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_REGION,
    logGroupName: 'shawcor-api',
    logStreamName: 'local',
  },
});

export { log, flush };
