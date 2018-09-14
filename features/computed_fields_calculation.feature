Feature: Computed Fields Plugin: Calculate computed fields in documents

  Scenario: Calculate computed field when creating a document
  
  Scenario: Calculate computed field when replaceing a document
  
  Scenario: Calculate computed field when updating a document with missing source field
  
  Scenario: Calculate computed field when updating a document without missing source field
  
  Scenario: Recalculate computed field after the computed field template has been changed

  Scenario Outline: Deleted compute field should no more add computed field in document
    Examples:
      | action  | Header 2 | Header 3 |
      | create  | Value 2  | Value 3  |
      | update  | Value 2  | Value 3  |
      | replace | Value 2  | Value 3  |
  



