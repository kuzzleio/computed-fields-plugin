Feature: Computed Fields Plugin: Computed fields management

  Scenario: Create a new computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "`my name is ${forename} and I'm ${age} years old`"
      }
      """
    When I list the computed fields
    Then the list contains computed field "A"
    And computed field "A" has the following id: "cf-test-index-cf-test-collection-myComputedField"

  Scenario: Delete a computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "`my name is ${forename} and I'm ${age} years old`"
      }
      """
    And I delete the computed field with id: "cf-test-index-cf-test-collection-myComputedField"
    When I list the computed fields
    And the list doesn't contain computed field "A"

  # Scenario: List computed field
  #   Given a running instance of Kuzzle
  #   And an index "cf-test-index"
  #   And a collection "cf-test-collection" in "cf-test-index"
  #   And I create a new computed field as follow:
  #     """"
  #     {
  #       "name": "myComputedField",
  #       "index": "cf-test-index",
  #       "collection": "cf-test-collection",
  #       "value": "`my name is ${forename} and I'm ${age} years old`"
  #     }
  #     """
  #   And I delete the computed field with id: "cf-test-index-cf-test-collection-myComputedField"
  #   When I list the computed fields
  #   Then the computed field is no more in the list

  Scenario: A computed field name is unique in an index/collection
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """"
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "`my name is ${forename} and I'm ${age} years old`"
      }
      """
    And I create a new computed field "B" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "`I'm ${age} years old`"
      }
      """
    When I list the computed fields
    Then the list contains computed field "B"
    And the list doesn't contain computed field "A"

  Scenario Outline: A computed field shall be uniquelly identified by the tuple (index, collection, name)
    Given a running instance of Kuzzle
    When I create a computed field 'myCF' with name = "<name>", index = "<index>" and collection = "<collection>"
    Then the computed field 'myCF' has the following id: "<index>-<collection>-<name>"
    Examples:
      | index      | collection          | name                   |
      | my-index-1 | my-first-collection | a-computed-field       |
      | my-index-1 | my-secon-collection | a-computed-field       |
      | my-index-2 | my-first-collection | a-computed-field       |
      | my-index-1 | my-first-collection | another-computed-field |





