# Tracked Images

The [WebXR Image Tracking](https://github.com/immersive-web/marker-tracking/blob/main/explainer.md) feature allows tracking images in Augmented Reality. Tracking images in AR requires the image to be present, including its expected width in meters. The image must be submitted as an `ImageBitmap` when starting the WebXR session. **natuerlich** provides the `TrackedImage` component to display content at the place where WebXR found the tracked image. The `TrackedImage` component takes the same bitmap provided for the start of the session as the `image` parameter.

The following example shows how to load a tracked image as a texture, convert the texture to a bitmap, and use the texture to display a plane containing the loaded texture at the position of the tracked image.

The following image was used for tracking in the [CodeSandbox](https://codesandbox.io/s/natuerlich-images-q6zknf?file=/src/app.tsx).
![Image](./tracked-image.jpeg)

#### Important:

The image tracking on WebXR currently only works in Android Chrome. The `TrackedImage` must be placed inside `ImmersiveSessionOrigin` if an `ImmersiveSessionOrigin` is present. Furthermore, the `"image-tracking"` feature must be added to the `sessionOptions` for the [WebXR Image Tracking](https://github.com/immersive-web/marker-tracking/blob/main/explainer.md) to be active if supported by the device.


[CodeSandbox](https://codesandbox.io/s/natuerlich-images-q6zknf?file=/src/app.tsx)

```tsx
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  TrackedImage
} from "@coconut-xr/natuerlich/react";
import { useLoader } from "@react-three/fiber";
import { useMemo } from "react";
import { TextureLoader } from "three";
import { suspend } from "suspend-react";

const widthInMeters = 0.2;

const createImageBitmapSymbol = Symbol("createImageBitmap")

export default function Index() {
  const texture = useLoader(TextureLoader, "/image.jpg");
  const bitmap = suspend((i) => createImageBitmap(i), [
    texture.image,
    createImageBitmapSymbol
  ]);
  const options = useMemo(
    () => ({
      requiredFeatures: ["local-floor", "image-tracking"],
      trackedImages: [
        {
          image: bitmap,
          widthInMeters
        }
      ]
    }),
    [bitmap]
  );
  const enterAR = useEnterXR("immersive-ar", options);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          <TrackedImage image={bitmap}>
            <mesh scale={widthInMeters}>
              <planeGeometry />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
          </TrackedImage>
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)