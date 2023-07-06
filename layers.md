# Layers

[WebXR Layers](https://www.w3.org/TR/webxrlayers-1/) allow rendering content in a specific shape (e.g., plane or cylinder) more efficiently and at a higher resolution. **natuerlich** provides several components that simplify the use of layers. Furthermore, when the layers feature is unavailable, **natuerlich** falls back to normal three.js shapes.

Layers can be placed anywhere in the scene, even inside a controller/hand. Layers can either render a texture or render another scene inside them.

The following example shows how to apply a texture to a `QuadLayer`. Alternatively, **natuerlich** provides the `CylinderLayer`, which allows rendering textures and scenes to a bend plane.

#### Important:

Layers can not be used with `<color attach="background"/>`. Setting a background color requires using a `Background` component (e.g., `<Background color map .../>`) instead. Furthermore, the `"layers"` feature must be added to the `sessionOptions` for the [WebXR Layers](https://www.w3.org/TR/webxrlayers-1/) to be active if supported by the device. By default, layers do not support transparency and will behave incorrectly when displaying transparent content. The `transparent` flag must be set on the layer if transparent content is needed. Using transparent layers further requires the `"depth-sorted-layers"` feature inside the `sessionOptions`. If the required features are absent, the layer is rendered directly inside the scene, losing the advantages of the WebXR layers.

[CodeSandbox](https://codesandbox.io/s/natuerlich-barebones-forked-94hg4s?file=/src/app.tsx)

![Screenshot](./layer.gif)

```tsx
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  QuadLayer
} from "@coconut-xr/natuerlich/react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "layers"]
};

export default function Index() {
  const texture = useLoader(TextureLoader, "img.jpg");
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <QuadLayer
          texture={texture}
          pixelWidth={texture.image.width}
          pixelHeight={texture.image.height}
          position={[0, 1.5, 1]}
        />
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]} />
      </XRCanvas>
    </div>
  );
}

```

### Layer Portals

**natuerlich** provides the `QuadLayerPortal` and `CylinderLayerPortal` as defaults, allowing to render a scene inside them. All events happening on the surface of the layer are automatically propagated inside the portal.

The following example shows how to create an interactive scene inside a portal. We re-use the code for dragging objects from the [object interaction](./object-interaction.md) documentation.

#### Important:

The current implementation is inefficient and results in regular lags. The correct implementation awaits a [PR in three.js](https://github.com/mrdoob/three.js/pull/25254).

[CodeSandbox](https://codesandbox.io/s/natuerlich-layer-portal-2cl3dv?file=/src/app.tsx)

![Screenshot](./cylinder-layer-portal.gif)

```tsx
import {
  XRCanvas,
  PointerController,
  PointerHand
} from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  CylinderLayerPortal,
  useInputSources
} from "@coconut-xr/natuerlich/react";
import { useRef } from "react";
import { Mesh, Vector3 } from "three";
import { isXIntersection } from "@coconut-xr/xinteraction";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "layers"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <CylinderLayerPortal
          pixelWidth={1024}
          pixelHeight={1024}
          position={[0, 1.5, 1]}
        >
          <DragBox />
        </CylinderLayerPortal>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              <PointerHand
                id={getInputSourceId(inputSource)}
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
                hand={inputSource.hand}
              />
            ) : (
              <PointerController
                id={getInputSourceId(inputSource)}
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
              />
            )
          )}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}

function DragBox() {
  ...
}
```

### Koestlich Layers

When building a layer portal for [koestlich](https://github.com/coconut-xr/koestlich), **natuerlich** also provides the `KoestlichQuadLayer` and `KoestlichCylinderLayer`. Both components allow developers to build a UI directly inside a WebXR Layer without additional configuration. The events propagate automatically inside the layer, as in the previous example.

The following example code contains a simple UI rendering two texts. The layer is configured with a pixel size of 1024x1024. The content inside the layer can be scaled using the `contentScale` parameter. In this case, the size of the content inside the UI has a size of 1x1.

[CodeSandbox](https://codesandbox.io/s/natuerlich-koestlich-layer-portal-8gv5n2?file=/src/app.tsx)

![Screenshot](./koestlich-layer.gif)

```tsx
import { XRCanvas, KoestlichQuadLayer } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin
} from "@coconut-xr/natuerlich/react";
import { Text, Container } from "@coconut-xr/koestlich";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "layers"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <KoestlichQuadLayer
          pixelWidth={1024}
          pixelHeight={1024}
          contentScale={1024}
          position={[0, 1.5, 1]}
        >
          <Container
            height="100%"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text color="white">Hello World</Text>
            <Text color="white">Coconut XR</Text>
          </Container>
        </KoestlichQuadLayer>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]} />
      </XRCanvas>
    </div>
  );
}

```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
