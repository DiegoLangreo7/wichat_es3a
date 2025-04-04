Feature: Logging in with an user

Scenario: The user is registered in the site
    Given A registered user
    When I fill the data in the form and press submit
    Then The main page should be displayed

Scenario: The user is not registered in the site
    Given A not registered user
    When I fill the data in the form and press submit
    Then The error message should be displayed