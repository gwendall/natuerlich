# All Hooks Documentation

## `useSessionSupported`

This hook is used to determine if a xr mode is supported. The hook takes the xr mode (e.g. `immersive-ar`) to request support for as its only parameter and whether the passed xr mode is supported. 
The hook returns undefined while the request for the mode is not yet resolved.

## `useFocusState`

This hook is used to retrieve the current focus state. The hook returns the focus state if the user is currently in an xr session and `undefined` if no session is present. The focus state can be `visible`, `visible-blurred`, and `hidden`. For example, in the meta quest operating system, the focus state is `visible-blurred` when the user interacts with the operating system while the session is still in the background.

## `useAnchor`

This hook is used to create and store anchors. It operates similar to the `useState` React hook. The hook returns a tuple where the first item is the anchor (of type `XRAnchor`) and the second item is a function that can be used to create a new anchor. The function to create a new anchor takes in two arguments: `worldPosition` and `worldRotation`, which are of the `Vector3` and `Quaternion` types respectively. 

## `usePersistedAnchor`

This hook is used to create and store anchors that are also persisted in local storage. The hook requires a `key` of type `string` which is used to store and load the anchor ID. Similar to the `useAnchor` hook, it also returns a tuple with the first item being the anchor and the second item being a function that can be used to create a new anchor.

## `useSessionChange`

This hook is used to handle session changes. It requires a callback function `onSessionChange` that gets executed when the session changes. This function should have two parameters, the current session and the previous session, both of type `XRSession`. Additionally, you need to provide a list of dependencies (`deps`), which if changed, trigger the `onSessionChange` callback.

## `useInputSourceChange`

This hook gets triggered when the input sources change. It takes a callback function `onXRInputSourcesChange` that gets executed when the change happens. The function has a parameter `e` of type `XRInputSourceChangeEvent`. Similar to `useSessionChange`, you also need to provide a list of dependencies (`deps`), which if changed, trigger the `onXRInputSourcesChange` callback.

## `useInputSourceEvent`

This hook can be used to attach event listeners to input sources. It accepts the name of the event (either "select", "selectstart", "selectend", "squeeze", "squeezestart", or "squeezeend"), the input source (`inputSource` of type `XRInputSource`), a callback function `callback` that gets called when the event is triggered, and a list of dependencies (`deps`) that cause the callback to change.

## `useInputSources`

This hook returns an array of currently active input sources of type `XRInputSource`.

## `useInitRoomCapture`

This hook returns a function that triggers room setup for WebXR tracked planes.

## `useTrackedPlanes`

This hook returns a readonly array of currently tracked planes by WebXR (`XRPlane`).

## `useHandPoses`

This hook requires a hand (`hand` of type `XRHand`), handedness (`handedness` of type `XRHandedness`), a callback function `onPose`, a pose URL map (`poseUrlMap`), and an optional base URL (`baseUrl`). The `onPose` function is called every frame with the current and previously detected poses and the offset to other poses of the current pose. It returns a function to download the current hand pose (left and right).

## `useApplySpace`

This hook is used to apply the transformation of a space onto an object. It requires a reference to the object (`ref`), the space (`space`), and an optional callback function `onFrame` that gets executed every frame with the object to retrieve its worldMatrix.

## `useXR`

This hook subscribes to the current XR state. It allows to retrieve the current state via `useXR.getState()`. It returns either the current XR session's state or a default state.

## `useEnterXR`

This hook requires a mode (`mode` either inline, immersive-vr, or immersive-ar), and optional session initialization options `options`. It returns a function to enter the described WebXR session.

## `useSessionGrant`

This hook enters the described WebXR session when the user navigated to the current site while in a WebXR session. It requires optional session initialization options `options`.

## `useLayer`

This hook is used to create and manage layers. It requires a function `createLayer` to create the layer via WebXR, a boolean `transparent` indicating if the layer should be transparent, and an index number `index` indicating the order of the layer in relation to all other layers. It returns the created layer.

## `useLayerUpdate`

This hook updates the contents and transformation of a layer. It requires a reference to the object that is bound to the layer (`ref`), the layer to update (`layer`), an optional texture to update the layer with (`texture`), a boolean indicating whether the layer is transparent (`transparent`), width and height of the layer, a function to update the WebXR layer based on a scale (`updateLayerSize`), and an optional function to update the layer content for dynamic content (`updateTarget`). It returns either the passed texture or a texture from the render target for dynamic content.

## `useNativeFramebufferScaling`

This hook provides the native frame buffer scaling. It returns a number indicating the native frame buffer scaling, or `undefined` if it can't be determined. The frame buffer scaling can be provided either to the `XRCanvas` or manually to the underyling `XR` component to configure the frame buffer scaling of the session.

## `useAvailableFrameRates`

This hook provides an array of possible frame rates. It returns a `Float32Array` instance representing the available frame rates, or `undefined` if they can't be determined. One frame rate from the available frame rates can be provided either to the `XRCanvas` or manually to the underyling `XR` component to configure the frame rate of the session.

## `useHeighestAvailableFrameRate`

This hook provides the highest available frame rate. It returns a number indicating the highest available frame rate, or `undefined` if it can't be determined. The heighest frame rate can be provided either to the `XRCanvas` or manually to the underyling `XR` component to set the frame rate of the session to the heighest possible frame rate.