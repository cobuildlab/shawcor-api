const { env } = process;

export const AWS_ACCESS_KEY_ID = env.AWS_ACCESS_KEY_ID || '';
export const AWS_SECRET_ACCESS_KEY = env.AWS_SECRET_ACCESS_KEY || '';
export const AWS_REGION = env.AWS_SES_REGION || '';
