#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import http from 'http';
import https from 'https';

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || 'http://localhost:9090';

// Compatible with all Node.js versions — does not rely on global fetch.
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Invalid JSON: ${body.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

const server = new Server(
  { name: 'mcp-prometheus', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'query_prometheus',
      description: 'Run an instant PromQL query and return the current value(s)',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'PromQL expression, e.g. rate(http_requests_total[5m])' },
        },
        required: ['query'],
      },
    },
    {
      name: 'query_prometheus_range',
      description: 'Run a PromQL range query and return time-series data',
      inputSchema: {
        type: 'object',
        properties: {
          query:    { type: 'string', description: 'PromQL expression' },
          duration: { type: 'string', description: 'Look-back window: 5m, 15m, 1h, or 24h', default: '5m' },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_prometheus_metrics',
      description: 'List all metric names currently available in Prometheus',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'query_prometheus') {
      const url  = `${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(args.query)}`;
      const data = await httpGet(url);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }

    if (name === 'query_prometheus_range') {
      const end  = Math.floor(Date.now() / 1000);
      const durationSeconds = { '5m': 300, '15m': 900, '1h': 3600, '24h': 86400 };
      const secs = durationSeconds[args.duration] ?? 300;
      const step = secs >= 3600 ? 300 : 30;
      const url  = `${PROMETHEUS_URL}/api/v1/query_range?query=${encodeURIComponent(args.query)}&start=${end - secs}&end=${end}&step=${step}`;
      const data = await httpGet(url);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }

    if (name === 'list_prometheus_metrics') {
      const data = await httpGet(`${PROMETHEUS_URL}/api/v1/label/__name__/values`);
      return { content: [{ type: 'text', text: JSON.stringify(data.data, null, 2) }] };
    }

    return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error calling Prometheus: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
