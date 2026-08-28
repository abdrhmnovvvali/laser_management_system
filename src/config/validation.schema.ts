import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('30d'),

  SWAGGER_PATH: Joi.string().default('api/docs'),

  MAX_IMPORT_FILE_SIZE_MB: Joi.number().default(10),

  PRINTER_SERVICE_URL: Joi.string().optional().allow(''),

  LOYALTY_VISITS_BEFORE_FREE_ZONE: Joi.number().integer().min(0).default(6),
});
