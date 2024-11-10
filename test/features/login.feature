Feature: User Login
  As a user I want to login to the application so that I can access the application

  Scenario: User login with valid credentials
    Given I have valid credentials
    When I send a login request with those credentials
    Then I should receive a JWT token
    And I should be able to access protected resources

  Scenario: User login with invalid credentials
    Given I have invalid credentials
    When I send a login request with those credentials
    Then I should receive an error message indicating invalid credentials