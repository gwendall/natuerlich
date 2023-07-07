# Configuration

The `XRCanvas` and also the manual `XR` component allow to configure the foveation, frameRate, referenceSpace, and frameBufferScaling.

The frameRate can only be set to a valid frameRate, which can be trieved with `useFramRates`. The frameBufferScaling can be set to a value ranging from `0` to the `nativeFramebufferScaling`. The latter can be retrieved via `useNativeFramebufferScaling`.

The following code shows how to use the maximum available framerate and frameBufferScaling on the `XRCanvas` using the `useHeighestAvailableFrameRate` and `useNativeFramebufferScaling` hooks.

```tsx
const frameBufferScaling = useNativeFramebufferScaling();
const frameRate = useHeighestAvailableFrameRate();

return <XRCanvas
    frameBufferScaling={frameBufferScaling}
    frameRate={frameRate}
    >
```
