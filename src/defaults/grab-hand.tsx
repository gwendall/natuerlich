import { XIntersection } from "@coconut-xr/xinteraction";
import { InputDeviceFunctions, XSphereCollider } from "@coconut-xr/xinteraction/react";
import React, { ReactNode, Suspense, useMemo, useRef } from "react";
import { DynamicHandModel, HandBoneGroup } from "../react/hand.js";
import { useInputSourceEvent } from "../react/listeners.js";
import { ColorRepresentation, Event, Mesh, PositionalAudio as PositionalAudioImpl } from "three";
import {
  CursorBasicMaterial,
  updateColor,
  updateCursorDistanceOpacity,
  updateCursorTransformation,
  PositionalAudio,
} from "./index.js";
import { ThreeEvent, createPortal, useThree } from "@react-three/fiber";
import { FocusStateGuard } from "../react/index.js";

/**
 * hand for grabbing objects when the pinch gesture is detected
 * includes hover effects
 */
export function GrabHand({
  hand,
  inputSource,
  id,
  children,
  filterIntersections,
  cursorColor = "black",
  cursorOpacity = 0.5,
  cursorPressColor = "white",
  cursorSize = 0.1,
  cursorVisible = true,
  radius = 0.07,
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
  cursorColor?: ColorRepresentation;
  cursorPressColor?: ColorRepresentation;
  cursorOpacity?: number;
  cursorSize?: number;
  cursorVisible?: boolean;
  radius?: number;
  cursorOffset?: number;
  childrenAtJoint?: XRHandJoint;
  onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  pressSoundUrl?: string;
  pressSoundVolume?: number;
}) {
  const sound = useRef<PositionalAudioImpl>(null);

  const colliderRef = useRef<InputDeviceFunctions>(null);
  const distanceRef = useRef(Infinity);
  const pressedRef = useRef(false);
  const cursorRef = useRef<Mesh>(null);
  const cursorMaterial = useMemo(
    () => new CursorBasicMaterial({ transparent: true, toneMapped: false }),
    [],
  );

  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      if (cursorRef.current?.visible && sound.current != null) {
        sound.current.play();
      }
      pressedRef.current = true;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.press(0, e);
    },
    [],
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.release(0, e);
    },
    [],
  );

  updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
  updateCursorDistanceOpacity(
    cursorMaterial,
    distanceRef.current,
    radius / 2,
    radius,
    cursorOpacity,
  );

  const scene = useThree(({ scene }) => scene);

  return (
    <FocusStateGuard>
      <Suspense fallback={null}>
        <DynamicHandModel hand={hand} handedness={inputSource.handedness}>
          <HandBoneGroup rotationJoint="wrist" joint={["thumb-tip", "index-finger-tip"]}>
            <XSphereCollider
              ref={colliderRef}
              radius={radius}
              id={id}
              filterIntersections={filterIntersections}
              onIntersections={(intersections) => {
                updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
                if (intersections.length === 0) {
                  return;
                }
                distanceRef.current = intersections[0].distance;
                updateCursorDistanceOpacity(
                  cursorMaterial,
                  distanceRef.current,
                  radius / 2,
                  radius,
                  cursorOpacity,
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
