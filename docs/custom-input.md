# Custom Hands and Controllers

When building a custom hand or controller, we recommend looking at the existing default hands and controllers and modifying them to your needs. In some cases, a completely new interaction type, such as a `WhipController`, which selects objects with a physical-based whip-pointer, could be required. In such a case, an in-depth understanding of the [xinteraction](https://github.com/coconut-xr/xinteraction) event system should be present.

The following two sections show how to build a basic [custom hand](#custom-hand) and [custom controller](#custom-controller).

## Custom Hand

For a more basic interaction, such as a `FistGrabHand`, which grabs objects based on the `fist` gesture, we can simply modify the `GrabHand`. We use the `DynamicHandModel` to display a hand model and the `HandBoneGroup` to display content on a specific joint. In this case, we place a `XSphereCollider` inside the `wrist` joint. Next, we bind `press` and `release` events of the `XSphereCollider` to the start and end of the `fist` pose.

_For simplicity, the following example does not contain visual effects such as a cursor._

[CodeSandbox](https://codesandbox.io/s/natuerlich-fist-grab-hand-75r355?file=/src/app.tsx)

![Screenshot]()

**TBD: Currently not working because default poses are not recorded yet**

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

## Custom Controller

In this section, we build a `ShortPointerController`, which is very similar to the normal `PointerController` but has a ray with a length of 10cm.

We start by rendering the controller model with the correct transformation. We use a `SpaceGroup` to render a `DynamicControllerModel` at the `inputSource.gripSpace` position. The `DynamicControllerModel` will automatically select the correct controller model and apply animations to the buttons etc.

Next, we add the ray originating from the `inputSource.targetRaySpace`. We again use a `SpaceGroup` to an `XCurvedPointer` from **xinteraction** and a `Mesh` from **three.js** inside at the `targetRaySpace`. The mesh receives a `RayBasicMaterial`, which fades the mesh out into the z-direction. The `XCurvedPointer` enables the controller to interact. By providing the `points` array to the `XCurvedPointer`, the ray is defined as a line starting from `(0,0,0)` and ending at `(0,0,-0.1)`.

Lastly, we bind the `selectstart` and `selectend` events from the input source to the `press` and `release` events of the `XCurvedPointer`.

[CodeSandbox](https://codesandbox.io/s/natuerlich-short-pointer-controller-xv43wn?file=/src/app.tsx)

![Screenshot]()

```tsx
const rayMaterial = new RayBasicMaterial({
  transparent: true,
  toneMapped: false
});

const points = [new Vector3(0, 0, 0), new Vector3(0, 0, -0.1)];

export function ShortPointerController({
  inputSource,
  id
}: {
  inputSource: XRInputSource;
  id: number;
}) {
  const pointerRef = useRef<InputDeviceFunctions>(null);

  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => pointerRef.current?.press(0, e),
    []
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => pointerRef.current?.release(0, e),
    []
  );

  return (
    <>
      {inputSource.gripSpace != null && (
        <SpaceGroup space={inputSource.gripSpace}>
          <Suspense fallback={null}>
            <DynamicControllerModel inputSource={inputSource} />
          </Suspense>
        </SpaceGroup>
      )}
      <SpaceGroup space={inputSource.targetRaySpace}>
        <XCurvedPointer points={points} ref={pointerRef} id={id} />
        <mesh
          scale-x={0.005}
          scale-y={0.005}
          scale-z={0.1} //10cm
          position-z={-0.05}
          material={rayMaterial}
        >
          <boxGeometry />
        </mesh>
      </SpaceGroup>
    </>
  );
}
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)
