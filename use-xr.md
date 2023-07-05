# useXR Hook

The `useXR` hook allows retrieve WebXR the current **mode** (`immersive-vr`, `immersive-ar`, `inline`, or `none`), the **session**, the **inputSources**, the active **layers**, and the **trackedImages**.

The hook allows to listen to any of these values using `useXR(state => state.{property})`. In situations where only the current value is required `useXR.getState().{property}` can be used.

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