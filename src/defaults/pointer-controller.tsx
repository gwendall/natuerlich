import { ReactNode, Suspense, useMemo, useRef } from "react";
import { InputDeviceFunctions, XStraightPointer } from "@coconut-xr/xinteraction/react";
import { useInputSourceEvent } from "../react/listeners.js";
import { XIntersection } from "@coconut-xr/xinteraction";
import React from "react";
import { SpaceGroup } from "../react/space.js";
import { DynamicControllerModel } from "../react/controller.js";
import {
  ColorRepresentation,
  Mesh,
  Event,
  Vector3,
  PositionalAudio as PositionalAudioImpl,
  Vector2,
} from "three";
import {
  CursorBasicMaterial,
  RayBasicMaterial,
  triggerVibration,
  updateColor as updatePointerColor,
  updateCursorTransformation,
  updateRayTransformation,
  PositionalAudio,
} from "./index.js";
import { ThreeEvent, createPortal, useFrame, useThree } from "@react-three/fiber";
import { VisibilityFocusStateGuard, useXRGamepadReader } from "../react/index.js";

const negZAxis = new Vector3(0, 0, -1);

const vec2Helper = new Vector2();

/**
 * controller for pointing objects when the select button is pressed
 * includes a cursor and ray visualization
 */
export function PointerController({
  inputSource,
  children,
  filterIntersections,
  id,
  cursorColor = "white",
  cursorPressColor = "blue",
  cursorOpacity = 0.5,
  cursorSize = 0.1,
  cursorVisible = true,
  rayColor = "white",
  rayPressColor = "blue",
  rayMaxLength = 1,
  rayVisibile = true,
  raySize = 0.005,
  cursorOffset = 0.01,
  pressSoundUrl = "https://coconut-xr.github.io/xsounds/plop.mp3",
  pressSoundVolume = 0.3,
  scrollSpeed,
  ...rest
}: {
  inputSource: XRInputSource;
  children?: ReactNode;
  id: number;
  filterIntersections?: (intersections: XIntersection[]) => XIntersection[];
  cursorColor?: ColorRepresentation;
  cursorPressColor?: ColorRepresentation;
  cursorOpacity?: number;
  cursorSize?: number;
  cursorVisible?: boolean;
  rayColor?: ColorRepresentation;
  rayPressColor?: ColorRepresentation;
  rayMaxLength?: number;
  rayVisibile?: boolean;
  raySize?: number;
  cursorOffset?: number;
  onPointerDownMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onPointerUpMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  onClickMissed?: ((event: ThreeEvent<Event>) => void) | undefined;
  pressSoundUrl?: string;
  pressSoundVolume?: number;
  scrollSpeed?: number | null;
}) {
  const sound = useRef<PositionalAudioImpl>(null);

  const pointerRef = useRef<InputDeviceFunctions>(null);
  const pressedRef = useRef(false);
  const cursorRef = useRef<Mesh>(null);
  const rayRef = useRef<Mesh>(null);
  const prevIntersected = useRef(false);

  const reader = useXRGamepadReader(inputSource);

  useFrame((_, delta) => {
    if (scrollSpeed === null ?? pointerRef.current == null) {
      return;
    }
    if (!reader.readAxes("xr-standard-thumbstick", vec2Helper)) {
      return;
    }
    const speed = scrollSpeed ?? 300;
    const event = new WheelEvent("wheel", {
      deltaX: vec2Helper.x * delta * speed,
      deltaY: vec2Helper.y * delta * speed,
    });
    pointerRef.current.wheel(event);
  });

  const cursorMaterial = useMemo(
    () => new CursorBasicMaterial({ transparent: true, toneMapped: false }),
    [],
  );
  cursorMaterial.opacity = cursorOpacity;
  updatePointerColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);

  const rayMaterial = useMemo(
    () => new RayBasicMaterial({ transparent: true, toneMapped: false }),
    [],
  );
  updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);

  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      if (cursorRef.current?.visible && sound.current != null) {
        sound.current.play();
      }
      pressedRef.current = true;
      updatePointerColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      pointerRef.current?.press(0, e);
    },
    [],
  );
  useInputSourceEvent(
    "selectend",
    inputSource,
    (e) => {
      pressedRef.current = false;
      updatePointerColor(pressedRef.current, cursorMaterial, cursorColor, cursorPressColor);
      updatePointerColor(pressedRef.current, rayMaterial, rayColor, rayPressColor);
      pointerRef.current?.release(0, e);
    },
    [],
  );

  const scene = useThree(({ scene }) => scene);

  return (
    <VisibilityFocusStateGuard>
      {inputSource.gripSpace != null && (
        <SpaceGroup space={inputSource.gripSpace}>
          {children}
          <Suspense fallback={null}>
            <DynamicControllerModel inputSource={inputSource} />
          </Suspense>
        </SpaceGroup>
      )}
      <SpaceGroup space={inputSource.targetRaySpace}>
        <XStraightPointer
          onIntersections={(intersections) => {
            updateCursorTransformation(inputSource, intersections, cursorRef, cursorOffset);
            updateRayTransformation(intersections, rayMaxLength, rayRef);
            triggerVibration(intersections, inputSource, prevIntersected);
          }}
          id={id}
          direction={negZAxis}
          ref={pointerRef}
          filterIntersections={filterIntersections}
          {...rest}
        />
        <mesh
          visible={rayVisibile}
          scale-x={raySize}
          scale-y={raySize}
          material={rayMaterial}
          ref={rayRef}
          renderOrder={inputSource.handedness === "left" ? 3 : 4}
        >
          <boxGeometry />
        </mesh>
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
    </VisibilityFocusStateGuard>
  );
}
