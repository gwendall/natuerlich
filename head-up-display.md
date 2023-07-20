# Head Up Display

Placing content in front of the user's camera in an XR session can be achieved using the `cameraContent` property of the `ImmersiveSessionOrigin`. This content will be placed at the position of the user's head.

In the following example, we place an object in front of the user's camera by setting the position 4 units in front of the user's camera (z-axis). We render the same content inside the `NonImmersiveCamera`, allowing immersive and non-immersive users to view the same content.

[CodeSandbox](https://codesandbox.io/s/natuerlich-hud-8plt6z?file=/src/app.tsx)

![Screenshot](./head-up-display.gif)

```tsx
import {
  useEnterXR,
  ImmersiveSessionOrigin,
  NonImmersiveCamera
} from "@coconut-xr/natuerlich/react";
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";

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
        <NonImmersiveCamera position={[0, 1.5, 0]}>
          <mesh position={[0, 0, -4]}>
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </NonImmersiveCamera>
        <ImmersiveSessionOrigin
          position={[0, 0, 0]}
          cameraContent={
            <mesh position={[0, 0, -4]}>
              <boxGeometry />
              <meshBasicMaterial color="red" />
            </mesh>
          }
        />
      </XRCanvas>
    </div>
  );
}

```

#### Alternative:

A alternative way to achieve a head up display effect is to "portal" content inside the camera using the `createPortal` function from `@react-three/fiber`.
This can be achieved using the following code, working for immersive and non-immersive sessions.

```tsx
const camera = useThree((state) => state.camera);
return createPortal(
  <mesh position={[0, 0, -4]}>
    <boxGeometry />
    <meshBasicMaterial color="red" />
  </mesh>,
  camera,
);
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
