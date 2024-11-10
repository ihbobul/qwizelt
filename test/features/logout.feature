Feature: User Logout
  As a user I want to log out of the application so that I can securely end my session

  Scenario: User logs out successfully
    Given I have a valid refresh token
    When I send a logout request with the refresh token
    Then I should receive a success message indicating the logout was successful
    And the refresh token should be invalidated

  Scenario: User tries to log out with an invalid refresh token
    Given I have an invalid refresh token
    When I send a logout request with the invalid refresh token
    Then I should receive an error message indicating the refresh token is invalid
    And the response status should be 400
