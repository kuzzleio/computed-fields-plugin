# kuzzle-core-plugin-boilerplate

Here, you'll find the boilerplate to start coding a new [Kuzzle Core Plugin](http://docs.kuzzle.io/guide/#plugin-types). A Core Plugin allows you to

* listen asynchronously, and perform operations that depend on data-related events;
* listen synchronously, and perform operations that depend on data-related events;
* add a controller route to expose new actions to the API;
* add an authentication strategy the User authentication system.

The boilerplate demonstrate each feature of a Core Plugin.

**Note.** The boilerplate code of authentication strategy is not activate as it would override the current `local` strategy activated by default on Kuzzle. The code is present but commented in the `init` function. Use this code carefully to avoid breaking the `local` authentication strategy.

## Installation

This plugin is useful only if you use it as the starting point of your work. You are likely to want the code on your local machine, then install it on Kuzzle.

Fork the repository and name it as you like, then clone it locally (from now on we'll assume it's located in `/local/path/to/plugin`).

From the Kuzzle Core installation directory, type the following command:

```bash
$ bin/kuzzle plugins --install --url --path /local/path/to/plugin
```

**Note.** If you are running Kuzzle within a Docker container, you'll need to mount the local plugin installation directory as a volume in the container. Also, to install the plugin, you'll need to access the command line in the container via `docker exec`.

Please refer to the Guide for further instructions on [how to install Kuzzle plugins](http://docs.kuzzle.io/guide/#managing-plugins-using-the-cli).
