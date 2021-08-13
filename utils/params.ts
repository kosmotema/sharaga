import { config } from 'dotenv';

config();

export default {
  protocol: process.env.PROXY_PROTOCOL,
  url: new URL(process.env.PROXY_BASE!),
  auth: `${process.env.PROXY_LOGIN}:${process.env.PROXY_PASSWORD}`,
};

export const {
  VERSION, PORT, npm_package_version: NPM_VERSION, NODE_ENV: ENV,
} = process.env;
