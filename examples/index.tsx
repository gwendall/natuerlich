/* eslint-disable react/no-unknown-property */
import { useFrame, useLoader } from "@react-three/fiber";
import { MutableRefObject, ReactNode, Suspense, useCallback, useRef, useState } from "react";
import {
  SpaceGroup,
  useEnterXR,
  useInputSourceEvent,
  useInputSources,
  useSessionGrant,
  DynamicControllerModel,
  DynamicHandModel,
  HandBoneGroup,
  useNativeFramebufferScaling,
  useHeighestAvailableFrameRate,
  CylinderLayer,
  QuadLayer,
  ImmersiveSessionOrigin,
  NonImmersiveCamera,
  useTrackedPlanes,
  TrackedPlane,
  SessionModeGuard,
  useHandPoses,
  Background,
  QuadLayerPortal,
  useSessionSupported,
  useTrackedMeshes,
  TrackedMesh,
  useTrackedMeshObjects,
  useXR,
} from "@coconut-xr/natuerlich/react";
import { BoxGeometry, DoubleSide, Group, PlaneGeometry, TextureLoader, Vector3 } from "three";
import {
  InputDeviceFunctions,
  XSphereCollider,
  XStraightPointer,
} from "@coconut-xr/xinteraction/react";
import { XIntersection } from "@coconut-xr/xinteraction";
import { Container, RootContainer, Text } from "@coconut-xr/koestlich";
import {
  Select,
  Button,
  Checkbox,
  Dropdown,
  DropdownContent,
  Link,
  Progess,
  Radio,
  Slider,
  StepConnection,
  StepNumber,
  StepNumbers,
  StepTitle,
  StepTitles,
  Steps,
  Tab,
  Table,
  TableCell,
  TableRow,
  Tabs,
  Toggle,
} from "@coconut-xr/kruemel";
import {
  Bars3,
  MagnifyingGlass,
  Pause,
  Play,
  Plus,
  Trash,
} from "@coconut-xr/kruemel/icons/outline";
import { AnchorObject } from "./anchor-object.js";
import { Box } from "@react-three/drei";
import {
  KoestlichQuadLayer,
  Grabbable,
  GrabController,
  XRCanvas,
  TouchHand,
  GrabHand,
  PointerHand,
  PointerController,
  Controllers,
  Hands,
} from "@coconut-xr/natuerlich/defaults";
import { getInputSourceId, getMeshId, getPlaneId } from "@coconut-xr/natuerlich";

const tableData = [
  ["Entry Name", "Entry Number", "Entry Description"],
  ["ABC", "1", "ABC is CBA reversed"],
  ["Koestlich", "2", "User Interfaces for Three.js"],
  ["Coconut XR", "3", "Powered by Coconut Capital GmbH"],
];

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor"],
  optionalFeatures: [
    "hand-tracking",
    "anchors",
    //"layers",
    //"depth-sorted-layers",
    "mesh-detection",
    "plane-detection",
  ],
};

export default function Index() {
  useSessionGrant();
  const [position, setPosition] = useState(new Vector3(-2, 0, 0.5));
  const ref = useRef<() => void>();
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const enterVR = useEnterXR("immersive-vr", sessionOptions);
  const frameBufferScaling = useNativeFramebufferScaling();
  const frameRate = useHeighestAvailableFrameRate();
  const supportsAr = useSessionSupported("immersive-ar");
  const supportsVr = useSessionSupported("immersive-vr");
  return (
    <>
      <div style={{ zIndex: 1, position: "absolute", top: 0, left: 0 }}>
        {supportsAr && <button onClick={() => enterAR()}>AR</button>}
        {supportsVr && <button onClick={() => enterVR()}>VR</button>}
        <button onClick={() => ref.current?.()}>Capture</button>
      </div>
      <XRCanvas
        dpr={window.devicePixelRatio}
        shadows
        gl={{ localClippingEnabled: true }}
        style={{ width: "100vw", height: "100svh", touchAction: "none" }}
        frameBufferScaling={frameBufferScaling}
        frameRate={frameRate}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 1, 0]} intensity={10} />
        <ImmersiveSessionOrigin position={position}>
          {/*<InputSources functionRef={ref} onTeleport={setPosition} />*/}
          <Controllers />
          <Hands />
          <TrackedPlanes />
          <TrackedMeshes />
          <AnchorObject />
        </ImmersiveSessionOrigin>
        <NonImmersiveCamera position={[0, 1, 5]} />
        <Suspense>
          <NormalTexture />
        </Suspense>
        {/*<TeleportTarget>
          <Plane scale={100} rotation={[-Math.PI / 2, 0, 0]} />
  </TeleportTarget>*/}
        <Suspense>
          <QuadLayerTexture />
        </Suspense>
        <Suspense>
          <CylinderLayerTexture />
        </Suspense>
        <Rotate>
          <Grabbable maxGrabbers={1}>
            <Box />
          </Grabbable>
        </Rotate>
        <KoestlichQuadLayer pixelWidth={512} pixelHeight={512} position={[-2, 1, 0]}>
          <Suspense>
            <Koestlich />
          </Suspense>
          <Grabbable>
            <Box />
          </Grabbable>
        </KoestlichQuadLayer>
        <SessionModeGuard deny="immersive-ar">
          <Background color="red" />
        </SessionModeGuard>
        <QuadLayerPortal pixelWidth={1024} pixelHeight={1024} position={[2, 1, 0]}>
          <Grabbable position={[0, 0, -5]}>
            <Box />
          </Grabbable>
          <Background color="green" />
        </QuadLayerPortal>
        {/*<DoubleGrabCube />*/}
      </XRCanvas>
    </>
  );
}

