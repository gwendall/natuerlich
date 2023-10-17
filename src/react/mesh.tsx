/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { ReactNode, useEffect, useImperativeHandle, useRef, useState } from "react";
import { forwardRef } from "react";
import { Box3, BufferAttribute, BufferGeometry, Mesh, Vector3 } from "three";
import { OnFrameCallback, SpaceGroup } from "./space.js";
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

function updateGeometry(
  geometry: BufferGeometry | undefined,
  lastUpdateRef: { current?: number },
  mesh: XRMesh,
): BufferGeometry | undefined {
  if (lastUpdateRef.current != null && lastUpdateRef.current >= mesh.lastChangedTime) {
    return geometry;
  }
  geometry?.dispose();
  geometry = new BufferGeometry();
  geometry.setIndex(new BufferAttribute(mesh.indices, 1));
  geometry.setAttribute("position", new BufferAttribute(mesh.vertices, 3));
  lastUpdateRef.current = mesh.lastChangedTime;
  return geometry;
}

/**
 * component for rendering a tracked webxr mesh and placing content (children) at the tracked mesh position
 */
export const TrackedMesh = forwardRef<
  Mesh,
  { mesh: ExtendedXRMesh; children?: ReactNode; onFrame?: OnFrameCallback }
>(({ mesh, children, onFrame }, ref) => {
  return (
    <SpaceGroup
      space={mesh.meshSpace}
      initialPose={mesh.initialPose}
      as={Mesh}
      onFrame={onFrame}
      ref={ref}
    >
      <TrackedMeshGeometry mesh={mesh} />
      {children}
    </SpaceGroup>
  );
});

const vectorHelper = new Vector3();

/**
 * computes the local bounding box of the mesh and writes it into @param target
 */
export function measureXRMesh(mesh: XRMesh, target: Box3): Box3 {
  const length = mesh.vertices.length;
  target.makeEmpty();
  for (let i = 0; i < length; i += 3) {
    vectorHelper.fromArray(mesh.vertices, i);
    target.expandByPoint(vectorHelper);
  }
  return target;
}

/**
 * component for rendering the geometry of a tracked webxr mesh
 * Should be used together with a SpaceGroup
 */
export const TrackedMeshGeometry = forwardRef<BufferGeometry, { mesh: ExtendedXRMesh }>(
  ({ mesh }, ref) => {
    const lastUpdateRef = useRef<number | undefined>(undefined);
    const [geometry, setGeometry] = useState<BufferGeometry | undefined>(
      updateGeometry(undefined, lastUpdateRef, mesh),
    );
    useFrame(() => setGeometry((geometry) => updateGeometry(geometry, lastUpdateRef, mesh)));
    useEffect(() => geometry?.dispose(), []);
    useImperativeHandle(ref, () => geometry!, []);
    return geometry != null ? <primitive object={geometry} /> : null;
  },
);
