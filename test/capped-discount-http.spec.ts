import 'reflect-metadata';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/infrastructure/app.module.js';

describe('capped discount API', () => {
  let app: NestFastifyApplication;
  beforeAll(async () => {
    app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { logger: false });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });
  afterAll(async () => { await app?.close(); });

  it('returns the capped discount and final bill for the client', async () => {
    const response = await app.inject({ method: 'GET', url: '/bills/estimate?subtotal=1000000&discountRate=0.2&maximumDiscount=100000' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ subtotal: 1000000, discount: 100000, serviceCharge: 90000, vat: 79200, total: 1069200 });
  });
  it('preserves billing without a discount', async () => {
    const response = await app.inject({ method: 'GET', url: '/bills/estimate?subtotal=100' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ discount: 0, total: 118.8 });
  });
  it.each(['discountRate=1.1', 'discountRate=-0.1', 'discountRate=NaN', 'discountRate=2abc', 'discountRate=', 'maximumDiscount=-1', 'maximumDiscount=Infinity', 'maximumDiscount='])('rejects %s', async (query) => {
    const response = await app.inject({ method: 'GET', url: `/bills/estimate?subtotal=100&${query}` });
    expect(response.statusCode).toBe(400);
  });
});
