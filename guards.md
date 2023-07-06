# Guards

Guards allow to conditionally display or include content based on the session mode or whether the object is facing the camera of the user. For instance, the `SessionModeGuard` guard allows only displaying a background when the session is not an AR session. The `SessionModeGuard` can receive either a list of `allow` session modes or a list of `deny` session modes.

[CodeSandbox](https://codesandbox.io/s/natuerlich-guards-xwx9yd?file=/src/app.tsx)

```tsx
rimport { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import {
  useEnterXR,
  SessionModeGuard
} from "@coconut-xr/natuerlich/react";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor"]
};

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  return (
    <div
      style={{...}}
    >
      <button onClick={enterAR}>Enter AR</button>
      <XRCanvas>
        <SessionModeGuard deny="immersive-ar">
          <color args={["red"]} attach="background" />
        </SessionModeGuard>
      </XRCanvas>
    </div>
  );
}

```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)