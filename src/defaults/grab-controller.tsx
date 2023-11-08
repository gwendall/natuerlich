import { XIntersection } from "@coconut-xr/xinteraction";
import { InputDeviceFunctions, XSphereCollider } from "@coconut-xr/xinteraction/react";
import React, { useRef, useMemo, Suspense, ReactNode } from "react";
import { ColorRepresentation, Mesh, Event, PositionalAudio as PositionalAudioImpl } from "three";
import { DynamicControllerModel } from "../react/controller.js";
import { FocusStateGuard, useInputSourceEvent } from "../react/index.js";
import { SpaceGroup } from "../react/space.js";
import {
  CursorBasicMaterial,
  updateCursorTransformation,
  updateColor,
  updateCursorDistanceOpacity,
  triggerVibration,
  PositionalAudio,
} from "./index.js";
import { ThreeEvent, createPortal, useThree } from "@react-three/fiber";

/**
 * controller for grabbing objects when the squeeze button is pressed
 * includes hover effects
 */
export function GrabController({
  inputSource,
  children,
  filterIntersections,
  id,
  cursorColor = "black",
  cursorOpacity = 0.5,
  cursorPressColor = "white",
  cursorSize = 0.1,
  cursorVisible = true,
  radius = 0.07,
  cursorOffset = 0.01,
  pressSoundUrl = "https://coconut-xr.github.io/xsounds/plop.mp3",
  pressSoundVolume = 0.3,
  ...rest
}: {
  inputSource: XRInputSource;
  children?: ReactNode;
  id: number;
  filterIntersections?: (intersections: Array<XIntersection>) => Array<XIntersection>;
  cursorColor?: ColorRepresentation;
  cursorPressColor?: ColorRepresentation;
  cursorOpacity?: number;
  cursorSize?: number;
  cursorVisible?: boolean;
  radius?: number;
  cursorOffset?: number;
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
  const prevIntersected = useRef(false);

  useInputSourceEvent(
    "squeezestart",
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
    "squeezeend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updateColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      colliderRef.current?.release(0, e);
    },
    [],
  );

  const cursorRef = useRef<Mesh>(null);
  const cursorMaterial = useMemo(
    () => new CursorBasicMaterial({ transparent: true, toneMapped: false }),
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

  if (inputSource.gripSpace == null) {
    return null;
  }

  return (
    <FocusStateGuard>
      <SpaceGroup space={inputSource.gripSpace}>
        <XSphereCollider
          id={id}
          filterIntersections={filterIntersections}
          onIntersections={(intersections) => {
            updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
            triggerVibration(intersections, inputSource, prevIntersected);
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
          ref={colliderRef}
          radius={radius}
          {...rest}
        />
        {children}
        <Suspense fallback={null}>
          <DynamicControllerModel inputSource={inputSource} />
        </Suspense>
      </SpaceGroup>

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
