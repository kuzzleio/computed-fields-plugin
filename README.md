# kuzzle-core-plugin-boilerplate

Here, you'll find the boilerplate to start coding a new [Kuzzle Core Plugin](http://docs.kuzzle.io/guide/#plugin-types). A Core Plugin allows you to

* listen asynchronously, and perform operations that depend on data-related events;
* listen synchronously, and approve, modify and/or reject data-related queries;
* add a controller route to expose new actions to the API;
* add an authentication strategy to Kuzzle.

The boilerplate demonstrates each feature of a Core Plugin.

**Note.** The boilerplate code of authentication strategy is deactivated as it would override the current `local` strategy activated by default on Kuzzle. The code is present but commented in the `init` function. Use this code carefully to avoid breaking the `local` authentication strategy.

## Installation

This plugin is useful only if you use it as the starting point of your work. It's a boilerplate.

Clone the repository of this plugin locally and make it accessible from the `plugins/enabled` directory relative to the Kuzzle installation directory. A common practice is to put the code of the plugin in `plugins/available` and create a symbolic link to it in `plugins/enabled`.

**Note.** If you are running Kuzzle within a Docker container, you'll need to mount the local plugin installation directory as a volume in the container.

Please refer to the Guide for further instructions on [how to install Kuzzle plugins](http://docs.kuzzle.io/guide/#managing-plugins).
