import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/infrastructure/app.module.ts';

describe('available table groups API', () => {
  let app: NestFastifyApplication;
  const tables = [
    { number: 1, area: 'Dining room', capacity: 2, status: 'available' },
    { number: 2, area: 'Dining room', capacity: 4, status: 'available' },
    { number: 3, area: 'Dining room', capacity: 2, status: 'occupied' },
    { number: 4, area: 'Dining room', capacity: 2, status: 'available' }
  ];

  beforeAll(async () => {
    app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });
  afterAll(async () => { await app?.close(); });

  it('returns candidate groups and capacities through the service', async () => {
    const response = await app.inject({ method: 'POST', url: '/tables/available-groups', payload: {
      tables, connections: [{ from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }]
    } });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ groups: [
      { tableNumbers: [1, 2], totalCapacity: 6 }, { tableNumbers: [4], totalCapacity: 2 }
    ] });
  });

  it('accepts an empty layout', async () => {
    const response = await app.inject({ method: 'POST', url: '/tables/available-groups', payload: { tables: [], connections: [] } });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ groups: [] });
  });

  it.each([
    {}, { tables }, { tables: null, connections: [] }, { tables: {}, connections: [] },
    { tables: [null], connections: [] }, { tables: [{}], connections: [] },
    { tables: [tables[0], tables[0]], connections: [] },
    { tables, connections: null }, { tables, connections: [null] },
    { tables, connections: [{ from: 1, to: 99 }] },
    { tables, connections: [{ from: '1', to: 2 }] },
    { tables: [{ ...tables[0], status: 'unknown' }], connections: [] }
  ])('returns 400 for invalid layout %j', async (payload) => {
    const response = await app.inject({ method: 'POST', url: '/tables/available-groups', payload });
    expect(response.statusCode).toBe(400);
    expect(response.json().message).toEqual(expect.any(String));
  });
});
