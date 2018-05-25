Feature: Core Plugin Boilerplate functional tests

  Scenario: Hook events
    When I create the document "anti-citoyen-1"
    Then my hook function is called with action "create" on document "anti-citoyen-1"

  Scenario: Pipe events
    When I create the document "anti-citoyen-2"
    When I delete the document "anti-citoyen-2"
    Then my pipe function is called with action "delete" on document "anti-citoyen-2"

  Scenario: Controller action
    When I request the route "/say-something/loin_de_tissa"
    Then the action "myNewAction" of the controller "myNewController" with param "loin_de_tissa" is called

  Scenario: Authentication strategy
    When I create an user using my new "dummy" strategy
    Then I can login my user using my new "dummy" strategy

  Scenario: Disconnect
    Then I disconnect Kuzzle client
