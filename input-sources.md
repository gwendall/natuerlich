# Input Sources

The `Hands` and `Controllers` components are easy to use but offer only few customizations. Instead, developers can use the `GrabHand`, `TouchHand`, `Pointerhand`, `GrabController`, `PointerController`, `TeleportHand`, and `TeleportController` and the `useInputSources` hook for more control over each hand/controller. Each `inputSource` represents one hand or controller. Developers can map each `inputSource` to a custom hand or controller implementation. If you application requires custom hands/controllers components, please read the [custom input sources](./custom-input-sources.md) documentation.

The `useInputSources` hook allows to retrieve all active input sources, which represent both hands and controllers. Using `inputSources.map`, we map each controller/hand to its implementation. This allows developers to provide different implementations based on the `inputSource.handedness`. We can differentiate between hands and controllers based on the existence of the `hand` property on the `inputSource`.

The following code, shows how to assign different hand/controller interactions to different hands and provides more granular control over interactions and visualizations for controllers/hands.

#### Important:

All objects tracked using WebXR, such as the controllers and hands, must be placed inside the `ImmersiveSessionOrigin`.
When using hands inside a WebXR session, the `"hand-tracking"` feature needs to be requested inside the `sessionOptions`.

[CodeSandbox](https://codesandbox.io/s/natuerlich-input-sources-gwgzhg?file=/src/app.tsx)

![Screenshot]()

```tsx
import {
  XRCanvas,
  GrabHand,
  GrabController,
  PointerController,
  PointerHand,
  Grabbable
} from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources
} from "@coconut-xr/natuerlich/react";
import { getInputSourceId } from "@coconut-xr/natuerlich";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"]
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
        <Grabbable position={[0, 1.5, 1]}>
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </Grabbable>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              inputSource.handedness === "left" ? (
                <GrabHand
                  id={getInputSourceId(inputSource)}
                  key={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                  hand={inputSource.hand}
                />
              ) : (
                <PointerHand
                  id={getInputSourceId(inputSource)}
                  key={getInputSourceId(inputSource)}
                  inputSource={inputSource}
                  hand={inputSource.hand}
                />
              )
            ) : inputSource.handedness === "left" ? (
              <GrabController
                id={getInputSourceId(inputSource)}
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
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

```
