import { XIntersection } from "@coconut-xr/xinteraction";
import { XSphereCollider } from "@coconut-xr/xinteraction/react";
import React, { ReactNode, Suspense, useMemo, useRef } from "react";
import { DynamicHandModel, HandBoneGroup } from "../react/hand.js";
import { ThreeEvent, createPortal, useThree } from "@react-three/fiber";
import {
  Color,
  ColorRepresentation,
  Mesh,
  Event,
  PositionalAudio as PositionalAudioImpl,
} from "three";
import {
  CursorBasicMaterial,
  updateCursorDistanceOpacity,
  updateCursorTransformation,
  PositionalAudio,
} from "./index.js";
import { FocusStateGuard } from "../react/index.js";

/**
 * hand for touch objects based on their distance to the index finger
 * includes a cursor visualization that gets more visible based on the distance
 */
export function TouchHand({
  hand,
  inputSource,
  id,
  children,
  filterIntersections,
  cursorSize = 0.1,
  cursorVisible = true,
  hoverRadius = 0.1,
  pressRadius = 0.03,
  cursorColor = "black",
  cursorPressColor = "white",
  cursorOpacity = 0.5,
  cursorOffset = 0.01,
  childrenAtJoint = "wrist",
  pressSoundUrl = "https://coconut-xr.github.io/xsounds/plop.mp3",
  pressSoundVolume = 0.3,
  ...rest
}: {
  hand: XRHand;
  inputSource: XRInputSource;
  children?: ReactNode;
  id: number;
  filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
  hoverRadius?: number;
  pressRadius?: number;
  cursorColor?: ColorRepresentation;
  cursorPressColor?: ColorRepresentation;
  cursorOpacity?: number;
  cursorSize?: number;
  cursorVisible?: boolean;
  cursorOffset?: number;
  childrenAtJoint?: XRHandJoint;
  onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  pressSoundUrl?: string;
  pressSoundVolume?: number;
}) {
  const sound = useRef<PositionalAudioImpl>(null);

  const scene = useThree(({ scene }) => scene);

  const distanceRef = useRef(Infinity);
  const wasPressedRef = useRef(false);

  const cursorRef = useRef<Mesh>(null);
  const cursorMaterial = useMemo(
    () => new CursorBasicMaterial({ transparent: true, toneMapped: false }),
    [],
  );
  wasPressedRef.current = updateCursorAppearance(
    distanceRef.current,
    cursorMaterial,
    cursorColor,
    cursorPressColor,
    cursorOpacity,
    wasPressedRef.current,
    () => sound.current?.play(),
    hoverRadius,
    pressRadius,
  );

  return (
    <FocusStateGuard>
      <Suspense>
        <DynamicHandModel hand={hand} handedness={inputSource.handedness}>
          <HandBoneGroup joint={"index-finger-tip"}>
            <XSphereCollider
              radius={hoverRadius}
              distanceElement={{ id: 0, downRadius: pressRadius }}
              id={id}
              filterIntersections={filterIntersections}
              onIntersections={(intersections) => {
                updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
                if (intersections.length === 0) {
                  return;
                }
                distanceRef.current = intersections[0].distance;
                wasPressedRef.current = updateCursorAppearance(
                  distanceRef.current,
                  cursorMaterial,
                  cursorColor,
                  cursorPressColor,
                  cursorOpacity,
                  wasPressedRef.current,
                  () => sound.current?.play(),
                  hoverRadius,
                  pressRadius,
                );
              }}
              {...rest}
            />
          </HandBoneGroup>
          {children != null && <HandBoneGroup joint={childrenAtJoint}>{children}</HandBoneGroup>}
        </DynamicHandModel>
      </Suspense>
      {createPortal(
        <mesh
          renderOrder={inputSource.handedness === "left" ? 1 : 2}
          visible={cursorVisible}
          scale={cursorSize}
          ref={cursorRef}
          material={cursorMaterial}
        >
          <Suspense>
            <PositionalAudio url={pressSoundUrl} volume={pressSoundVolume} ref={sound} />
          </Suspense>
          <planeGeometry />
        </mesh>,
        scene,
      )}
    </FocusStateGuard>
  );
}

function updateCursorAppearance(
  distance: number,
  material: { color: Color; opacity: number },
  cursorColor: ColorRepresentation,
  cursorPressColor: ColorRepresentation,
  cursorOpacity: number,
  wasPressed: boolean,
  onPress: () => void,
  hoverRadius: number,
  pressRadius?: number,
): boolean {
  if (pressRadius != null && distance < pressRadius) {
    material.color.set(cursorPressColor);
    material.opacity = cursorOpacity;
    if (!wasPressed) {
      onPress();
    }
    return true;
  }
  updateCursorDistanceOpacity(material, distance, pressRadius ?? 0, hoverRadius, cursorOpacity);
  material.color.set(cursorColor);
  return false;
}
