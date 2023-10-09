/* eslint-disable react/display-name */
import { MeshProps, useFrame } from "@react-three/fiber";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import { forwardRef } from "react";
import { BufferAttribute, BufferGeometry, Mesh } from "three";
import { useApplySpace } from "./space.js";
import { useXR } from "./state.js";
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

/**
 * component for rendering a tracked webxr mesh and placing content (children) at the tracked mesh position
 */
export const TrackedMesh = forwardRef<Mesh, { mesh: XRMesh } & MeshProps>(
  ({ mesh, children, ...props }, ref) => {
    const lastUpdateRef = useRef<number | undefined>(undefined);
    const internalRef = useRef<Mesh>(null);
    useFrame(() => {
      if (internalRef.current == null) {
        return;
      }
      if (lastUpdateRef.current == null || lastUpdateRef.current < mesh.lastChangedTime) {
        internalRef.current.geometry.dispose();
        const geometry = new BufferGeometry();
        geometry.setIndex(new BufferAttribute(mesh.indices, 1));
        geometry.setAttribute("position", new BufferAttribute(mesh.vertices, 3));
        internalRef.current.geometry = geometry;
        lastUpdateRef.current = mesh.lastChangedTime;
      }
    });
    useEffect(() => internalRef.current?.geometry.dispose(), []);
    useImperativeHandle(ref, () => internalRef.current!, []);
    useApplySpace(internalRef, mesh.meshSpace);
    return (
      <mesh {...props} matrixAutoUpdate={false} ref={internalRef}>
        {children}
      </mesh>
    );
  },
);
