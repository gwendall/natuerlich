---
id: main-doc
slug: /
---

import Image from '@theme/IdealImage';

# @coconut-xr/natuerlich

[![Version](https://img.shields.io/npm/v/@coconut-xr/natuerlich?style=flat-square)](https://npmjs.com/package/@coconut-xr/natuerlich)
[![License](https://img.shields.io/github/license/coconut-xr/natuerlich.svg?style=flat-square)](https://github.com/coconut-xr/natuerlich/blob/master/LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/coconut_xr?style=flat-square)](https://twitter.com/coconut_xr)
[![Discord](https://img.shields.io/discord/1087727032240185424?style=flat-square&label=discord)](https://discord.gg/RbyaXJJaJM)

<Image img={require(`@site/static/images/header.jpg`)} style={{width: "100%"}}/>


_WebXR Interaction for Three.js_

This library builds on [Three.js](https://github.com/mrdoob/three.js) (open-source WebGL library) and [WebXR](https://immersiveweb.dev/) (Web Standard for Augmented and Virtual Reality) to deliver **composable and extensible interactions for immersive experiences** .

We provide bindings to [react-three/fiber](https://github.com/pmndrs/react-three-fiber), enabling a **familiar Developer Experience** for react developers.

`npm install @coconut-xr/natuerlich`

## Check out the [Getting Started](/getting-started)

## Examples

| | |
| --- | --- | 
| <a href="https://codesandbox.io/s/natuerlich-spatual-ui-example-xmdpvq?file=/src/app.tsx">Spatial UI with Koestlich</a> | <a href="https://codesandbox.io/s/natuerlich-placing-objects-3q74pk?file=/src/app.tsx">Placing Objects </a> - 3D Models from [Quaternius](https://quaternius.com/) |
| <a href="https://codesandbox.io/s/natuerlich-spatual-ui-example-xmdpvq?file=/src/app.tsx"><Image img={require(`@site/static/images/spatial-ui-example.gif`)} style={{width: "100%"}}/></a>| <a href="https://codesandbox.io/s/natuerlich-placing-objects-3q74pk?file=/src/app.tsx"><Image img={require(`@site/static/images/placing-objects.gif`)} style={{width: "100%"}}/></a>  |
| <a href="https://codesandbox.io/s/natuerlich-ragdoll-physics-j2q7mc?file=/src/App.js">Rag Doll Physics </a> - based on [R3F Example](https://codesandbox.io/s/wdzv4) |<a href="https://coconut-xr.github.io/auto/">Auto Demo - VR Drift Racing</a> |
| <a href="https://codesandbox.io/s/natuerlich-ragdoll-physics-j2q7mc?file=/src/App.js"><Image img={require(`@site/static/images/rag-doll.gif`)} style={{width: "100%"}}/></a>|  |
| <a href="https://coconut-xr.github.io/klettern/">Klettern Demo - VR Climbing</a> |
| |

## [Documentation](/)

| | |
| --- | --- |
| <a href="/getting-started">Getting Started - barebones WebXR, Hands, and Controllers</a> | <a href="/object-interaction">Interaction with Objects - build interactions with objects</a>|
| <a href="/getting-started"><Image img={require(`@site/static/images/barebones.gif`)} style={{width: "70%"}}/></a>| <a href="/object-interaction"><Image img={require(`@site/static/images/object-draggable.gif`)} style={{width: "70%"}}/></a> |
| <a href="/koestlich-interaction">Interaction with Koestlich - build interactive 3D UIs</a> | <a href="/teleport">Teleport - building a teleport interaction</a> |
| <a href="/koestlich-interaction"><Image img={require(`@site/static/images/koestlich-interactable.gif`)} style={{width: "70%"}}/></a> | <a href="/teleport"><Image img={require(`@site/static/images/teleport.gif`)} style={{width: "70%"}}/></a>|
| <a href="/poses">Poses - detecting and generating hand poses</a> |  <a href="/layers">Layers - high quality content using WebXR layers</a>|
| <a href="/poses"><Image img={require(`@site/static/images/poses.gif`)} style={{width: "70%"}}/></a>| <a href="/layers"><Image img={require(`@site/static/images/layer.gif`)} style={{width: "70%"}}/></a>|
| <a href="/anchors">Anchors - spatial anchors using WebXR anchors</a> | <a href="/tracked-planes">Tracked Planes - tracked room planes using WebXR planes</a>|
| <a href="/anchors"><Image img={require(`@site/static/images/anchor.gif`)} style={{width: "70%"}}/></a>| <a href="/tracked-planes"><Image img={require(`@site/static/images/tracked-planes.gif`)} style={{width: "70%"}}/></a>|
| <a href="/head-up-display">Head Up Display - placing content in front of the user's camera</a>| <a href="/custom-input-sources">Custom Input Sources - building custom interactive hands and controllers</a>|
| <a href="/head-up-display"><Image img={require(`@site/static/images/head-up-display.gif`)} style={{width: "70%"}}/></a> | <a href="/custom-input-sources"><Image img={require(`@site/static/images/fist-grab-hand.gif`)} style={{width: "70%"}}/></a>|
|  <a href="/images"> Tracked Images - <br></br> image marker tracking using WebXR Image Tracking </a>| <a href="/guards">Guards - <br></br> conditional rendering using guards </a>|
| <a href="/use-xr"> Use XR - <br></br> accessing the raw XR state </a>| <a href="/configuration">Configuration - <br></br> configuring foveation, frameRate, referenceSpace, and frameBufferScaling </a>|
| | |
---

- <a href="/all-components">All Components - API Documentation for all available components</a>

- <a href="/all-hooks">All Hooks - API Documentation for all available hooks</a>

## Acknowledgements

This library is only possible because of the great efforts from the [Immersive Web Community Group and Immersive Web Working Group at the W3C](https://github.com/immersive-web), the [Three.js](https://github.com/mrdoob/three.js) team, and the [react-three-fiber](https://github.com/pmndrs/react-three-fiber) team. This work is inspired by existing libraries, such as [react-xr](https://github.com/pmndrs/react-xr) and [handy-work](https://github.com/AdaRoseCannon/handy-work).

**natuerlich** is funded by [Coconut Capital](https://coconut.capital/)
