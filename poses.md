## Poses

**Acknowledgement**: Our implementation is based on [handy-work](https://github.com/AdaRoseCannon/handy-work)

For detecting hand poses, **natuerlich** offers the `useHandPoses` hook. The hook takes the `inputSource.hand`, the `inputSource.handedness`, and a callback called every frame with the current and previous detected pose. The callback is followed by the poses that the algorithm should detect. The parameter maps the URL where the pose information can be found to its name. The last parameter of the hook is optional and contains the `baseUrl` for the URLs of the poses.

**natuerlich** provides the default poses `fist, flat, horns, l, peace, point, relax, shaka, and thumb`.

The `useHandPoses` hook returns a function that allows downloading the current hand pose to a binary file. This file can then be used to match the recorded pose. New poses can be captured using your own implementation or directly inside the [coconut-xr/pose-booth](https://github.com/coconut-xr/pose-booth).

The following code illustrates how to use the `useHandPoses` hook. The example displays the currently and previously detected pose on a Koestlich UI.

An example of using the `useHandPoses` hook inside a hand to detect a fist gesture and trigger a grab interaction in the scene can be found in the [Custom Input](./custom-input-sources.md) documentation.

#### Important:

The downloaded pose corresponds to the `inputSource.hand` pose. Calling `downloadPose` on both hands records one pose for each hand. The recording of a pose is unrelated to the right or left hand. A pose recorded on the left-hand works on the right hand and vice versa.

[CodeSandbox]()

![Screenshot]()

```tsx
const downloadPose = useHandPoses(
  inputSource.hand,
  inputSource.handedness,
  (name, prevName) => {
  },
  {
    fist: "fist.handpose",
    relax: "relax.handpose",
    point: "point.handpose",
  },
);
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