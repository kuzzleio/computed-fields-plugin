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

  Scenario Outline: List computed fields of a collection
    Given a running instance of Kuzzle
    And an index "cf-test-index-1"
    And a collection "cf-test-collection-1" in "cf-test-index-1"
    And a collection "cf-test-collection-2" in "cf-test-index-1"
    And an index "cf-test-index-2"
    And a collection "cf-test-collection-1" in "cf-test-index-2"
    And I create a new computed field in index "cf-test-index-1" and collection "cf-test-collection-1" as follow:
      """
      {
      "name": "myComputedField-1",
      "value": "Template 1: ${aField}"
      }
      """
    And I create a new computed field in index "cf-test-index-1" and collection "cf-test-collection-2" as follow:
      """
      {
      "name": "myComputedField-2",
      "value": "Template 2: ${anotherField}"
      }
      """
    And I create a new computed field in index "cf-test-index-2" and collection "cf-test-collection-1" as follow:
      """
      {
      "name": "myComputedField-3",
      "value": "Template 3: ${yetAnotherField}"
      }
      """
    And I reset the computed-fields plugin
    When I list the computed fields of index <index> and collection <collection>
    Then the list contains only 1 computed field named <name>
    Examples:
      | index             | collection             | name                |
      | "cf-test-index-1" | "cf-test-collection-1" | "myComputedField-1" |
      | "cf-test-index-1" | "cf-test-collection-2" | "myComputedField-2" |
      | "cf-test-index-2" | "cf-test-collection-1" | "myComputedField-3" |

  Scenario Outline: Reseting the computed field plugin shall remove all configured computed fields
    Given a running instance of Kuzzle
    And an index "cf-test-index-1"
    And a collection "cf-test-collection-1" in "cf-test-index-1"
    And a collection "cf-test-collection-2" in "cf-test-index-1"
    And an index "cf-test-index-2"
    And a collection "cf-test-collection-1" in "cf-test-index-2"
    And I create a new computed field in index "cf-test-index-1" and collection "cf-test-collection-1" as follow:
      """
      {
      "name": "myComputedField-1",
      "value": "Template 1: ${aField}"
      }
      """
    And I create a new computed field in index "cf-test-index-1" and collection "cf-test-collection-2" as follow:
      """
      {
      "name": "myComputedField-2",
      "value": "Template 1: ${aField}"
      }
      """
    And I create a new computed field in index "cf-test-index-2" and collection "cf-test-collection-1" as follow:
      """
      {
      "name": "myComputedField-3",
      "value": "Template 1: ${aField}"
      }
      """
    And I reset the computed-fields plugin
    When I list the computed fields of index <index> and collection <collection>
    Then the list is empty
    Examples:
      | index             | collection             |
      | "cf-test-index-1" | "cf-test-collection-1" |
      | "cf-test-index-1" | "cf-test-collection-2" |
      | "cf-test-index-2" | "cf-test-collection-1" |





