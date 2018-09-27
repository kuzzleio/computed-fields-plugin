Feature: Computed Fields Plugin: Computed fields management

  Scenario: Create a new computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection"
    Then the list contains computed field
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """

  Scenario: Delete a computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    And I delete the computed field with name "myComputedField" from index "cf-test-index" and collection "cf-test-collection"
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection"
    Then the list doesn't contain computed field named "myComputedField"

  Scenario: Replace a computed field 
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "value": "I'm ${age} years old"
      }
      """
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection"
    Then the list contains computed field
      """
      {
      "name": "myComputedField",
      "value": "I'm ${age} years old"
      }
      """
    And the list doesn't contain computed field
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """




