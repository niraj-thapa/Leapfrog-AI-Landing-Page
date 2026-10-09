import type { NextConfig } from 'next';
import createWithVercelToolbar from '@vercel/toolbar/plugins/next';

/* The Vercel Toolbar (comments and feedback from the team on the deployed page, Oct 9). */
const withVercelToolbar = createWithVercelToolbar();

const nextConfig: NextConfig = {};

export default withVercelToolbar(nextConfig);
