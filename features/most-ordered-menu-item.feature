Feature: Most ordered menu item in a shift
  To prepare popular drinks before a busy period
  As a shift manager
  I want to know which menu item was ordered most often during my shift

  Scenario: Iced Latte is the best seller in the evening shift
    Given the evening shift runs from 18:00 to 22:00
    And Iced Latte has 5 portions ordered during the shift
    And House Coffee has 2 portions ordered during the shift
    And Matcha Latte has 4 portions ordered during the shift
    And 10 Iced Lattes are ordered at 22:00, after the shift ends
    When I calculate the most ordered menu item
    Then Iced Latte is the most ordered item with 5 portions

  Scenario: Equal quantities prefer a deterministic menu item ID
    Given Americano and Zest Tea each have 2 portions ordered during the day
    When I calculate the most ordered menu item
    Then Americano is the most ordered item
