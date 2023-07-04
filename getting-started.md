# Getting Started

In the following tutorials, we will create several WebXR Experiences using **natuerlich** and react-three/fiber. Install the dependencies manually via `npm i @coconut-xr/natuerlich @react-three/fiber react react-dom three` or use the CodeSandbox provided for each example.  **natuerlich** requires three.js (*153.0.0 is not supported*) or higher. When developing locally, make sure you host your code using https, which is required for WebXR sessions.

## Bare-bones WebXR Experience

To build an immersive experience with **@coconut-xr/natuerlich**, we need to **(1)** provide a way to enter the immersive session, **(2)** enable our application to handle WebXR, and **(3 - _optional_)** control where the immersive and non-immersive users are positioned. We provide the resulting code for the following section in this [CodeSandbox]().

### **(1)** - enter the immersive session

We create a button that joins an immersive augmented reality session when clicked. This is achieved through the `useEnterXR` hook, which receives the session mode (e.g., immersive-ar) and session options containing required and optional features. In this case, we declare the `"local-floor"` reference space and `"hand-tracking"` as required.

```tsx
const sessionOptions: XRSessionInit = { requiredFeatures: ["local-floor", "hand-tracking"] };
const enterAR = useEnterXR("immersive-ar", sessionOptions);

return <button onClick={enterAR}>Enter AR</button>;
```

### **(2)** - Add WebXR Support

WebXR support can be added to the scene via the `<XR/>` component. The component allows configuring WebXR features, such as foveation, frameRate, referenceSpace, and frameBufferScaling via corresponding optional properties.

**TBD: explain exchange event system using xinteraction!!!**

```tsx
return (
  <Canvas>
    <XR />
  </Canvas>
);
```

### **(3 - optional)** - control non-immersive and immersive user position

In the third optional step, we take control of the transformation of the non-immersive camera and the origin of the immersive session through the `<NonImmersiveCamera/>` and `<ImmersiveSessionOrigin/>` components. The `<NonImmersiveCamera/˚>` controls the camera transformation when no immersive session is present. The `<ImmersiveSessionOrigin/>` controls the transformation of the user in relation to the scene when in WebXR. Controllers and Hands will be added and configured inside the `<ImmersiveSessionOrigin/>`.

# TODO: write that every hand is rendered seperately

```tsx
return <Canvas>
    <XR>
    <NonImmersiveCamera position={[10, 2, 0]}/>
    <ImmersiveSessionOrigin position={[10, 0, 0]}>
</Canvas>
```

## Adding Controls and Hands

**natuerlich** supports a wide spectrum of interaction types and represents hands and controllers as `input devices`. **natuerlich** provides components for the most common input device types, such as grabbing controllers and hands, pointing controllers and hands, and touching hands. All input devices provide visual feedback via a cursor and/or a pointer. **natuerlich**'s default input devices provide a simple introduction to interaction in WebXR. However, **natuerlich** is made to support customized interaction types, and we, therefore, recommend adapting the input devices to your needs. Read our [introduction to custom input devices](./custom-input.md) for more information.

In the following example, we retrieve the `inputSources` available to the WebXR session. Using these `inputSources`, we create input devices for the hands (`<GrabHand/>`) and controllers (`<GrabController/>`) based on the presence of the `.hand` property on the `inputSource`. With this setup, hands and controllers are present in the scene, and these input devices already support the grabbing interaction. However, there are yet no interactive objects in the scene.

```tsx
const inputSources = useInputSources();
return (
  <ImmersiveSessionOrigin>
    {inputSources.map((inputSource) =>
      inputSource.hand != null ? (
        <GrabHand inputSource={inputSource} hand={inputSource.hand} />
      ) : (
        <GrabController inputSource={inputSource} />
      ),
    )}
  </ImmersiveSessionOrigin>
);
```

## Interaction with Objects

