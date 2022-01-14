// import { config } from 'dotenv';

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { join } from 'node:path';

type Config = {
  env?: string;
  port?: number;
  version?: string;
  proxy: {
    base: string;
    auth?: {
      login: string;
      password: string;
    };
  };
  menu: { link: string; text: string }[];
};

const config = yaml.load(readFileSync(join(__dirname, '../config.yaml'), 'utf8')) as Config;

if (config.env) {
  process.env.NODE_ENV = config.env;
}

if (config.port) {
  process.env.PORT = config.port.toString();
}

if (config.version) {
  process.env.VERSION = config.version;
}

export default {
  url: new URL(config.proxy.base),
  auth: config.proxy.auth ? `${config.proxy.auth.login}:${config.proxy.auth.password}` : undefined,
};

export const { VERSION, PORT, npm_package_version: NPM_VERSION, NODE_ENV: ENV } = process.env;

export const { menu } = config;
