# kuzzle computed-fields plugin

<!-- TOC -->

- [kuzzle computed-fields plugin](#kuzzle-computed-fields-plugin)
  - [Purpose](#purpose)
  - [Usage](#usage)
  - [Installing the plugin](#installing-the-plugin)
  - [Computed fields management](#computed-fields-management)
    - [Create a computed field](#create-a-computed-field)
    - [List computed fields](#list-computed-fields)
    - [Delete a computed field](#delete-a-computed-field)

<!-- /TOC -->

## Purpose

The purpose of this plugin is to allow one to create fields that are computed from other fields of a document. e.g. considering the following document:

```json
{
  "name": "Michael",
  "surname": "Romeo"
}
```

you could have a computed field `fullname` defined as `"${name} ${surname}"` and whose value would be `"Michael Romeo"` for previous exemple.

The computed fileds are ensted in a `_computedFields` object to avoid collision with document fields, so the final document will be:

```json
{
  "name": "Michael",
  "surname": "Romeo",
  "_computedFields": {
    "fullname": "Michael Romeo"
  }
}
```

A computed field is applied to documents in a given `collection` and is defined as follow:

```json
{
  "name": "myComputedField",
  "index": "myIndex",
  "collection": "myCollection",
  "value": "Here is my computed field using ${my_document_field} and ${a.nested.field}"
}
```

## Usage

| Field | Description |
| -- | -- |
| `name` | This is the name by which it will be represented in the documents.|
| `index` | The `index` containing the document we want to apply the computed field to |
| `collection` | The `collection` containing the document we want to apply the computed field to |
| `value` | The computed field's `value` is a template string where you can insert document's field values using the `${fieldname}` syntax. Note that you are note limited to field at the root of the document, you can access insert nested property field using the classic `.` syntax: `${my.nested.field}` | 

**Note:** To avoid any collision with documents fields, all computed fields are nested in `_computedFields` object.

## Installing the plugin

Clone this repository locally and make it accessible from the `plugins/enabled` directory relative to the Kuzzle installation directory. A common practice is to put the code of the plugin in `plugins/available` and create a symbolic link to it in `plugins/enabled`.

**Note:** If you are running Kuzzle within a Docker container, you will need to mount the local plugin installation directory as a volume in the container.

Please refer to the Guide for further instructions on [how to install Kuzzle plugins](http://docs.kuzzle.io/guide/essentials/plugins/#managing-plugins).

## Computed fields management

Once installed, the plugin exposes a new controller: `computedFields` c

The controller has de following actions:

| Action      | Description                                                     |
| ----------- | --------------------------------------------------------------- |
| `create`    | Adds or update a computed field to an `index/collection`        |
| `delete`    | Remove a computed field                                         |
| `list`      | List computed fields                                            |
| `recompute` | Recompute all the computed fields of a given `index/collection` |

### Create a computed field

**http**

You can create or update a computed field using a http `POST` on the route: `http+https://kuzzlehost:kuzzleport/computed-fields/`

For exemple:

```sh
$ curl  localhost:7512/_plugin/computed-fields/ -H "Content-Type: application/json"
-d '{
  "name": "myComputedField",
  "index": "myIndex",
  "collection": "myCollection",
  "value": "Here is my computed field using ${my_document_field} and ${a.nested.field}"
}'
```

Response:

```json
{
  "requestId": "f0cef431-a642-41ba-98b5-c2f407f10bd1",
  "status": 200,
  "error": null,
  "controller": "computed-fields/field",
  "action": "create",
  "collection": null,
  "index": null,
  "volatile": null,
  "result": {
    "_index": "%plugin:computed-fields",
    "_type": "computedFields",
    "_id": "myIndex-myCollection-myComputedField",
    "_version": 1,
    "result": "created",
    "_shards": {
      "total": 2,
      "successful": 1,
      "failed": 0
    },
    "created": true,
    "_source": {
      "name": "myComputedField",
      "index": "myIndex",
      "collection": "myCollection",
      "value": "Here is my computed field using ${my_document_field} and ${a.nested.field}"
    }
  }
}
```

**Using Kuzzle JS SDK**

Using the Kuzzle JS SDK, you can call controller actions using the `query`API:

```javascript
  kuzzle.query(
    {
      controller: 'computed-fields/computedFields',
      action: 'create',
      body: {
      name: "myComputedField",
      index: "myIndex",
      collection: "myCollection",
      value: "Here is my computed field using ${my_document_field} and ${a.nested.field}"
    }
  )
```

### List computed fields

The `list` action will return a array of computed fields.

```json
[
  { "name": "aname", "value": "a template" ... },
  { "name": "anotherone", "value": "another template" ... }
]
```

**http**

Do a `GET` on route `http+https://kuzzlehost:kuzzleport/computed-fields/` to get computed field list

```sh
$ curl  localhost:7512/_plugin/computed-fields/
```

Response:

```json
{
  "requestId": "43af0e90-7e4b-40d7-bae2-665a999e3152",
  "status": 200,
  "error": null,
  "controller": "computed-fields/computedFields",
  "action": "list",
  "collection": null,
  "index": null,
  "volatile": null,
  "result": [
    {
      "name": "another-computed-field",
      "index": "my-index-1",
      "collection": "my-first-collection",
      "value": "A fake template",
      "_id": "my-index-1-my-first-collection-another-computed-field"
    }
  ]
}
```

**Using Kuzzle JS SDK**

Using the Kuzzle JS SDK, you can call controller actions using the `query`API:

```javascript
kuzzle
  .query({
    controller: "computed-fields/computedFields",
    action: "list"
  })
  .then(r => console.log(r.result));
```

Outputs:

```sh
[
  {
    "name": "another-computed-field",
    "index": "my-index-1",
    "collection": "my-first-collection",
    "value": "A fake template",
    "_id": "my-index-1-my-first-collection-another-computed-field"
  }
]
```

### Delete a computed field

The `delete` action allow one to remove a computed field.

**http**

Do a `POST` on route `http+https://kuzzlehost:kuzzleport/:_id/_delete'` to delete computed field with `_id`

```sh
$ curl -X POST  localhost:7512/_plugin/computed-fields/my-index-1-my-first-collection-another-computed-field/_delete
```

Response:

```json
{
  "requestId": "ab711c47-62f4-4bd0-b127-3e8012ca1135",
  "status": 200,
  "error": null,
  "controller": "computed-fields/computedFields",
  "action": "delete",
  "collection": null,
  "index": null,
  "volatile": null
}
```

**Using Kuzzle JS SDK**

Using the Kuzzle JS SDK, you can call controller actions using the `query`API:

```javascript
kuzzle
  .query({
    controller: "computed-fields/computedFields",
    action: "delete",
    _id: "my-index-1-my-first-collection-another-computed-field"
  })
```