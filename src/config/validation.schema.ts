import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  DATABASE_URL: Joi.string().optional().allow(''),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  SWAGGER_PATH: Joi.string().default('api/docs'),

  MAX_IMPORT_FILE_SIZE_MB: Joi.number().default(10),

  PRINTER_SERVICE_URL: Joi.string().optional().allow(''),
});
