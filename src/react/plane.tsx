/* eslint-disable react/display-name */
import { MeshProps, useFrame } from "@react-three/fiber";
import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { forwardRef } from "react";
import { Box2, BufferGeometry, Mesh, Shape, ShapeGeometry, Vector2 } from "three";
import { useApplySpace } from "./space.js";
import { useXR } from "./state.js";
import { shallow } from "zustand/shallow";

/**
 * @returns a function to trigger the room setup for webxr tracked planes
 */
export function useInitRoomCapture(): (() => Promise<undefined>) | undefined {
  const session = useXR(({ session }) => session);
  return useMemo(() => (session as any)?.initiateRoomCapture.bind(session), [session]);
}

/**
 * @returns the planes that are currently tracked by webxr
 */
export function useTrackedPlanes(): ReadonlyArray<XRPlane> | undefined {
  return useXR((state) => state.trackedPlanes);
}

export function useTrackedObjectPlanes(
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
): ReadonlyArray<XRPlane> | undefined {
  return useXR(
    (state) =>
      state.trackedPlanes?.filter(
        (plane: { semanticLabel?: string } & XRPlane) => plane.semanticLabel === semanticLabel,
      ),
    shallow,
  );
}

const boxHelper = new Box2();
const sizeHelper = new Vector2();

function createGeometryFromPolygon(polygon: DOMPointReadOnly[]): BufferGeometry {
  const shape = new Shape();
  const points = polygon.map(({ x, z }) => new Vector2(x, -z));
  //we measure the size and scale & unscale to have normalized UVs for the geometry
  boxHelper.setFromPoints(points);
  boxHelper.getSize(sizeHelper);
  for (const point of points) {
    point.sub(boxHelper.min);
    point.divide(sizeHelper);
  }
  console.log(points);
  shape.setFromPoints(points);
  const geometry = new ShapeGeometry(shape);
  geometry.scale(sizeHelper.x, sizeHelper.y, 1);
  geometry.translate(boxHelper.min.x, boxHelper.min.y, 0);
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/**
 * component for positioning content (children) at the position of a tracked webxr plane
 */
export const TrackedPlane = forwardRef<Mesh, { plane: XRPlane } & MeshProps>(
  ({ plane, children, ...props }, ref) => {
    const lastUpdateRef = useRef<number | undefined>(undefined);
    const internalRef = useRef<Mesh>(null);
    useFrame(() => {
      if (internalRef.current == null) {
        return;
      }
      if (lastUpdateRef.current == null || lastUpdateRef.current < plane.lastChangedTime) {
        internalRef.current.geometry.dispose();
        internalRef.current.geometry = createGeometryFromPolygon(plane.polygon);
        lastUpdateRef.current = plane.lastChangedTime;
      }
    });
    useEffect(() => internalRef.current?.geometry.dispose(), []);
    useImperativeHandle(ref, () => internalRef.current!, []);
    useApplySpace(internalRef, plane.planeSpace);
    return (
      <mesh {...props} matrixAutoUpdate={false} ref={internalRef}>
        {children}
      </mesh>
    );
  },
);
