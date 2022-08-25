const { env } = process;

export const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_REGION = env.AWS_REGION || '';
export const PATH_POST_INVOICE_OPEN_INVOICE =
  env.PATH_POST_INVOICE_OPEN_INVOICE || '';
export const PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE =
  env.PATH_GET_INVOICE_RESPONSE_OPEN_INVOICE || '';
export const PATH_PFX = env.PATH_PFX || '';
export const PASSPHRASE = env.PASSPHRASE || '';
