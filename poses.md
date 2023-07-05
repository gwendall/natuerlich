## Poses

**Acknowledgement**: Our implementation is based on [handy-work](https://github.com/AdaRoseCannon/handy-work)

For detecting hand poses, **natuerlich** offers the `useHandPoses` hook. The hook takes the `inputSource.hand`, the `inputSource.handedness`, and a callback that is called every frame with the current and previous detected pose. The callback is followed by the poses that the algorithm should detect. The parameter maps the url where the pose information can be found, to its name. The last parameter of the hook is optional and contains the baseUrl for the urls of the poses.

The `useHandPoses` hook returns a function that allows to download the current hand pose to a binary file. This file can then be used to match the recorded pose.

The following code illustrates how to use the `useHandPoses` hook. 

A example for using the `useHandPoses` hook inside a hand to detect a fist gesture and trigger a grab interaction in the scene can be fund in the [Custom Input](./custom-input.md) documentation.

#### Important:

The downloaded pose corresponds to the pose of the `inputSource.hand`. Calling `downloadPose` on both hands, records one pose for each hand. The recording of a pose is unrelated to the right or left hand. A pose recorded on the left hand works on the right hand and vice versa.

```tsx
const downloadPose = useHandPoses(
  inputSource.hand,
  inputSource.handedness,
  (name, prevName) => {
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
  },
  {
    fist: "fist.handpose",
    relax: "relax.handpose",
    point: "point.handpose",
  },
);
```

---

If your questions were not yet answered, visit our [Discord](https://discord.gg/NCYM8ujndE) ;)