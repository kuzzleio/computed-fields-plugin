Feature: Core Plugin Boilerplate functional tests

  Scenario: Hook events
    Given a Kuzzle stack running
    When Kuzzle trigger an hooked event
    Then my hook function is called

#  Scenario: Pipe events
#    Given a Kuzzle stack running
#    When Kuzzle trigger a piped event
#    Then my pipe function is called

#  Scenario: Controller action
#    Given a Kuzzle stack running
#    Given an exposed route to a controller action
#    When I make a request to the route
#    Then my controller action is called

#  Scenario: Authentication strategy
#    Given a Kuzzle stack running
#    When I try to login with my new strategy
#    Then I can login with my new strategy
