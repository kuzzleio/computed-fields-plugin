Feature: Computed Fields Plugin: Http API

  Scenario: Create a new computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" using HTTP API as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection" using HTTP API
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
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" using HTTP API as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    And I delete the computed field with name "myComputedField" from index "cf-test-index" and collection "cf-test-collection" using HTTP API
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection" using HTTP API
    Then the list doesn't contain computed field named "myComputedField"

  Scenario: Replace a computed field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" using HTTP API as follow:
      """
      {
      "name": "myComputedField",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" using HTTP API as follow:
      """
      {
      "name": "myComputedField",
      "value": "I'm ${age} years old"
      }
      """
    When I list the computed fields of index "cf-test-index" and collection "cf-test-collection" using HTTP API
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

  Scenario: Recalculate computed field after the computed field template has been changed
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "value": "My name is ${forename} ${surname} and I'm ${age} years old"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "instrument": "guitar",
      "age": 50
      }
      """
    And I create a new computed field in index "cf-test-index" and collection "cf-test-collection" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "My name is ${forename} ${surname} and I play the ${instrument}"
      }
      """
    And I recompute computed fields for index "cf-test-index" and collection "cf-test-collection" using HTTP API
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "My name is Michael Romeo and I play the guitar"
      }
      """


