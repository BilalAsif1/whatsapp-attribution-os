// Native ESM loader - must NOT be compiled by SWC/TSC
// Uses real import() to load ESM-only better-auth package
module.exports = {
  async load() {
    const betterAuth = await import('better-auth');
    const plugins = await import('better-auth/plugins');
    const { Pool } = require('pg');
    return { betterAuth: betterAuth.betterAuth, Pool, ...plugins };
  }
};
