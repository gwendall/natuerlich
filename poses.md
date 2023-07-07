## Poses

**Acknowledgement**: Our implementation is based on [handy-work](https://github.com/AdaRoseCannon/handy-work)

For detecting hand poses, **natuerlich** offers the `useHandPoses` hook. The hook takes the `inputSource.hand`, the `inputSource.handedness`, and a callback called every frame with the current and previous detected pose. The callback is followed by the poses that the algorithm should detect. The parameter maps the URL where the pose information can be found to its name. The last parameter of the hook is optional and contains the `baseUrl` for the URLs of the poses.

**natuerlich** provides the default poses `fist, flat, horns, l, peace, point, relax, shaka, and thumb`.

The `useHandPoses` hook returns a function that allows downloading the current hand pose to a binary file. This file can then be used to match the recorded pose. New poses can be captured using your own implementation or directly inside the [coconut-xr/pose-booth](https://github.com/coconut-xr/pose-booth).

The following code illustrates how to use the `useHandPoses` hook. The example displays the currently and previously detected pose on a Koestlich UI. A `PoseHand` component is created and used for each present `inputSource` that contains `inputSource.hand`. For more information about mapping `inputSources` to hands/controllers visit the [Input Sources](./input-sources.md) documentation.

Another example of using the `useHandPoses` hook inside a custom hand to detect a fist gesture and trigger a grab interaction in the scene can be found in the [Custom Input](./custom-input-sources.md) documentation.

#### Important:

The downloaded pose corresponds to the `inputSource.hand` pose. Calling `downloadPose` on both hands records one pose for each hand. The recording of a pose is unrelated to the right or left hand. A pose recorded on the left-hand works on the right hand and vice versa.

[CodeSandbox](https://codesandbox.io/s/natuerlich-poses-nwf4s9?file=/src/app.tsx)

![Screenshot](./poses.gif)

```tsx
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { useState } from "react";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources,
  useHandPoses
} from "@coconut-xr/natuerlich/react";
import { RootContainer, Text } from "@coconut-xr/koestlich";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
};

export function PoseHand({
  hand,
  inputSource,
  setPoseNames
}: {
  hand: XRHand;
  inputSource: XRInputSource;
  setPoseNames: (names: string) => void;
}) {
  useHandPoses(
    hand,
    inputSource.handedness,
    (name, prevName) => {
      console.log(name, prevName);
      setPoseNames(`${name}, ${prevName}`);
    },
    {
      fist: "fist.handpose",
      relax: "relax.handpose",
      point: "point.handpose"
    }
  );

  return null;
}

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const [leftPoseNames, setLeftPoseNames] = useState("none");
  const [rightPoseNames, setRightPoseNames] = useState("none");
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <group position={[0, 1.5, 0]}>
          <RootContainer anchorX="center" anchorY="center">
            <Text>{`Left: ${leftPoseNames}`}</Text>
            <Text>{`Right: ${rightPoseNames}`}</Text>
          </RootContainer>
        </group>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              <PoseHand
                setPoseNames={
                  inputSource.handedness === "left"
                    ? setLeftPoseNames
                    : setRightPoseNames
                }
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
                hand={inputSource.hand}
              />
            ) : null
          )}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}

```

If the goal is to detect pose changes, the following code illustrates how to detect the start and end of the `fist` pose.

```typescript
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
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)