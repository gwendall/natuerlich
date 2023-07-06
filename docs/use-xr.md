# useXR Hook

The `useXR` hook allows to retrieve the current XR state, including the  **mode** (`immersive-vr`, `immersive-ar`, `inline`, or `none`), the **session**, the **inputSources**, the active **layers**, the **trackedImages**, and the **trackedPlanes**.

The hook allows developers to listen to any of these values using `useXR(state => state.{property})`. When only the current value is required, `useXR.getState().{property}` can be used.

For instance, if you have a cube that should only rotate in `AR` mode, you can use `useXR.getState().mode` to determine the current mode inside a `useFrame` hook.

```tsx
const ref = useRef<Mesh>(null);
useFrame((_, delta) => {
  const isAR = useXR.getState().mode === "immersive-ar";
  if (!isAR || ref.current == null) {
    return;
  }
  ref.current.object.rotation.y += delta * 0.1;
});
return (
  <mesh ref={ref}>
    <boxGeometry />
  </mesh>
);
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)