/* eslint-disable react/display-name */
import { useFrame } from "@react-three/fiber";
import React, { ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { forwardRef } from "react";
import { Box2, Box3, BufferGeometry, Mesh, Shape, ShapeGeometry, Vector2, Vector3 } from "three";
import { OnFrameCallback, SpaceGroup } from "./space.js";
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
export function useTrackedPlanes(): ReadonlyArray<ExtendedXRPlane> | undefined {
  return useXR((state) => state.trackedPlanes);
}

/**
 * @returns the planes tracked by webxr with the specified @param semanticLabel
 */
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
): ReadonlyArray<ExtendedXRPlane> | undefined {
  return useXR(
    (state) => state.trackedPlanes?.filter((plane) => plane.semanticLabel === semanticLabel),
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
  shape.setFromPoints(points);
  const geometry = new ShapeGeometry(shape);
  geometry.scale(sizeHelper.x, sizeHelper.y, 1);
  geometry.translate(boxHelper.min.x, boxHelper.min.y, 0);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function updateGeometry(
  geometry: BufferGeometry | undefined,
  lastUpdateRef: { current?: number },
  plane: XRPlane,
): BufferGeometry {
  if (
    geometry != null &&
    lastUpdateRef.current != null &&
    lastUpdateRef.current >= plane.lastChangedTime
  ) {
    return geometry;
  }
  lastUpdateRef.current = plane.lastChangedTime;
  return createGeometryFromPolygon(plane.polygon);
}

/**
 * component for positioning content (children) at the position of a tracked webxr plane
 */
export const TrackedPlane = forwardRef<
  Mesh,
  { plane: ExtendedXRPlane; children?: ReactNode; onFrame?: OnFrameCallback }
>(({ plane, children, onFrame }, ref) => {
  return (
    <SpaceGroup
      space={plane.planeSpace}
      initialPose={plane.initialPose}
      onFrame={onFrame}
      as={Mesh}
      ref={ref}
    >
      <TrackedPlaneGeometry plane={plane} />
      {children}
    </SpaceGroup>
  );
});

const vectorHelper = new Vector3();

/**
 * computes the local bounding box of the plane and writes it into @param target
 */
export function measureXRPlane(plane: XRPlane, target: Box3): Box3 {
  target.makeEmpty();
  for (const { x, y, z } of plane.polygon) {
    target.expandByPoint(vectorHelper.set(x, y, z));
  }
  return target;
}

/**
 * @returns the geometry for a webxr plane
 * @param disposeBuffer specifies whether the buffers should be automatically cleaned up (default: true)
 */
export function useTrackedPlaneGeometry(plane: XRPlane, disposeBuffer = true): BufferGeometry {
  const lastUpdateRef = useRef<number | undefined>(undefined);
  const [geometry, setGeometry] = useState<BufferGeometry>(
    updateGeometry(undefined, lastUpdateRef, plane),
  );
  useFrame(() => setGeometry((geometry) => updateGeometry(geometry, lastUpdateRef, plane)));
  useEffect(() => {
    if (!disposeBuffer) {
      return;
    }
    return () => geometry?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);
  return geometry;
}

/**
 * component for rendering the geometry of a tracked webxr plane
 * Should be used together with a SpaceGroup
 */
export const TrackedPlaneGeometry = forwardRef<BufferGeometry, { plane: XRPlane }>(
  ({ plane }, ref) => {
    const geometry = useTrackedPlaneGeometry(plane);
    useImperativeHandle(ref, () => geometry, [geometry]);
    return <primitive object={geometry} />;
  },
);
