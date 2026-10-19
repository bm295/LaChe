import { Module } from '@nestjs/common';
import { RestaurantController } from '../adapters/http/restaurant.controller.ts';
import { InMemoryMenuRepository } from '../adapters/persistence/in-memory-menu.repository.ts';
import { RestaurantService } from '../application/restaurant.service.ts';

@Module({ controllers: [RestaurantController], providers: [RestaurantService, InMemoryMenuRepository] })
export class AppModule {}
