Feature: Registering a new user

Scenario: The user is not registered in the site
    Given An unregistered user
    When I fill the data in the form and press submit
    Then The main page should be displayed

Scenario: The user is already registered in the site
    Given A registered user
    When I fill the data in the form and press submit
    Then An error message should be displayed

Scenario: The user is not registered in the site and the password is not valid bacause of the size
    Given An unregistered user
    When I fill the data in the form and press submit with an invalid password
    Then An error message should be displayed

Scenario: The user is not registered in the site and the password is not valid bacause of there aren`t letters
    Given An unregistered user
    When I fill the data in the form and press submit with an invalid password
    Then An error message should be displayed

Scenario: The user is not registered in the site and the password is not valid bacause of there aren`t numbers
    Given An unregistered user
    When I fill the data in the form and press submit with an invalid password
    Then An error message should be displayed

Scenario: The user is not registered in the site and the password is not valid bacause of there aren`t special characters
    Given An unregistered user
    When I fill the data in the form and press submit with an invalid password
    Then An error message should be displayed