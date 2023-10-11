import Image from '@theme/IdealImage';
import { CodesandboxEmbed } from './CodesandboxEmbed.tsx'

# Tracked Meshes

**natuerlich** supports [WebXR Mesh Detection Module](https://immersive-web.github.io/real-world-meshing/) in the form of `TrackedMesh`s. The `useTrackedMeshes` hook allows to retrieve all detected meshes. The `TrackedMesh` component takes a single mesh and renders the geometry retrieved from the mesh. The material of the `TrackedMesh` can be customized using R3F, and further content can be placed as its children.

:::caution Important
The `TrackedMesh` component must be placed inside the `ImmersiveSessionOrigin` if an `ImmersiveSessionOrigin` is present. The `useTrackedMeshes` hook must be placed inside the Canvas. Furthermore, the `"mesh-detection"` feature must be added to the `sessionOptions` for the [WebXR Mesh Detection Module](https://immersive-web.github.io/real-world-meshing/) to be active if supported by the device.
:::

<CodesandboxEmbed path="natuerlich-tracked-meshes-ylfh84"/>

Image: TBD

```tsx
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  TrackedMesh,
  useTrackedMeshes
} from "@coconut-xr/natuerlich/react";
import { getMeshId } from "@coconut-xr/natuerlich";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hit-test", "mesh-detection"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const meshes = useTrackedMeshes();
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          <pointLight position={[0, 1, 0]} intensity={10} />
      {meshes?.map((mesh) => (
        <TrackedMesh mesh={mesh} key={getMeshId(mesh)}>
          <meshBasicMaterial wireframe color="red" />
        </TrackedMesh>
      ))}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}

```

## Get the Mesh for Specific Objects using Semantic Labels

Using `useTrackedObjectMeshes("couch")` you can retrieve all the mesh of all objects that were recognized as couches. Using or rendering the retrieved meshes works the same way as in the demo above. 

---

:::note Question not answered?

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) 😉

:::
