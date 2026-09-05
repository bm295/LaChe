import { Controller, Get, Param, ParseFloatPipe, Query } from '@nestjs/common';
import { RestaurantService } from '../../application/restaurant.service.js';
import { BillSummary } from '../../domain/billing-calculator.js';

@Controller()
export class RestaurantController {
  public constructor(private readonly restaurantService: RestaurantService) {}
  @Get('health') public health(): { status: string } { return { status: 'ok' }; }
  @Get('menu/:id') public getMenuItem(@Param('id') id: string) { return this.restaurantService.getMenuItem(id); }
  @Get('bills/estimate') public estimateBill(@Query('subtotal', ParseFloatPipe) subtotal: number): BillSummary { return this.restaurantService.calculateBill(subtotal); }
}