Interactions in **natuerlich** are distributed over the 3D objects in the R3F scene. You can use the R3F event listeners, such as `onClick`, `onPointerDown`, ... to make objects in the scene interactive. The interaction is based on the underlying library `xinteraction`. For a more in-depth explanation of the event system and its features, visit [@coconut-xr/xinteraction](https://github.com/coconut-xr/xinteraction).

In the following, we define a box that reacts on the `click` event by increasing its size by 10%. The `useState` hook stores the scale of the box, and each call to `setScale` takes the current state and multiplies it with `1.1`. When using the grab controllers and hands from the previous example, the click event will be triggered by moving into the box and squeezing and releasing the grab button on the controllers or pinching and unpinching the hand.

```tsx
const [scale, setScale] = useState(1);
return <Box onClick={() => setScale((s) => s * 1.1)} />;
```

Drag cube interaction

```tsx
const ref = useRef<Mesh>(null);
const downState = useRef<{
  pointerId: number;
  pointToObjectOffset: Vector3;
}>();
return (
  <Box
    scale={0.1}
    onPointerDown={(e) => {
      if (ref.current != null && downState.current == null && isXIntersection(e)) {
        e.stopPropagation();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        downState.current = {
          pointerId: e.pointerId,
          pointToObjectOffset: ref.current.position.clone().sub(e.point),
        };
      }
    }}
    onPointerUp={(e) => {
      if (downState.current?.pointerId != e.pointerId) {
        return;
      }
      downState.current = undefined;
    }}
    onPointerMove={(e) => {
      if (
        ref.current == null ||
        downState.current == null ||
        e.pointerId != downState.current.pointerId ||
        !isXIntersection(e)
      ) {
        return;
      }
      ref.current.position.copy(downState.current.pointToObjectOffset).add(e.point);
    }}
    ref={ref}
  />
);
```

Interaction with koestlich

```tsx
const inputSources = useInputSouces();
return (
  <Canvas>
    <ImmersiveSessionOrigin>
      {inputSources
        .filter((inputSource) => inputSource.hand != null)
        .map((inputSource) =>
          inputSource.handedness === "left" ? (
            <Hand hand={inputSource.hand!} inputSource={inputSource}>
              <RootContainer padding={0.1}>
                <Text>Hello World</Text>
              </RootContainer>
            </Hand>
          ) : (
            <TouchHand hand={inputSource.hand!} inputSource={inputSource} />
          ),
        )}
    </ImmersiveSessionOrigin>
  </Canvas>
);
```

## Teleport

```tsx
const inputSources = useInputSources();
return (
  <Canvas>
    <XR />
    <TeleportTarget>
      <Plane />
    </TeleportTarget>
    <ImmersiveSessionOrigin>
      {inputSources.map((inputSource) => (
        <TeleportController inputSource={inputSource} />
      ))}
    </ImmersiveSessionOrigin>
  </Canvas>
);
```

## Guards

use for background/no-background in VR/AR

```tsx
return (
  <Canvas>
    <IncludeWhenInSessionMode deny="immersive-ar">
      <color args={["black"]} attach="background" />
    </IncludeWhenInSessionMode>
    <XR />
  </Canvas>
);
```

## Anchors

persisted and not persisted anchors
request `"anchors"` feature at start

TODO: delete old anchor for persisted anchor

```tsx
const sessionOptions: XRSessionInit = {
  requiredFeatures: [..., "anchorss"],
};
const enterAR = useEnterXR("immersive-ar", sessionOptions);
const [anchor, createAnchor] = usePersistedAnchor("anchor-name");

return (
  <SpaceGroup space={anchor.anchorSpace}>
    <Box />
  </SpaceGroup>
);
```

## Layers

*Layers can't be used with `<color attach="background"/>`. Use `<Background color map .../>` instead*

TBD

*Layer Portals*

*Koestlich Layers*

## Tracked Planes

## Tracked Images

## Poses

*building on [handy-work](https://github.com/AdaRoseCannon/handy-work)*

The hook returns a function that downloads the current hand poses (left and right) to a binary file, that can be used to match that pose.

```tsx

const downloadPose = useHandPoses(
  hand,
  inputSource.handedness,
  (name, prevName) => {
    const isFist = name === "fist";
    const wasFist = prevName === "fist";
    if (isFist == wasFist) {
      return;
    }
    if (isFist) {
      //fist pose started
    }
    if (wasFist) {
      //fist pose stopped
    }
  },
  {
    fist: "fist.handpose",
    relax: "relax.handpose",
    point: "point.handpose",
  },
);
```

## useXR Hook

TBD