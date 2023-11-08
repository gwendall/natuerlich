import { XIntersection } from "@coconut-xr/xinteraction";
import { XCurvedPointer } from "@coconut-xr/xinteraction/react";
import { GroupProps, createPortal, useFrame, useStore, useThree } from "@react-three/fiber";
import React, {
  MutableRefObject,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactNode } from "react";
import {
  ColorRepresentation,
  Euler,
  Group,
  Mesh,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Quaternion,
  Vector3,
  PositionalAudio as PositionalAudioImpl,
} from "three";
import { useInputSourceEvent } from "../react/listeners.js";
import { DynamicHandModel } from "../react/hand.js";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { clamp } from "three/src/math/MathUtils.js";
import { SpaceGroup } from "../react/space.js";
import { DynamicControllerModel } from "../react/controller.js";
import { CursorBasicMaterial, PositionalAudio, isTouchscreen } from "./index.js";
import { FocusStateGuard } from "../react/index.js";

function emptyFunction() {
  //nothing to do
}

//from end to start so that we can use dashOffset as "dashLength"
const curve = new QuadraticBezierCurve3(
  new Vector3(0, 0, 0),
  new Vector3(0, 0, -8),
  new Vector3(0, -20, -15),
);
const points = curve.getPoints(20);
//reacting to the bug in meshline
const multiplier = (points.length * 3 - 3) / (points.length * 3 - 1);
const float32Array = new Float32Array(points.length * 3);
for (let i = 0; i < points.length; i++) {
  points[i].toArray(float32Array, i * 3);
}
const rayGeometry = new MeshLineGeometry();
rayGeometry.setPoints(float32Array);
const lineLengths = points.slice(0, -1).map((p, i) => p.distanceTo(points[i + 1]));

const cursorGeometry = new PlaneGeometry(1, 1);
cursorGeometry.rotateX(-Math.PI / 2);

const UP = new Vector3(0, 1, 0);

const offsetHelper = new Vector3();
const quaternionHelper = new Quaternion();

/**
 * marks its children as teleportable
 */
export function TeleportTarget({ children, ...props }: { children?: ReactNode } & GroupProps) {
  const ref = useRef<Group>(null);
  useEffect(() => {
    if (ref.current == null) {
      return;
    }
    ref.current.traverse((object) => (object.userData.teleportTarget = true));
  }, []);
  return (
    <group {...props} onPointerDown={emptyFunction} ref={ref}>
      {children}
    </group>
  );
}

const eulerHelper = new Euler(0, 0, 0, "YXZ");

export function isTeleportTarget(intersection: XIntersection): boolean {
  return intersection.object.userData.teleportTarget === true;
}

const positionHelper = new Vector3();

/**
 * hand for pointing to teleportable objects
 * is activated when the pinch gesture is detected
 * includes a cursor and a downward bend ray visualization
 */
