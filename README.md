# @coconut-xr/natuerlich

[![Version](https://img.shields.io/npm/v/@coconut-xr/natuerlich?style=flat-square)](https://npmjs.com/package/@coconut-xr/natuerlich)
[![License](https://img.shields.io/github/license/coconut-xr/natuerlich.svg?style=flat-square)](https://github.com/coconut-xr/natuerlich/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/coconut_xr?style=flat-square)](https://twitter.com/coconut_xr)
[![Discord](https://img.shields.io/discord/1087727032240185424?style=flat-square&label=discord)](https://discord.gg/RbyaXJJaJM)

![header image](./images/header.jpg)

_WebXR Interaction for Three.js_

This library builds on [Three.js](https://github.com/mrdoob/three.js) (open-source WebGL library) and [WebXR](https://immersiveweb.dev/) (Web Standard for Augmented and Virtual Reality) to deliver **composable and extensible interactions for immersive experiences** .

We provide bindings to [react-three/fiber](https://github.com/pmndrs/react-three-fiber), enabling a **familiar Developer Experience** for react developers.

`npm install @coconut-xr/natuerlich`

<span style="font-size: 2rem">⤷[ Getting Started](https://coconut-xr.github.io/natuerlich/#/getting-started)</span>

## Examples

- [Spatial UI with Koestlich](https://codesandbox.io/s/natuerlich-spatual-ui-example-xmdpvq?file=/src/app.tsx)

    <img src="./images/spatial-ui-example.gif"  width="300">

- [Placing Objects](https://codesandbox.io/s/natuerlich-placing-objects-3q74pk?file=/src/app.tsx) - 3D Models from [Quaternius](https://quaternius.com/)

    <img src="./images/placing-objects.gif"  width="200">

- [Rag Doll Physics](https://codesandbox.io/s/natuerlich-ragdoll-physics-j2q7mc?file=/src/App.js) - based on [R3F Example](https://codesandbox.io/s/wdzv4)

    <img src="./images/rag-doll.gif"  width="200">

## [Documentation](https://coconut-xr.github.io/natuerlich)

- [Getting Started](https://coconut-xr.github.io/natuerlich/#/getting-started) - barebones WebXR, Hands, and Controllers

    <img src="./barebones.gif"  width="150">

- [Interaction with Objects](https://coconut-xr.github.io/natuerlich/#/object-interaction) - build interactions with objects

    <img src="./object-draggable.gif"  width="150">

- [Interaction with Koestlich](https://coconut-xr.github.io/natuerlich/#/koestlich-interaction) - build interactive 3D UIs

    <img src="./koestlich-interactable.gif" width="150">

- [Teleport](https://coconut-xr.github.io/natuerlich/#/teleport) - building a teleport interaction

    <img src="./teleport.gif"  width="150">

- [Poses](https://coconut-xr.github.io/natuerlich/#/poses) - detecting and generating hand poses

    <img src="./poses.gif"  width="150">


- [Layers](https://coconut-xr.github.io/natuerlich/#/layers) - high quality content using WebXR layers

    <img src="./layer.gif"  width="150">

- [Anchors](https://coconut-xr.github.io/natuerlich/#/anchors) - spatial anchors using WebXR anchors

    <img src="./anchor.gif"  width="150">

- [Tracked Planes](https://coconut-xr.github.io/natuerlich/#/planes) - tracked room planes using WebXR planes

    <img src="./tracked-planes.gif"  width="150">

- [Head Up Display](https://coconut-xr.github.io/natuerlich/#/head-up-display) - placing content in front of the user's camera

    <img src="./head-up-display.gif"  width="150">

- [Custom Input Sources](https://coconut-xr.github.io/natuerlich/#/custom-input-sources) - building custom interactive hands and controllers

    <img src="./fist-grab-hand.gif"  width="150">

- [Tracked Images](https://coconut-xr.github.io/natuerlich/#/images) - image marker tracking using WebXR Image Tracking
- [Guards](https://coconut-xr.github.io/natuerlich/#/guards) - conditional rendering using guards
- [Use XR](https://coconut-xr.github.io/natuerlich/#/use-xr) - accessing the raw XR state
- [Configuration](https://coconut-xr.github.io/natuerlich/#/configuration) - configurating foveation, frameRate, referenceSpace, and frameBufferScaling
---

- [All Components](https://coconut-xr.github.io/natuerlich/#/all-components) - API Documentation for all available components
- [All Hooks](https://coconut-xr.github.io/natuerlich/#/all-hooks) - API Documentation for all available hooks

## Ecosystem

- User Interfaces - [@coconut-xr/koestlich](https://github.com/coconut-xr/koestlich)
- Pre-designed UI Components - [@coconut-xr/apfel-kruemel](https://github.com/coconut-xr/apfel-kruemel)

## Acknowledgements

This library is only possible because of the great efforts from the [Immersive Web Community Group and Immersive Web Working Group at the W3C](https://github.com/immersive-web), the [Three.js](https://github.com/mrdoob/three.js) team, and the [react-three-fiber](https://github.com/pmndrs/react-three-fiber) team. This work is inspired by existing libraries, such as [react-xr](https://github.com/pmndrs/react-xr) and [handy-work](https://github.com/AdaRoseCannon/handy-work).

**natuerlich** is funded by [Coconut Captial](https://coconut.capital/)
