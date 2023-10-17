/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { ReactNode, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { forwardRef } from "react";
import { BufferAttribute, BufferGeometry, Mesh } from "three";
import { OnFrameCallback, useApplySpace } from "./space.js";
import { ExtendedXRMesh, useXR } from "./state.js";
import { shallow } from "zustand/shallow";

/**
 * @returns the meshes that are currently tracked by webxr
 */
export function useTrackedMeshes(): ReadonlyArray<XRMesh> | undefined {
  return useXR((state) => state.trackedMeshes);
}

export function useTrackedObjectMeshes(
  semanticLabel:
    | "desk"
    | "couch"
    | "floor"
    | "ceiling"
    | "wall"
    | "door"
    | "window"
    | "other"
    | string,
): ReadonlyArray<XRMesh> | undefined {
  return useXR(
    (state) => state.trackedMeshes?.filter((mesh) => mesh.semanticLabel === semanticLabel),
    shallow,
  );
}

function updateGeometry(object: Mesh, lastUpdateRef: { current?: number }, mesh: XRMesh): void {
  if (lastUpdateRef.current != null && lastUpdateRef.current >= mesh.lastChangedTime) {
    return;
  }
  object.geometry.dispose();
  const geometry = new BufferGeometry();
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  geometry.setAttribute("position", new BufferAttribute(mesh.vertices, 3));
  object.geometry = geometry;
  lastUpdateRef.current = mesh.lastChangedTime;
}

/**
 * component for rendering a tracked webxr mesh and placing content (children) at the tracked mesh position
 */
export const TrackedMesh = forwardRef<
  Mesh,
  { mesh: ExtendedXRMesh; children?: ReactNode; onFrame?: OnFrameCallback }
>(({ mesh, children, onFrame }, ref) => {
  const lastUpdateRef = useRef<number | undefined>(undefined);
  const object = useMemo(() => {
    const m = new Mesh();
    m.matrixAutoUpdate = false;
    return m;
  }, []);
  updateGeometry(object, lastUpdateRef, mesh);
  useFrame(() => updateGeometry(object, lastUpdateRef, mesh));
  useEffect(() => object.geometry.dispose(), []);
  useImperativeHandle(ref, () => object, []);
  useApplySpace(object, mesh.meshSpace, mesh.initialPose, onFrame);
  return <primitive object={object}>{children}</primitive>;
});
