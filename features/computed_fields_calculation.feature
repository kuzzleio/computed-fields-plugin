Feature: Computed Fields Plugin: Calculate computed fields in documents

  Scenario: Calculate computed field when creating a document
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "my name is ${forename} and I'm ${age} years old"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50
      }
      """
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "my name is Michael and I'm 50 years old"
      }
      """


  Scenario Outline: Computed fields can have the same name for different index/collection
    Given a running instance of Kuzzle
    And an index "cf-test-index-1"
    And an index "cf-test-index-2"
    And an index "cf-test-index-3"
    And a collection "cf-test-collection" in "cf-test-index-1"
    And a collection "cf-test-collection" in "cf-test-index-2"
    And a collection "cf-test-collection" in "cf-test-index-3"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index-1",
      "collection": "cf-test-collection",
      "value": "${forename} plays the ${instrument}"
      }
      """
    And I create a new computed field "B" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index-2",
      "collection": "cf-test-collection",
      "value": "${forename} ${surname}"
      }
      """
    And I create the following new document with id 'a-doc-id' in index <index> and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50,
      "instrument": "guitar"
      }
      """
    When I get the document with id 'a-doc-id' from index <index> and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' <verb>:
      """
      {
      "myComputedField": <computed_value>
      }
      """
    Examples:
      | index             | verb            | computed_value             |
      | "cf-test-index-1" | contains        | "Michael plays the guitar" |
      | "cf-test-index-2" | contains        | "Michael Romeo"            |
      | "cf-test-index-3" | doesn't contain | ""                         |

  Scenario: Source field shall support nested values
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "${id.forename} ${id.surname} plays the ${instrument} in ${band}"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "id": {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50
      },
      "instrument": "guitar",
      "band": "Symphony X"
      }
      """
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "Michael Romeo plays the guitar in Symphony X"
      }
      """


  Scenario: Calculate computed field when replacing a document
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "My name is ${forename} ${surname} and I'm ${age} years old"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50
      }
      """
    And I replace the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection" with:
      """
      {
      "surname": "Pinnella",
      "forename": "Michael",
      "age": 49
      }
      """
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "My name is Michael Pinnella and I'm 49 years old"
      }
      """

  Scenario Outline: Calculate computed field when updating a document with missing source field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "My name is ${forename} ${surname} and I'm ${age} years old"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50
      }
      """
    And I update the document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection" <field> with <field_value>
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": <computed_field_value>
      }
      """
    Examples:
      | field     | field_value | computed_field_value                               |
      | "surname" | "Pinnella"  | "My name is Michael Pinnella and I'm 50 years old" |
      | "age"     | "18"        | "My name is Michael Romeo and I'm 18 years old"    |


  Scenario: Calculate computed field when updating a document without missing source field
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "My name is ${forename} ${surname} and I'm ${age} years old"
      }
      """
    And I create the following new document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Romeo",
      "forename": "Michael",
      "age": 50
      }
      """
    And I update the document with id 'a-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Rullo",
      "forename": "Jason",
      "age": 46
      }
      """
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "My name is Jason Rullo and I'm 46 years old"
      }
      """

  Scenario: Recalculate computed field after the computed field template has been changed
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
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
    And I update the computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
      "value": "My name is ${forename} ${surname} and I play the ${instrument}"
      }
      """
    And I recompute computed fields for index "cf-test-index" and collection "cf-test-collection"
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' contains:
      """
      {
      "myComputedField": "My name is Michael Romeo and I play the guitar"
      }
      """

  Scenario: Deleted compute field should no more be inserted in newly created document
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
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
    And I delete the computed field with id "cf-test-index-cf-test-collection-myComputedField"
    And I create the following new document with id 'another-doc-id' in index "cf-test-index" and collection "cf-test-collection":
      """
      {
      "surname": "Pinella",
      "forename": "Michael",
      "instrument": "keayboard",
      "age": 49
      }
      """
    When I get the document with id 'another-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'another-doc-id' doesn't contain:
      """
      {
      "myComputedField": ""
      }
      """

  Scenario: Recomputing computed field for a collection shall remove deleted computed fields value from documents
    Given a running instance of Kuzzle
    And an index "cf-test-index"
    And a collection "cf-test-collection" in "cf-test-index"
    And I create a new computed field "A" as follow:
      """
      {
      "name": "myComputedField",
      "index": "cf-test-index",
      "collection": "cf-test-collection",
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
    And I delete the computed field with id "cf-test-index-cf-test-collection-myComputedField"
    And I recompute computed fields for index "cf-test-index" and collection "cf-test-collection"
    When I get the document with id 'a-doc-id' from index "cf-test-index" and collection "cf-test-collection"
    Then the computed fields for document 'a-doc-id' doesn't contain:
      """
      {
      "myComputedField": ""
      }
      """

