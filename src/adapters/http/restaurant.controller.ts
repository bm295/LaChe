import { Body, Controller, Get, Inject, Param, ParseFloatPipe, Post, Query } from '@nestjs/common';
import { RestaurantService } from '../../application/restaurant.service.js';
import { IngredientAvailability } from '../../domain/batch-size-calculator.js';
import { BillSummary } from '../../domain/billing-calculator.js';

@Controller()
export class RestaurantController {
  public constructor(@Inject(RestaurantService) private readonly restaurantService: RestaurantService) {}
  @Get('health') public health(): { status: string } { return { status: 'ok' }; }
  @Get('menu/:id') public getMenuItem(@Param('id') id: string) { return this.restaurantService.getMenuItem(id); }
  @Get('bills/estimate') public estimateBill(@Query('subtotal', ParseFloatPipe) subtotal: number): BillSummary { return this.restaurantService.calculateBill(subtotal); }
  @Post('recipes/maximum-portions')
  public calculateMaximumPortions(@Body('ingredients') ingredients: IngredientAvailability[]): { maximumPortions: number } {
    return { maximumPortions: this.restaurantService.calculateMaximumPortions(ingredients) };
  }
}
