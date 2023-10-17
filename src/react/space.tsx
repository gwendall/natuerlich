/* eslint-disable react/display-name */
import { RootState, useFrame } from "@react-three/fiber";
import React, { forwardRef, ReactNode, RefObject, useRef } from "react";
import { useImperativeHandle } from "react";
import { Group, Object3D } from "three";

/**
 * hook to apply the transformation of a space onto an object
 * requires matrixAutoUpdate=false on the object
 * @param ref a reference to the object
 * @param space
 * @param onFrame callback executed every frame with the object to retrieve its worldMatrix f.e.
 */
export function useApplySpace(
  ref: RefObject<Object3D> | Object3D,
  space: XRSpace,
  onFrame?: (
    rootState: RootState,
    delta: number,
    frame: XRFrame | undefined,
    object: Object3D,
  ) => void,
): void {
  useFrame((rootState, delta, frame: XRFrame | undefined) => {
    const group = ref instanceof Object3D ? ref : ref.current;
    if (group == null) {
      return;
    }
    applySpace(rootState, frame, group, space);
    if (onFrame != null) {
      group.updateMatrixWorld();
      onFrame(rootState, delta, frame, group);
    }
  });
}

export function applySpace(
  state: RootState,
  frame: XRFrame | undefined,
  object: Object3D,
  space: XRSpace,
): void {
  const referenceSpace = state.gl.xr.getReferenceSpace();
  if (referenceSpace == null || frame == null) {
    object.visible = false;
    return;
  }
  const pose = frame.getPose(space, referenceSpace);
  if (pose == null) {
    object.visible = false;
    return;
  }
  object.visible = true;
  object.matrix.fromArray(pose.transform.matrix);
}

/**
 * component for positioning content (children) at the position of a tracked webxr space
 * the onFrame property allows to retrieve the object and its current matrixWorld transformation for every frame
 */
export const SpaceGroup = forwardRef<
  Group,
  {
    space: XRSpace;
    children?: ReactNode;
    onFrame?: (
      rootState: RootState,
      delta: number,
      frame: XRFrame | undefined,
      object: Object3D,
    ) => void;
  }
>(({ space, children, onFrame }, ref) => {
  const internalRef = useRef<Group>(null);
  useImperativeHandle(ref, () => internalRef.current!, []);
  useApplySpace(internalRef, space, onFrame);
  return (
    <group matrixAutoUpdate={false} ref={internalRef}>
      {children}
    </group>
  );
});
