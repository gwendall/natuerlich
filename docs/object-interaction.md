# Interaction with Objects

Interactions in **natuerlich** work, like everywhere else in react, through properties, such as `onClick`, on the elements. The interaction is based on [@coconut-xr/xinteraction](https://github.com/coconut-xr/xinteraction). For a more in-depth explanation of the event system and its features, visit the [xinteraction documentation](https://coconut-xr.github.io/xinteraction/#/).

In the following, we define a box that reacts to the `click` event and increases the box size by 10%. The `useState` hook stores the scale of the box, and each call to `setScale` takes the current state and multiplies it with `1.1`. When using the default `GrabController` and `GrabHand`, the click event will be triggered by grabbing and releasing the box.

All interactions built with **natuerlich**  work with hands, controllers, and normal mouse and touch controls.

[CodeSandbox](https://codesandbox.io/s/natuerlich-object-interaction-lj9lpj?file=/src/app.tsx)

![Screenshot](./object-interactable.gif)

```tsx
import {
  XRCanvas,
  GrabHand,
  GrabController
} from "@coconut-xr/natuerlich/defaults";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources
} from "@coconut-xr/natuerlich/react";
import { useState } from "react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const [scale, setScale] = useState(1);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <mesh
          onClick={() => setScale((s) => s * 1.1)}
          scale={scale}
          position={[0, 1.5, 1]}
        >
          <boxGeometry />
          <meshBasicMaterial color="red" />
        </mesh>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {...}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}

```
Implementing more complex interactions, such as dragging, can be achieved with `setPointerCapture`. Just as in the web, `setPointerCapture` allows to capture events until a button is released, allowing the implementation of a custom drag behavior. For more information, visit the [event capture documentation of xinteraction](https://coconut-xr.github.io/xinteraction/#/event-capture.md). `setPointerCapture` can be used to implement all kinds of interactions ranging from a 2D simple slider to a 3D steering wheel.

In the following code, we use the `onPointerDown` listener to capture the state of the box when it is grabbed and then apply the position offset to the object inside the `onPointerMove` listener.

The example also shows that the dragging interactions work with hands, controllers, mouse, and touch controls.

[CodeSandbox](https://codesandbox.io/s/natuerlich-drag-qc378s?file=/src/app.tsx)

![Screenshot](./object-draggable.gif)

```tsx
import {
  XRCanvas,
  PointerHand,
  PointerController
} from "@coconut-xr/natuerlich/defaults";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { useRef } from "react";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources
} from "@coconut-xr/natuerlich/react";
import { isXIntersection } from "@coconut-xr/xinteraction";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const ref = useRef<Mesh>(null);
  const downState = useRef<{
    pointerId: number;
    pointToObjectOffset: Vector3;
  }>();
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <mesh
          scale={0.1}
          onPointerDown={(e) => {
            if (
              ref.current != null &&
              downState.current == null &&
              isXIntersection(e)
            ) {
              e.stopPropagation();
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              downState.current = {
                pointerId: e.pointerId,
                pointToObjectOffset: ref.current.position.clone().sub(e.point)
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
            ref.current.position
              .copy(downState.current.pointToObjectOffset)
              .add(e.point);
          }}
          ref={ref}
          position={[0, 1.5, 1]}
        >
          <boxGeometry />
          <meshBasicMaterial color="red" />
        </mesh>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {...}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)