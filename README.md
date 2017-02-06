# kuzzle-core-plugin-boilerplate

Here, you'll find the boilerplate to start coding a new [Kuzzle Core Plugin](http://docs.kuzzle.io/guide/#plugin-types). A Core Plugin allows you to

* listen asynchronously, and perform operations that depend on data-related events;
* listen synchronously, and approve, modify and/or reject data-related queries;
* add a controller route to expose new actions to the API;
* add an authentication strategy to Kuzzle.

The boilerplate demonstrates each feature of a Core Plugin.

**Note.** The boilerplate code of authentication strategy is deactivated as it would override the current `local` strategy activated by default on Kuzzle. The code is present but commented in the `init` function. Use this code carefully to avoid breaking the `local` authentication strategy.

## Plugin development

This plugin is useful only if you use it as the starting point of your work. It's a boilerplate.

### On an existing Kuzzle

Clone this repository locally and make it accessible from the `plugins/enabled` directory relative to the Kuzzle installation directory. A common practice is to put the code of the plugin in `plugins/available` and create a symbolic link to it in `plugins/enabled`.

**Note.** If you are running Kuzzle within a Docker container, you'll need to mount the local plugin installation directory as a volume in the container.

Please refer to the Guide for further instructions on [how to install Kuzzle plugins](http://docs.kuzzle.io/guide/#managing-plugins).

### On a pristine Kuzzle stack

You can use the `docker-compose.yml` file included in this repository to start a development-oriented stack to help you creating your custom Kuzzle Core plugin.

Clone this repository locally and type:

```bash
$ docker-compose -f docker/docker-compose.yml up
```

This will launch a Kuzzle stack mounting this plugin boilerplate in the Kuzzle Core watching the content of the plugin and restarting the Kuzzle Core each time a file is modified (which will make your changes instantly effective).

#### Working on a different Kuzzle tag

You can choose to work on the Kuzzle development branch by defining the following environment variables before launching `docker-compose`:

```bash
$ export KUZZLE_DOCKER_TAG=:develop
$ export PROXY_DOCKER_TAG=:develop
$ docker-compose -f docker/docker-compose.yml up
```

These environment variables enable you to specify any existing build tag available on [Docker Hub](https://hub.docker.com/r/kuzzleio/kuzzle/tags/).

**Note** do not forget the `:` before the tag.

#### Customizing the plugin name

You may like to name your plugin differently than the name of this repo. To do so, rename the local directory of the repo and define the following environment variable before launching the development stack:

```bash
$ export PLUGIN_NAME=my-awesome-plugin
$ docker-compose -f docker/docker-compose.yml up
```
