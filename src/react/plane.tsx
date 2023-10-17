/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { ReactNode, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { forwardRef } from "react";
import { Box2, BufferGeometry, Mesh, Shape, ShapeGeometry, Vector2 } from "three";
import { OnFrameCallback, useApplySpace } from "./space.js";
import { ExtendedXRPlane, useXR } from "./state.js";
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
  const points = polygon.map(({ x, z }) => new Vector2(x, z));
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
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function updateGeometry(object: Mesh, lastUpdateRef: { current?: number }, plane: XRPlane): void {
  if (lastUpdateRef.current != null && lastUpdateRef.current >= plane.lastChangedTime) {
    return;
  }
  object.geometry.dispose();
  object.geometry = createGeometryFromPolygon(plane.polygon);
  lastUpdateRef.current = plane.lastChangedTime;
}

/**
 * component for positioning content (children) at the position of a tracked webxr plane
 */
export const TrackedPlane = forwardRef<
  Mesh,
  { plane: ExtendedXRPlane; children?: ReactNode; onFrame?: OnFrameCallback }
>(({ plane, children, onFrame }, ref) => {
  const lastUpdateRef = useRef<number | undefined>(undefined);
  const object = useMemo(() => {
    const m = new Mesh();
    m.matrixAutoUpdate = false;
    return m;
  }, []);
  updateGeometry(object, lastUpdateRef, plane);
  useFrame(() => updateGeometry(object, lastUpdateRef, plane));
  useEffect(() => object.geometry.dispose(), []);
  useImperativeHandle(ref, () => object, []);
  useApplySpace(object, plane.planeSpace, plane.initialPose, onFrame);
  return <primitive object={object}>{children}</primitive>;
});
