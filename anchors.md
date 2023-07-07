# Anchors

**natuerlich** supports [WebXR Anchors Module](https://immersive-web.github.io/anchors/) with the `useAnchor` and `usePersistedAnchor` hooks. Both hooks return a tuple containing the `anchor` and a `createAnchor` function. If no anchor is present, the returned `anchor` is undefined. A new anchor is created once the `createAnchor` function is called. If the process is successful, the returned `anchor` will contain an `XRAnchor`.

The `XRAnchor` contains the `anchorSpace` property. The `anchorSpace` property can be used to display content at the position of the anchor using the `SpaceGroup` component. The `SpaceGroup` component takes the `space` property and renders all its children at the origin of the provided space.

In the following example, we create a box that can be positioned by pinching anywhere in the scene. Once the user pinches, the anchor and the box is set to that position. The anchor is persisted even when restarting the immersive experience.

#### Important:

The `SpaceGroup` component must be placed inside the `ImmersiveSessionOrigin` if a `ImmersiveSessionOrigin` is present. Furthermore, the `"anchors"` feature must be added to the `sessionOptions` for the [WebXR Anchors Module](https://immersive-web.github.io/anchors/) to be active if supported by the device.

[CodeSandbox](https://codesandbox.io/s/natuerlich-anchors-8wls7l?file=/src/app.tsx)

![Screenshot]()

```tsx
import {
  XRCanvas,
  Controllers,
  Hands
} from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  SpaceGroup,
  usePersistedAnchor
} from "@coconut-xr/natuerlich/react";
import { Quaternion } from "three";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "anchors"]
};

export default function Index() {
  const [anchor, createAnchor] = usePersistedAnchor("test-anchor");
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {anchor != null && (
            <SpaceGroup space={anchor.anchorSpace}>
              <mesh scale={0.1}>
                <boxGeometry />
                <meshBasicMaterial color="red" />
              </mesh>
            </SpaceGroup>
          )}
          <Hands type="grab"
            onPointerDownMissed={(e) => createAnchor(e.point, new Quaternion())}
          />
          <Controllers type="grab"
            onPointerDownMissed={(e) => createAnchor(e.point, new Quaternion())}
          />
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
