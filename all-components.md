# All Components Documentation

## XRCanvas

The `XRCanvas` is a fundamental component for setting up a WebXR scene. It accepts a series of properties:

- `foveation`: Controls the degree of foveation (detail adjustment based on user focus) in the scene.
- `frameRate`: Sets the refresh rate for the scene rendering.
- `referenceSpace`: Specifies the coordinate system used for tracking spatial relationships.
- `frameBufferScaling`: Adjusts the scale of the frame buffer.
- `filterClipped`: Function that filters out clipped intersections.
- `filterIntersections`: Function that filters out intersecting objects in the scene.
- `onClickMissed`: Callback function triggered when a click event misses any object.
- `onIntersections`: Callback function that is triggered when intersections are detected.
- `onPointerDownMissed` and `onPointerUpMissed`: Callback functions triggered when pointer down and pointer up events respectively miss any object.
- `dragDistance`: Determines the drag threshold distance.

## Controllers

The `Controllers` component manages the default controllers of either "pointer", "grab", or "teleport" types. This component accepts the following properties:

- `type`: Sets the controller type (default is "pointer").
- `onTeleport`: Callback function that is triggered upon teleporting to a point.
- `filterIntersections`: Function that filters intersecting objects.
- `cursorColor` and `cursorPressColor`: Determines the color representation of the cursor in its normal and pressed states respectively.
- `cursorOpacity`: Sets the opacity level of the cursor.
- `cursorSize`: Specifies the size of the cursor.
- `cursorVisible`: Toggles the visibility of the cursor.
- `rayColor` and `rayPressColor`: Sets the color representation of the ray in its normal and pressed states respectively.
- `raySize`: Specifies the size of the ray.
- `onPointerDownMissed`, `onPointerUpMissed`, and `onClickMissed`: Callback functions that are triggered when pointer down, pointer up, and click events miss any object.

## Hands

The `Hands` component handles the default hand types, which could be either "pointer", "grab", "teleport", or "touch". It shares the same properties as the `Controllers` component.

## GrabController and GrabHand

The `GrabController` and `GrabHand` components control the action of grabbing objects when the squeeze button is pressed or a pinch gesture is detected, respectively. They include hover effects and share the same properties as the `Controllers` component, with the addition of `radius` and `cursorOffset`.

## PointerController and PointerHand

The `PointerController` and `PointerHand` components manage the action of pointing at objects when the select button is pressed or a pinch gesture is detected, respectively. They include cursor and ray visualization, and they share the same properties as the `Controllers` component, with the addition of `rayMaxLength`, `rayVisible`, and `cursorOffset`.

## TeleportTarget

The `TeleportTarget` component marks its child elements as teleportable. It only requires child elements as its property.

## TeleportHand and TeleportController

The `TeleportHand` and `TeleportController` components are used for pointing to teleportable objects and are activated when the pinch gesture is detected. They include a cursor and a downward-bending ray visualization, and share some properties with the `Controllers` component, specifically `rayColor`, `raySize`, `rayOpacity`, `cursorColor`, `cursorSize`, `cursorOpacity`, and `onTeleport`.

## TouchHand

The `TouchHand` component is for touching objects based on their distance to the index finger. It includes a cursor visualization that becomes more visible based on the distance, and shares properties with the `Controllers` component, with the addition of `hoverRadius`, `pressRadius`, `cursorOffset`, and `childrenAtJoint`.

### Grabbable

The `Grabbable` component is a wrapper that allows its children objects to be interactively grabbed by an input source such as hands, controllers, mice, or touch input. The objects within the Grabbable component become interactively movable in the 3D scene.

### KoestlichQuadLayer

`KoestlichQuadLayer` merges WebXR layers with a Koestlich root container. It accepts the following optional properties:

- `far`: Maximum rendering distance.
- `near`: Minimum rendering distance.
- `contentScale`: Affects the scale of the content.
- `precision`: Specifies the decimal precision.

