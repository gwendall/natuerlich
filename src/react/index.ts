import { useFrame, useStore, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useXR } from "./state.js";
import { shallow } from "zustand/shallow";

export * from "./use-enter-xr.js";
export * from "./use-session-grant.js";
export * from "./space.js";
export * from "./guards/index.js";
export * from "./listeners.js";
export * from "./controller.js";
export * from "./hand.js";
export * from "./state.js";
export * from "./anchor.js";
export * from "./session-origin.js";
export * from "./anchor.js";
export * from "./camera.js";
export * from "./layers/index.js";
export * from "./plane.js";
export * from "./image.js";
export * from "./background.js";
export * from "./pose.js";
export * from "./gamepad.js";

/**
 * hook to determine if a xr mode is supported
 * @param mode the xr mode to request for support
 * @returns undefined while requesting support and a boolean once the support state is clear
 */
export function useSessionSupported(mode: XRSessionMode): boolean | undefined {
  const [subscribe, getSnapshot] = useMemo(() => {
    let sessionSupported: boolean | undefined = undefined;
    return [
      (onChange: () => void) => {
        let canceled = false;
        if (navigator.xr == null) {
          sessionSupported = false;
          return () => {
            //nothing to do
          };
        }

        navigator.xr.isSessionSupported(mode).then((isSupported) => {
          sessionSupported = isSupported;
          if (canceled) {
            return;
          }
          onChange();
        });
        return () => {
          canceled = true;
        };
      },
      () => sessionSupported,
    ];
  }, [mode]);
  return useSyncExternalStore(subscribe, getSnapshot);
}

/**
 *
 * @returns the focus state of the xr session; returns undefined if not in a xr session
 */
export function useFocusState(): XRVisibilityState | undefined {
  return useXR((state) => state.visibilityState);
}

/**
 * @returns the native frame buffer scaling
 */
export function useNativeFramebufferScaling(): number | undefined {
  return useXR((state) =>
    state.session == null ? undefined : XRWebGLLayer.getNativeFramebufferScaleFactor(state.session),
  );
}

/**
 * @returns a array of possible frame rates
 */
export function useAvailableFrameRates(): Float32Array | undefined {
  return useXR(
    (state) => (state.session == null ? undefined : state.session.supportedFrameRates),
    shallow,
  );
}

/**
 * @returns the highest available framerate
 */
export function useHeighestAvailableFrameRate(): number | undefined {
  const framerates = useAvailableFrameRates();
  return useMemo(() => {
    if (framerates == null) {
      return;
    }
    return Math.max(...framerates);
  }, [framerates]);
}

export type XRProps = {
  foveation?: number;
  frameRate?: number;
  referenceSpace?: XRReferenceSpaceType;
  frameBufferScaling?: number;
};

/**
 * component for adding webxr support to a scene
 * must be positioned somewhere inside the canvas
 * only one XR component can be present in a scene
 */
export function XR({
  foveation = 0,
  frameRate,
  referenceSpace = "local-floor",
  frameBufferScaling,
}: XRProps) {
  const xrManager = useThree((state) => state.gl.xr);
  const store = useStore();

  useEffect(() => useXR.getState().setStore(store), [store]);

  useEffect(() => {
    xrManager.setFoveation(foveation);
  }, [xrManager, foveation]);

  useEffect(() => {
    if (frameRate == null) {
      return;
    }
    return useXR.subscribe((state, prevState) => {
      if (state.session === prevState.session || state.session == null) {
        return;
      }
      state.session.updateTargetFrameRate(frameRate).catch(console.error);
    });
  }, [frameRate]);

  useEffect(() => {
    if (frameBufferScaling == null) {
      return;
    }
    xrManager.setFramebufferScaleFactor(frameBufferScaling);
  }, [xrManager, frameBufferScaling]);

  useEffect(() => {
    xrManager.setReferenceSpaceType(referenceSpace);
  }, [xrManager, referenceSpace]);

  useFrame(useXR.getState().onFrame);

  return null;
}
