import { config } from 'dotenv';

config();

function throwIfUndefined<T>(value?: T, help?: string): T {
  if (typeof value === 'undefined') {
    throw new TypeError(`undefined not acceptable ${help ? `as ${help}` : 'here'}`);
  }
  return value;
}

export default {
  protocol: process.env.PROXY_PROTOCOL,
  url: new URL(throwIfUndefined(process.env.PROXY_BASE, 'PROXY_BASE')),
  auth: `${process.env.PROXY_LOGIN}:${process.env.PROXY_PASSWORD}`,
};

export const { VERSION, PORT, npm_package_version: NPM_VERSION, NODE_ENV: ENV } = process.env;