export function TeleportHand({
  hand,
  inputSource,
  children,
  onTeleport,
  teleportSoundUrl = "https://coconut-xr.github.io/xsounds/plop.mp3",
  teleportSoundVolume = 0.3,
  ...pointerProps
}: {
  hand: XRHand;
  inputSource: XRInputSource;
  children?: ReactNode;
  id: number;
  rayColor?: ColorRepresentation;
  rayOpacity?: number;
  raySize?: number;
  cursorColor?: ColorRepresentation;
  cursorSize?: number;
  cursorOpacity?: number;
  onTeleport?: (point: Vector3) => void;
  filterIntersections?: (intersections: any[]) => any[]; //TODO
  teleportSoundUrl?: string;
  teleportSoundVolume?: number;
}) {
  const sound = useRef<PositionalAudioImpl>(null);

  const groupRef = useRef<Group>(null);
  const handRef = useRef<Group>(null);
  const currentIntersectionRef = useRef<XIntersection>();
  const teleportRef = useRef(onTeleport);
  teleportRef.current = onTeleport;

  const [show, setShow] = useState(false);

  const store = useStore();

  useInputSourceEvent("selectstart", inputSource, () => setShow(true), []);
  useInputSourceEvent(
    "selectend",
    inputSource,
    () => {
      if (sound.current != null) {
        sound.current.play();
      }
      if (currentIntersectionRef.current != null) {
        store.getState().camera.getWorldPosition(positionHelper);
        positionHelper
          .setFromMatrixPosition(store.getState().camera.matrix)
          .negate()
          .setComponent(1, 0)
          .add(currentIntersectionRef.current.point);
        teleportRef.current?.(positionHelper.clone());
      }
      setShow(false);
    },
    [store],
  );
  useFrame((_, delta) => {
    const group = groupRef.current;
    const bone = handRef.current;
    if (group == null || bone == null) {
      return;
    }
    group.position.copy(bone.position);
    eulerHelper.setFromQuaternion(bone.quaternion);
    eulerHelper.z = 0;
    eulerHelper.y += ((inputSource.handedness === "right" ? 1 : -1) * (20 * Math.PI)) / 180;
    eulerHelper.x = clamp(eulerHelper.x - (10 * Math.PI) / 180, -Math.PI / 2, (1.1 * Math.PI) / 4);
    quaternionHelper.setFromEuler(eulerHelper);
    group.quaternion.slerp(quaternionHelper, delta * 10);
  });

  return (
    <FocusStateGuard>
      <Suspense fallback={null}>
        <DynamicHandModel ref={handRef} hand={hand} handedness={inputSource.handedness}>
          {children}
        </DynamicHandModel>
      </Suspense>
      <group ref={groupRef}>
        <Suspense>
          <PositionalAudio url={teleportSoundUrl} volume={teleportSoundVolume} ref={sound} />
        </Suspense>
        {show && (
          <TeleportPointer
            inputSource={inputSource}
            {...pointerProps}
            currentIntersectionRef={currentIntersectionRef}
          />
        )}
      </group>
    </FocusStateGuard>
  );
}

/**
 * controller for pointing to teleportable objects
 * is activated when the pinch gesture is detected
 * includes a cursor and a downward bend ray visualization
 */
export function TeleportController({
  inputSource,
  children,
  onTeleport,
  teleportSoundUrl = "https://coconut-xr.github.io/xsounds/plop.mp3",
  teleportSoundVolume = 0.3,
  ...pointerProps
}: {
  inputSource: XRInputSource;
  children?: ReactNode;
  id: number;
  rayColor?: ColorRepresentation;
  raySize?: number;
  rayOpacity?: number;
  cursorColor?: ColorRepresentation;
  cursorSize?: number;
  cursorOpacity?: number;
  onTeleport?: (point: Vector3) => void;
  filterIntersections?: (intersections: any[]) => any[]; //TODO
  teleportSoundUrl?: string;
  teleportSoundVolume?: number;
}) {
  const sound = useRef<PositionalAudioImpl>(null);

  const groupRef = useRef<Group>(null);
  const currentIntersectionRef = useRef<XIntersection>();
  const teleportRef = useRef(onTeleport);
  teleportRef.current = onTeleport;

  const [show, setShow] = useState(false);

  const store = useStore();

  useInputSourceEvent("selectstart", inputSource, () => setShow(true), []);
  useInputSourceEvent(
    "selectend",
    inputSource,
    () => {
      if (sound.current != null) {
        sound.current.play();
      }
      if (currentIntersectionRef.current != null) {
        store.getState().camera.getWorldPosition(positionHelper);
        positionHelper
          .setFromMatrixPosition(store.getState().camera.matrix)
          .negate()
          .setComponent(1, 0)
          .add(currentIntersectionRef.current.point);
        teleportRef.current?.(positionHelper.clone());
      }
      setShow(false);
    },
    [store],
  );

  useFrame((state, delta, frame: XRFrame | undefined) => {
    const group = groupRef.current;
    if (group == null) {
      return;
    }
    const referenceSpace = state.gl.xr.getReferenceSpace();
    if (referenceSpace == null || frame == null) {
      group.visible = false;
      return;
    }
    const pose = frame.getPose(inputSource.targetRaySpace, referenceSpace);
    if (pose == null) {
      group.visible = false;
      return;
    }
    group.visible = true;
    {
      const { x, y, z } = pose.transform.position;
      group.position.set(x, y, z);
    }
    {
      const { x, y, z, w } = pose.transform.orientation;
      quaternionHelper.set(x, y, z, w);
      group.rotation.setFromQuaternion(quaternionHelper);
    }
    group.rotation.z = 0;
    group.rotation.x = clamp(group.rotation.x, -Math.PI / 2, (1.1 * Math.PI) / 4);
  });

  return (
    <FocusStateGuard>
      {inputSource.gripSpace != null && (
        <SpaceGroup space={inputSource.gripSpace}>
          {children}
          <Suspense fallback={null}>
            <DynamicControllerModel inputSource={inputSource} />
          </Suspense>
        </SpaceGroup>
      )}
      <group rotation-order="YXZ" ref={groupRef}>
        <Suspense>
          <PositionalAudio url={teleportSoundUrl} volume={teleportSoundVolume} ref={sound} />
        </Suspense>
        {show && (
          <TeleportPointer
            inputSource={inputSource}
            {...pointerProps}
            currentIntersectionRef={currentIntersectionRef}
          />
        )}
      </group>
    </FocusStateGuard>
  );
}