### FacingCameraGuard

`FacingCameraGuard` acts as a conditional render guard, only including content in the scene based on whether the camera is facing a specific direction within a provided angle. The `direction` is mandatory, while the `angle` is optional and defaults to PI/2.

### VisibilityFacingCameraGuard

`VisibilityFacingCameraGuard` is similar to the `FacingCameraGuard` but changes the visibility of the content based on whether the camera is facing a specific direction within a provided angle, rather than including or excluding it from the scene.

### SessionModeGuard

`SessionModeGuard` conditionally renders content based on allowed or denied WebXR session modes. It accepts `allow` and `deny` parameters that can be a single `ExtendedXRSessionMode` or an array of them.

### VisibilitySessionModeGuard

`VisibilitySessionModeGuard` works similar to `SessionModeGuard`, but rather than controlling the inclusion of content, it controls its visibility based on allowed or denied WebXR session modes.

### SessionSupportedGuard

`SessionSupportedGuard` conditionally renders content based on the support of a WebXR session mode. It accepts the `mode` parameter which specifies the WebXR session mode for which support should be requested.


### VisibilitySessionSupportedGuard

`VisibilitySessionSupportedGuard` works similar to `SessionSupportedGuard`, but rather than controlling the inclusion of content, it controls its visibility based on the support of the provided WebXR session mode.

### CylinderLayer

`CylinderLayer` is a component that forms a partial cylinder for content rendering. The size of the content must be provided initially and should not be changed frequently due to performance considerations. It accepts many properties such as `texture`, `radius`, `centralAngle`, `pixelWidth`, `pixelHeight`, and others. Each property is well-documented within the component code.

### CylinderLayerPortal

`CylinderLayerPortal` is a cylindrical layer that renders its content with the best possible resolution. It requires the "anchor" feature flag. This component also accepts a `dragDistance` parameter that allows for interaction with the layer.

### QuadLayer

`QuadLayer` represents a 1x1 plane layer that renders its content with the best possible resolution. As with `CylinderLayer`, the size of the content must be specified at initialization and should not be frequently changed.

### QuadLayerPortal

`QuadLayerPortal` is similar to `QuadLayer`, but it requires the "anchor" feature flag. This component also accepts a `dragDistance` property that enables interaction with the layer.

### Background

`Background` is a simple component that sets a background color in a scene. The color should be provided in a form that is compatible with three.js's `ColorRepresentation`.

### NonImmersiveCamera & ImmersiveSessionOrigin

`NonImmersiveCamera` and `ImmersiveSessionOrigin` are components used to position and rotate the camera based on the immersion mode of the scene.

### DynamicControllerModel & StaticControllerModel

`DynamicControllerModel` and `StaticControllerModel` are used to render the detected controller model. The `DynamicControllerModel` additionally animates pressed buttons and other input elements.

### DynamicHandModel & HandBoneGroup

`DynamicHandModel` is used for rendering a hand model that is animated based on the hand's joints data. `HandBoneGroup` is a child component used for positioning content at a specific joint within the `DynamicHandModel`.

### TrackedImage

`TrackedImage` is a component that positions content at the location of a tracked WebXR image.

### XR

`XR` is a key component for adding WebXR support to a scene. It is automatically added when using the `XRCanvas`. If the `XRCanvas` is not used, the `XR` component should be placed inside the R3F `Canvas` component and only one XR component should be present in a scene. It accepts a few optional properties like `foveation`, `frameRate`, `referenceSpace`, and `frameBufferScaling`.

### TrackedPlane

`TrackedPlane` is a component for positioning content at the location of a tracked WebXR plane.

### SpaceGroup

`SpaceGroup` is a component for positioning content at the position of a tracked WebXR space. It also has an `onFrame` property that allows to retrieve the object and its current matrixWorld transformation for every frame.

Remember to consult the individual component APIs for more specific property and method details. This documentation is intended as a high-level overview and may not cover all possible use cases or configurations for each component.