export default {
  protocol: process.env.PROXY_PROTOCOL,
  url: new URL(process.env.PROXY_BASE!),
  auth: `${process.env.PROXY_LOGIN}:${process.env.PROXY_PASSWORD}`,
};