export function TeleportPointer({
  rayColor,
  raySize,
  filterIntersections: customFilterIntersections,
  id,
  currentIntersectionRef,
  cursorColor = "blue",
  cursorSize = 0.3,
  cursorOpacity = 1.0,
  inputSource,
}: {
  inputSource: XRInputSource;
  rayColor?: ColorRepresentation;
  rayOpacity?: number;
  raySize?: number;
  filterIntersections?: (intersections: any[]) => any[];
  currentIntersectionRef: MutableRefObject<XIntersection | undefined>;
  cursorColor?: ColorRepresentation;
  cursorOpacity?: number;
  cursorSize?: number;
  id: number;
}) {
  const touchscreen = isTouchscreen(inputSource);
  const cursorRef = useRef<Mesh>(null);

  const rayMaterial = useMemo(
    () =>
      new MeshLineMaterial({
        toneMapped: false,
        lineWidth: 0.1,
        transparent: true,
        visibility: 1 * multiplier,
      }),
    [],
  );
  rayMaterial.color.set(rayColor ?? "blue");
  rayMaterial.lineWidth = raySize ?? 0.01;

  const cursorMaterial = useMemo(
    () => new CursorBasicMaterial({ toneMapped: false, transparent: true }),
    [],
  );
  cursorMaterial.color.set(cursorColor);
  cursorMaterial.opacity = cursorOpacity;

  const onIntersections = useCallback(
    (intersections: ReadonlyArray<{ lineIndex: number; distanceOnLine: number }>) => {
      let visibility = 1 * multiplier;
      if (intersections.length > 0) {
        const lineLength = lineLengths[intersections[0].lineIndex];
        visibility =
          (multiplier *
            (intersections[0].lineIndex + intersections[0].distanceOnLine / lineLength)) /
          (points.length - 1);
        currentIntersectionRef.current = intersections[0] as any;
      } else {
        currentIntersectionRef.current = undefined;
      }
      rayMaterial.visibility = visibility;
      if (cursorRef.current == null) {
        return;
      }
      cursorRef.current.visible = intersections.length > 0;
      if (intersections.length > 0) {
        const intersection = intersections[0] as any as XIntersection;
        cursorRef.current.position.copy(intersection.point);
        if (intersection.face != null) {
          cursorRef.current.quaternion.setFromUnitVectors(UP, intersection.face.normal);
          intersection.object.getWorldQuaternion(quaternionHelper);
          cursorRef.current.quaternion.multiply(quaternionHelper);
          offsetHelper.set(0, 0.01, 0);
          offsetHelper.applyQuaternion(cursorRef.current.quaternion);
          cursorRef.current.position.add(offsetHelper);
        }
      }
    },
    [],
  );

  const filterIntersections = useCallback(
    (intersections: Array<any>) => {
      const teleportTargets = intersections.filter(isTeleportTarget);
      if (customFilterIntersections == null) {
        return teleportTargets;
      }
      return customFilterIntersections(teleportTargets);
    },
    [customFilterIntersections],
  );

  const scene = useThree(({ scene }) => scene);

  return (
    <>
      <XCurvedPointer
        points={points}
        onIntersections={onIntersections}
        filterIntersections={filterIntersections}
        initialPressedElementIds={touchscreen ? [0] : undefined}
        id={id}
      />
      <mesh geometry={rayGeometry} material={rayMaterial} />
      {createPortal(
        <mesh
          scale={cursorSize}
          ref={cursorRef}
          geometry={cursorGeometry}
          material={cursorMaterial}
        />,
        scene,
      )}
    </>
  );
}
