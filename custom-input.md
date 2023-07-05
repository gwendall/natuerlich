# Custom Hand

When building a custom hand or controller, we recommend looking at the existing default hands and controllers and modifying them to your needs. In some cases a complete new interaction type could be required, such as a `WhipController`, which selectes objects with a physical based whip-pointer. In such a case, in-depth understanding about the [xinteraction](https://github.com/coconut-xr/xinteraction) event system should be present.

For a more basic interaction, such as a `FirstGrabHand`, which grabs objects based on the `fist` gesture, we can simply modify the `GrabHand`.

_For simplicity, the follwing example does not contain visual effects such as a cursor._

[CodeSandbox](https://codesandbox.io/s/natuerlich-fist-grab-hand-75r355?file=/src/app.tsx)

![Screenshot]()

**TBD: Currently not working, because default poses are not recorded yet**

```tsx
export function FistGrabHand({
  radius,
  hand,
  inputSource,
  id,
}: {
  radius: number;
  hand: XRHand;
  inputSource: XRInputSource;
  id: number;
}) {
  const colliderRef = useRef<InputDeviceFunctions>(null);

  useHandPoses(
    inputSource.hand,
    inputSource.handedness,
    (name, prevName) => {
      const isFist = name === "fist";
      const wasFist = prevName === "fist";
      if (isFist == wasFist) {
        return;
      }
      if (isFist) {
        colliderRef.current?.press(0, {});
      }
      if (wasFist) {
        colliderRef.current?.release(0, {});
      }
    },
    {
      fist: "fist.handpose",
      relax: "relax.handpose",
    },
  );

  return (
    <Suspense fallback={null}>
      <DynamicHandModel hand={hand} handedness={inputSource.handedness}>
        <HandBoneGroup joint="wrist">
          <XSphereCollider ref={colliderRef} radius={radius} id={id} />
        </HandBoneGroup>
      </DynamicHandModel>
    </Suspense>
  );
}
```

# Custom Controller

