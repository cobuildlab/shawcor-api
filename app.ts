import 'dotenv/config';
import express from 'express';

import router from './src/routes';

const app = express();
const port = 3000;

// JSON Parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
