import { BadRequestException, Body, Controller, Get, Inject, Param, ParseFloatPipe, Post, Query } from '@nestjs/common';
import { RestaurantService } from '../../application/restaurant.service.js';
import { IngredientAvailability } from '../../domain/batch-size-calculator.js';
import { BillSummary } from '../../domain/billing-calculator.js';
import { MenuItemOrder, MostOrderedMenuItem, ReportingPeriod } from '../../domain/most-ordered-menu-item.js';

@Controller()
export class RestaurantController {
  public constructor(@Inject(RestaurantService) private readonly restaurantService: RestaurantService) {}
  @Get('health') public health(): { status: string } { return { status: 'ok' }; }
  @Get('menu/:id') public getMenuItem(@Param('id') id: string) { return this.restaurantService.getMenuItem(id); }
  @Get('bills/estimate')
  public estimateBill(
    @Query('subtotal', ParseFloatPipe) subtotal: number,
    @Query('discountRate') discountRate?: string,
    @Query('maximumDiscount') maximumDiscount?: string
  ): BillSummary {
    const parseOptionalNumber = (value: string | undefined): number =>
      value === undefined ? 0 : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    try {
      return this.restaurantService.calculateBill(subtotal, parseOptionalNumber(discountRate), parseOptionalNumber(maximumDiscount));
    } catch (error) {
      if (error instanceof Error) throw new BadRequestException(error.message);
      throw error;
    }
  }
  @Post('recipes/maximum-portions')
  public calculateMaximumPortions(@Body('ingredients') ingredients: IngredientAvailability[]): { maximumPortions: number } {
    return { maximumPortions: this.restaurantService.calculateMaximumPortions(ingredients) };
  }
  @Post('reports/most-ordered-menu-item')
  public findMostOrderedMenuItem(
    @Body('orders') orders: MenuItemOrder[],
    @Body('reportingPeriod') reportingPeriod: ReportingPeriod
  ): MostOrderedMenuItem {
    return this.restaurantService.findMostOrderedMenuItem(orders, reportingPeriod);
  }
}