function Rotate({ children }: { children?: ReactNode }) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current != null) {
      groupRef.current.rotation.y += (Math.PI / 2) * delta;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function TrackedMeshes() {
  const meshes = useTrackedMeshes();
  return (
    <>
      {meshes?.map((mesh) => (
        <TrackedMesh mesh={mesh} key={getMeshId(mesh)}>
          <meshPhongMaterial color="blue" wireframe />
        </TrackedMesh>
      ))}
    </>
  );
}

function TrackedPlanes() {
  const planes = useTrackedPlanes();
  const texture = useLoader(TextureLoader, "test.png");
  return (
    <>
      {planes?.map((plane) => (
        <TrackedPlane plane={plane} key={getPlaneId(plane)}>
          <meshPhongMaterial map={texture} />
        </TrackedPlane>
      ))}
    </>
  );
}

const planeGeometry = new PlaneGeometry();

function NormalTexture() {
  const texture = useLoader(TextureLoader, "test.png");
  return (
    <mesh onPointerEnter={console.log} position={[1, 1, 0]} geometry={planeGeometry}>
      <meshBasicMaterial toneMapped={false} map={texture} />
    </mesh>
  );
}

function QuadLayerTexture() {
  const texture = useLoader(TextureLoader, "test.png");
  return (
    <QuadLayer
      position={[0, 1, 0]}
      texture={texture}
      pixelWidth={texture.image.width}
      pixelHeight={texture.image.height}
    />
  );
}

function CylinderLayerTexture() {
  const texture = useLoader(TextureLoader, "test.png");
  return (
    <CylinderLayer
      index={-2}
      position={[-1, 0, 1.5]}
      texture={texture}
      pixelWidth={texture.image.width}
      pixelHeight={texture.image.height}
    />
  );
}

function InputSources({
  onTeleport,
  functionRef,
}: {
  functionRef: MutableRefObject<(() => void) | undefined>;
  onTeleport: (point: Vector3) => void;
}) {
  const inputSources = useInputSources();
  return (
    <>
      {inputSources.map((inputSource) =>
        inputSource == null || inputSource.handedness === "none" ? null : inputSource.hand !=
          null ? (
          /*<GrabHand
            cursorPressColor="blue"
            id={inputSource.handedness === "left" ? -3 : -4}
            hand={inputSource.hand}
            inputSource={inputSource}
            key={getInputSourceId(inputSource)}
          />*/
          <TouchHand
            key={getInputSourceId(inputSource)}
            inputSource={inputSource}
            hand={inputSource.hand}
            cursorColor="black"
            id={inputSource.handedness === "left" ? -3 : -4}
          />
        ) : (
          /*<PointerHand
            key={getInputSourceId(inputSource)}
            inputSource={inputSource}
            hand={inputSource.hand}
            id={inputSource.handedness === "left" ? -5 : -6}
          />*/
          /*<TeleportHand
            
            hand={inputSource.hand}
            onTeleport={onTeleport}
            inputSource={inputSource}
            id={inputSource.handedness === "left" ? -5 : -6}
          />*/
          /*<PointerController
            key={getInputSourceId(inputSource)}
            inputSource={inputSource}
            id={inputSource.handedness === "left" ? -5 : -6}
          />*/
          /*<TeleportController
            onTeleport={onTeleport}
            id={inputSource.handedness === "left" ? -5 : -6}
            key={getInputSourceId(inputSource)}
            inputSource={inputSource}
          />*/
          <PointerController
            id={inputSource.handedness === "left" ? -5 : -6}
            cursorPressColor="blue"
            key={getInputSourceId(inputSource)}
            inputSource={inputSource}
          />
        ),
      )}
    </>
  );
}

function Hand({
  hand,
  inputSource,
  functionRef,
}: {
  functionRef: MutableRefObject<(() => void) | undefined>;
  hand: XRHand;
  inputSource: XRInputSource;
}) {
  const pointerRef = useRef<InputDeviceFunctions>(null);
  const colliderRef = useRef<InputDeviceFunctions>(null);
  //const initiateRoomCapture = useInitRoomCapture();

  functionRef.current = useHandPoses(hand, inputSource.handedness, (name, prevName) => {}, {
    relax: "/relax.handpose",
  });

  useInputSourceEvent(
    "selectstart",
    inputSource,
    (e) => {
      pointerRef.current?.press(0, e);
      //initiateRoomCapture?.();
    },
    [],
  );
  useInputSourceEvent("selectend", inputSource, (e) => pointerRef.current?.release(0, e), []);

  return (
    <>
      <DynamicHandModel hand={hand} handedness={inputSource.handedness}>
        {inputSource.handedness === "left" ? (
          <HandBoneGroup joint={"wrist"}>
            {/*<Koestlich
              position-x={0.1}
              position-y={0}
              position-z={0.1}
              rotation-z={(0.8 * Math.PI) / 2}
              rotation-x={(1.1 * -Math.PI) / 2}
              rotation-y={0.9 * Math.PI}
              scale={0.1}
        />*/}
          </HandBoneGroup>
        ) : (
          <>
            {/*<HandBoneGroup joint={"index-finger-tip"}>
              <XSphereCollider
                radius={0.03}
                distanceElement={{ id: 0, downRadius: 0.01 }}
                id={inputSource.handedness === "left" ? -5 : -6}
              />
        </HandBoneGroup>*/}
            <HandBoneGroup joint="wrist">
              <XSphereCollider
                ref={colliderRef}
                radius={0.01}
                id={inputSource.handedness === "left" ? -3 : -4}
              />
            </HandBoneGroup>
            *
          </>
        )}
      </DynamicHandModel>
      {/*<SpaceGroup space={inputSource.targetRaySpace}>
        <group rotation-y={Math.PI}>
          <XStraightPointer id={inputSource.handedness === "left" ? -1 : -2} ref={pointerRef} />
        </group>
        <mesh scale={[0.01, 0.01, 1]} geometry={geometry}>
          <meshBasicMaterial color={0xffffff} />
        </mesh>
  </SpaceGroup>*/}
    </>
  );
}

const geometry = new BoxGeometry();
geometry.translate(0, 0, -0.5);

function Controller({ inputSource }: { inputSource: XRInputSource }) {
  const pointerRef = useRef<InputDeviceFunctions>(null);
  const colliderRef = useRef<InputDeviceFunctions>(null);
  const intersectionLength = useRef(0);
  useInputSourceEvent("selectstart", inputSource, (e) => pointerRef.current?.press(0, e), []);
  useInputSourceEvent("selectend", inputSource, (e) => pointerRef.current?.release(0, e), []);

  useInputSourceEvent("squeezestart", inputSource, (e) => colliderRef.current?.press(0, e), []);
  useInputSourceEvent("squeezeend", inputSource, (e) => colliderRef.current?.release(0, e), []);

  const onIntersections = useCallback(
    (intersections: ReadonlyArray<XIntersection>) => {
      const prevIntersected = intersectionLength.current > 0;
      const currentIntersected = intersections.length > 0;
      intersectionLength.current = intersections.length;
      if (!(!prevIntersected && currentIntersected)) {
        return;
      }
      if (inputSource.gamepad == null) {
        return;
      }
      const [hapticActuator] = inputSource.gamepad.hapticActuators;
      if (hapticActuator == null) {
        return;
      }
      (hapticActuator as any).pulse(1, 100);
    },
    [inputSource],
  );

  return (
    <>
      {inputSource.gripSpace != null && (
        <SpaceGroup space={inputSource.gripSpace}>
          {inputSource.handedness === "left" ? (
            <RootContainer sizeX={3} sizeY={3}>
              <Koestlich />
            </RootContainer>
          ) : (
            <XSphereCollider
              ref={colliderRef}
              radius={0.05}
              id={inputSource.handedness === "left" ? -3 : -4}
            />
          )}
          <Suspense fallback={null}>
            <DynamicControllerModel inputSource={inputSource} />
          </Suspense>
        </SpaceGroup>
      )}
      <SpaceGroup space={inputSource.targetRaySpace}>
        <group rotation-y={Math.PI}>
          <XStraightPointer
            onIntersections={onIntersections}
            id={inputSource.handedness === "left" ? -1 : -2}
            ref={pointerRef}
          />
        </group>

        <mesh scale={[0.01, 0.01, 1]} geometry={geometry}>
          <meshBasicMaterial color={0xffffff} />
        </mesh>
      </SpaceGroup>
    </>
  );
}

function Koestlich() {
  const [checked, setChecked] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [sliderValue, setSliderValue] = useState(0.5);

  return (
    <Container
      backgroundColor="white"
      width="100%"
      height="100%"
      alignItems="flex-start"
      padding={0.2}
      overflow="scroll"
      flexDirection="column"
    >
      <Text>Button</Text>
      <Button onClick={() => setChecked((checked) => !checked)}>Toggle Checked</Button>

      <Text marginTop={0.2}>Checkbox</Text>
      <Container
        alignItems="center"
        flexDirection="row"
        onClick={() => setChecked((checked) => !checked)}
      >
        <Checkbox marginRight={32} checked={checked} />
        <Text>Checked</Text>
      </Container>

      <Text marginTop={32}>Toggle</Text>
      <Container
        alignItems="center"
        flexDirection="row"
        onClick={() => setChecked((checked) => !checked)}
      >
        <Toggle marginRight={0.02} checked={checked} />
        <Text>Checked</Text>
      </Container>

      <Text marginTop={32}>Dropdown</Text>
      <Dropdown>
        <Button onClick={() => setChecked((checked) => !checked)}>Toggle Dropdown</Button>
        <DropdownContent
          border={2}
          borderColor="black"
          borderOpacity={0.5}
          padding={4}
          open={checked}
        >
          <Text>Dropdown Content</Text>
        </DropdownContent>
      </Dropdown>

      <Text marginTop={32}>Slider</Text>
      <Slider value={sliderValue} range={10} onChange={setSliderValue} />

      <Text marginTop={32}>Select</Text>
      <Select
        value={activeTab}
        options={new Array(3).fill(null).map((_, i) => ({ value: i, label: `Option ${i + 1}` }))}
        onChange={setActiveTab}
      />

      <Text marginTop={32}>Radio</Text>
      <Container gapRow={0.1} alignItems="center" flexDirection="column">
        {new Array(3).fill(null).map((_, i) => (
          <Container
            key={i}
            alignItems="center"
            flexDirection="row"
            onClick={() => setActiveTab(i)}
          >
            <Radio marginRight={0.02} checked={i === activeTab ? true : false} />
            <Text>{`Radio ${i + 1}`}</Text>
          </Container>
        ))}
      </Container>

      <Text marginTop={32}>Tabs</Text>
      <Tabs width="100%">
        {new Array(3).fill(null).map((_, i) => (
          <Tab key={i} onClick={() => setActiveTab(i)} active={i === activeTab}>{`Tab ${
            i + 1
          }`}</Tab>
        ))}
      </Tabs>

      <Text marginTop={32}>Table</Text>
      <Table>
        {tableData.map((rowData, rowIndex) => (
          <TableRow key={rowIndex}>
            {rowData.map((cellData, columnIndex) => (
              <TableCell key={columnIndex}>
                <Text>{cellData}</Text>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </Table>
      <Text marginTop={32}>Link</Text>
      <Container flexDirection="row">
        <Text>Find our Website </Text>
        <Link href="https://coconut-xr.com" target="_blank">
          here.
        </Link>
      </Container>

      <Text marginTop={32}>Steps</Text>
      <Steps maxWidth={4}>
        <StepNumbers>
          <StepNumber>1</StepNumber>
          <StepConnection />
          <StepNumber>2</StepNumber>
          <StepConnection />
          <StepNumber>3</StepNumber>
          <StepConnection backgroundColor="gray" />
          <StepNumber backgroundColor="gray">4</StepNumber>
        </StepNumbers>
        <StepTitles>
          <StepTitle>Login</StepTitle>
          <StepTitle>Do Something</StepTitle>
          <StepTitle>Logout</StepTitle>
          <StepTitle>Shut Down</StepTitle>
        </StepTitles>
      </Steps>

      <Text marginTop={32}>Icons</Text>
      <Container flexWrap="wrap" flexDirection="row" gapColumn={0.1}>
        <Plus />
        <Play />
        <Pause />
        <Trash />
        <MagnifyingGlass />
      </Container>

      <Text marginTop={32}>Pagination</Text>
      <Container flexDirection="row">
        <Button>1</Button>
        <Button backgroundColor="gray">2</Button>
        <Button backgroundColor="gray">3</Button>
        <Button backgroundColor="gray">4</Button>
      </Container>

      <Text marginTop={32}>Navbar</Text>

      <Container
        width="100%"
        maxWidth={4}
        backgroundColor="black"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        paddingY={8}
        paddingX={4}
        gapColumn={16}
      >
        <Bars3 height={2} color="white" />
        <Text color="white">COCONUT-XR</Text>
        <Container flexGrow={1} />
        <MagnifyingGlass color="white" />
        <Plus color="white" />
      </Container>

      <Text marginTop={32}>Progress</Text>
      <Progess value={0.5} />
    </Container>
  );
}
