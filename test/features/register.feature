Feature: User Registration
  As a user I want to register on the website so that I can access the website's features

  Scenario: Successful Registration
    Given I have a valid email and password
    When I send a registration request
    Then I should receive a confirmation response

  Scenario: Registration with Existing Email
    Given I have an email that is already registered
    When I send a registration request
    Then I should receive an error indicating that the email is already in use