# Interaction with [koestlich](https://github.com/coconut-xr/koestlich)

Building a UI in WebXR can be achieved with [koestlich](https://github.com/coconut-xr/koestlich). **natuerlich** provides out of the box support for interaction with **koestlich**, such as scrolling.

The following example, create a simple UI with koestlich that changes its background color when clicked using a `TouchHand` and `TouchController`.

For a more information on how to build 3D UIs visit the [koestlich documentation](https://coconut-xr.github.io/koestlich/#/).

[CodeSandbox](https://codesandbox.io/s/natuerlich-koestlich-tfpn9v?file=/src/app.tsx)

![Screenshot]()

```tsx
import {
  XRCanvas,
  PointerHand,
  PointerController
} from "@coconut-xr/natuerlich/defaults";
import { RootText } from "@coconut-xr/koestlich";
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
  const [blue, setBlue] = useState(false);

  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <group position={[0, 1.5, 1]}>
          <RootText
            onClick={() => setBlue((blue) => !blue)}
            anchorX="center"
            anchorY="center"
            padding={0.05}
            backgroundColor={blue ? "blue" : "green"}
          >
            Hello World
          </RootText>
        </group>
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
```


## Binding as Koestlich UI to the Hand / Controller

Binding a interactive UI to the hands of the users can feel very intuitive. The following example shows how to Koestlich UI can be bound to the wrist.

[CodeSandbox](https://codesandbox.io/s/natuerlich-koestlich-bound-5qz2z8?file=/src/app.tsx)

![Screenshot]()

```tsx
import {
  XRCanvas,
  PointerHand,
  PointerController
} from "@coconut-xr/natuerlich/defaults";
import { RootText } from "@coconut-xr/koestlich";
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

function UI() {
  const [blue, setBlue] = useState(false);
  return (
    <RootText
      onClick={() => setBlue((blue) => !blue)}
      anchorX="center"
      anchorY="center"
      padding={0.05}
      backgroundColor={blue ? "blue" : "green"}
    >
      Hello World
    </RootText>
  );
}

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              <PointerHand
                id={getInputSourceId(inputSource)}
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
                hand={inputSource.hand}
                childrenAtJoint="wrist"
              >
                <UI />
              </PointerHand>
            ) : (
              <PointerController
                id={getInputSourceId(inputSource)}
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
              >
                <UI />
              </PointerController>
            )
          )}
        </ImmersiveSessionOrigin>
      </XRCanvas>
    </div>
  );
}
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
