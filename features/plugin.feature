Feature: Core Plugin Boilerplate functional tests

  Scenario: Hook events
    Given a running instance of Kuzzle on "localhost":"7512" with a client connected
    When I create the document "anti-citoyen-1"
    Then I should encounter the log "hook action create on document anti-citoyen-1"
    Then I disconnect Kuzzle client

  Scenario: Pipe events
    Given a running instance of Kuzzle on "localhost":"7512" with a client connected
    When I create the document "anti-citoyen-2"
    When I delete the document "anti-citoyen-2"
    Then I should encounter the log "pipe action delete on document anti-citoyen-2"
    Then I disconnect Kuzzle client

  Scenario: Controller action
    Given a running instance of Kuzzle on "localhost":"7512" with a client connected
    When I request the route "/say-something/loin_de_tissa"
    Then I should encounter the log "controller myNewController action myNewAction param loin_de_tissa"
    Then I disconnect Kuzzle client

  Scenario: Authentication strategy
    Given a running instance of Kuzzle on "localhost":"7512" with a client connected
    When I create an user using my new "dummy" strategy
    Then I can login my user using my new "dummy" strategy
    Then I disconnect Kuzzle client
