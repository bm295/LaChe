import { Module } from '@nestjs/common';
import { RestaurantController } from '../adapters/http/restaurant.controller.js';
import { InMemoryMenuRepository } from '../adapters/persistence/in-memory-menu.repository.js';
import { RestaurantService } from '../application/restaurant.service.js';

@Module({ controllers: [RestaurantController], providers: [RestaurantService, InMemoryMenuRepository] })
export class AppModule {}
