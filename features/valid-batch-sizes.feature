Feature: Maximum recipe portions from ingredient packs
  To avoid accepting orders that exceed available ingredients
  As a kitchen manager
  I want to calculate how many complete portions a recipe can produce

  Scenario: Calculate portions from available stock packs
    Given each portion requires 2 units of ingredient A
    And each portion requires 3 units of ingredient B
    And ingredient A has 3 packs containing 24 units each
    And ingredient B has 2 packs containing 36 units each
    When I calculate the maximum producible portions
    Then the kitchen can prepare 24 complete portions
