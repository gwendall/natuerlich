# Getting Started

In the following tutorials, we will create several WebXR Experiences using **natuerlich** and react-three/fiber. Install the dependencies manually via `npm i @coconut-xr/natuerlich @react-three/fiber react react-dom three zustand three-stdlib` or use the CodeSandbox provided for each example. When developing locally, ensure you host your code using HTTPS, which is required for WebXR sessions.

_Make sure your three.js version is either lower or higher than 0.0.153._

**If you have questions or get stuck, jump into our [Discord](https://discord.gg/NCYM8ujndE).**

## Bare-bones WebXR Experience

Creating the bare minimum for a WebXR experience using **natuerlich** only requires the `useEnterXR` hook to create an Enter Button and the `XRCanvas`. The `XRCanvas` allows to configure WebXR features, such as foveation, frameRate, referenceSpace, and frameBufferScaling via corresponding optional properties.

In the following example, we additionally use the `NonImmersiveCamera` to control the position of the camera when not in VR/AR. We also use the `ImmersiveSessionOrigin` to control the position of the immersive origin (your feet) in AR/VR.

As a result, in the following example, users are positioned in front of the red cube regardless of whether they are in AR/VR or not.

[CodeSandbox](https://codesandbox.io/s/natuerlich-barebones-ddy8m5?file=/src/app.tsx)

| Without AR                                                             | Inside AR                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| <img src="./barebones-inline.png" alt="barebones-inline" width="75%"/> | <img src="./barebones.gif" alt="barebones-ar" width="100%"/> |

```tsx
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin
} from "@coconut-xr/natuerlich/react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <mesh position={[0, 1.5, 1]}>
          <boxGeometry />
          <meshBasicMaterial color="red" />
        </mesh>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]} />
      </XRCanvas>
    </div>
  );
}
```

<details>
  <summary>In Depth Explanation</summary>

Instead of directly using the XRCanvas, the underlying `<XR/>` component can be used to add WebXR support to a scene. The `XR` component allows to change the foveation, frameRate, referenceSpace, and frameBufferScaling.

In addition to adding the `XR`, the event system needs to be overwritten since **natuerlich** uses [xinteraction](https://github.com/coconut-xr/xinteraction). Therefore, the events inside the canvas need to be disabled via `elements={noEvents}`. To enable interaction using normal mouse and touch controls, we are adding the `XWebPointers` from [xinteraction](https://github.com/coconut-xr/xinteraction). The `XRCanvas` automatically applies these changes.

The following code shows how to manually apply, add the `XR` component and exchange the event system.

[CodeSandbox](https://codesandbox.io/s/natuerlich-barebones-manual-dg2q8r?file=/src/app.tsx)

```tsx
import { Canvas } from "@react-three/fiber";
import { XWebPointers } from "@coconut-xr/xinteraction/react";
import { useEnterXR, XR } from "@coconut-xr/natuerlich/react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <Canvas>
        <XR />
        <XWebPointers />
      </Canvas>
    </div>
  );
}

```

</details>

## Adding Basic Interactions

In the following example, we extend the previous code by sorrounding the `<mesh>` with a `Grabbable` component allowing the user to point and drag the box using the mouse or touch on mobile devices. If two fingers are used to drag the `Grabable` it will resize accordingly.

The `Grabbable` component is one of the default interactions we provide. For more information about writing own interactions using onClick, ... events read the [Object Interaction](./object-interaction.md) Documentation.

*If you want to know more about the specific implementation of the `Grabbable` component take a look at the [code](https://github.com/coconut-xr/natuerlich/blob/main/src/defaults/grabbable.tsx).*

[CodeSandbox](https://codesandbox.io/s/natuerlich-barebones-grabbable-zmcmtp?file=/src/app.tsx)

![Screenshot](./grabbable.gif)

```tsx
import {
  XRCanvas,
  Grabbable
} from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin
} from "@coconut-xr/natuerlich/react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <Grabbable position={[0, 1.5, 1]}>
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </Grabbable>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}/>
      </XRCanvas>
    </div>
  );
}
```

## Adding Controllers and Hands

Next we enable interactions with the `Grabbable` mesh using Controllers and Hands. This can be achieved through the high-level `Hands` and `Controllers` components. Both components take a type, which can be either `"pointer"`, `"grab"`, and `"teleport"`. For `Hands` the type `"touch"` is additionally available.

In the following example, we extend the previous code by adding `<Hands type="pointer/>` and `<Controllers type="pointer"/>` into the `ImmersiveSessionOrigin`.

*Instead of using the default `Hands` and `Controllers` **natuerlich** also allows to build custom input sources on different levels of abstraction. For a introduction to building your own hands and controllers read the [Input Sources](./input-sources.md) Documentation. Additionally, the [Custom Input Sources](./custom-input-sources.md) Documentation goes into more detail on building custom low-level input source types.*

#### Important:

All objects tracked using WebXR, such as the controllers and hands, must be placed inside the `ImmersiveSessionOrigin`.
When using hands inside a WebXR session, the `"hand-tracking"` feature needs to be requested inside the `sessionOptions`.

[CodeSandbox](https://codesandbox.io/s/natuerlich-hands-controllers-wthf4v?file=/src/app.tsx)

![Screenshot](./hand-and-controllers.gif)

```tsx
import {
  XRCanvas,
  Hands,
  Pointers,
  Grabbable
} from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin
} from "@coconut-xr/natuerlich/react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <Grabbable position={[0, 1.5, 1]}>
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </Grabbable>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          <Hands type="pointer" />
          <Pointers type="grab" />
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}
```

## Next Up

With this bare-bones setup, you are ready to use all features **natuerlich** has to offer. The following list contains an unordered list of features and their documentation.

- [Interaction with Objects](./object-interaction.md) - build interactions with objects
- [Interaction with Koestlich](./koestlich-interaction.md) - build interactive 3D UIs
- [Teleport](./teleport.md) - building a teleport interaction
- [Poses](./poses.md) - detecting and generating hand poses
- [Guards](./guards.md) - conditional rendering using guards
- [Layers](./layers.md) - high quality content using WebXR layers
- [Anchors](./anchors.md) - spatial anchors using WebXR anchors
- [Tracked Planes](./planes.md) - tracked room planes using WebXR planes
- [Tracked Images](./images.md) - image marker tracking using WebXR Image Tracking
- [Head Up Display](./head-up-display.md) - placing content in front of the user's camera
- [Custom Input Sources](./custom-input-sources.md) - building custom interactive hands and controllers
- [Use XR](./use-xr.md) - accessing the raw XR state
- [Configuration](./configuration.md) - configurating foveation, frameRate, referenceSpace, and frameBufferScaling

---

- [All Components](./all-components.md) - API Documentation for all available components
- [All Hooks](./all-hooks.md) - API Documentation for all available hooks

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
