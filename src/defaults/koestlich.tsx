/* eslint-disable react/display-name */
import React, {
  forwardRef,
  ComponentPropsWithoutRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { Object3D, OrthographicCamera } from "three";
import { CylinderLayer, CylinderLayerPortal, QuadLayer, QuadLayerPortal } from "../react/index.js";
import { RootContainer } from "@coconut-xr/koestlich";
import { useStore } from "@react-three/fiber";

/**
 * combines WebXR quad layer with a Koestlich root container
 */
export const KoestlichQuadLayer = forwardRef<
  Object3D,
  Omit<ComponentPropsWithoutRef<typeof QuadLayer>, "updateTarget" | "texture"> & {
    far?: number;
    near?: number;
    precision?: number;
  }
>(({ children, far, near, precision, ...props }, ref) => {
  return (
    <QuadLayerPortal {...props} ref={ref}>
      <KoestlichFullscreenCamera
        width={props.pixelWidth}
        height={props.pixelHeight}
        far={far}
        near={near}
      />
      <RootContainer
        sizeX={props.pixelWidth}
        sizeY={props.pixelHeight}
        pixelSize={1}
        precision={precision}
      >
        {children}
      </RootContainer>
    </QuadLayerPortal>
  );
});

/**
 * combines WebXR cylinder layer with a Koestlich root container
 */
export const KoestlichCylinderLayer = forwardRef<
  Object3D,
  Omit<ComponentPropsWithoutRef<typeof CylinderLayer>, "updateTarget" | "texture"> & {
    far?: number;
    near?: number;
    precision?: number;
  }
>(({ children, far, near, precision, ...props }, ref) => {
  return (
    <CylinderLayerPortal {...props} ref={ref}>
      <KoestlichFullscreenCamera
        width={props.pixelWidth}
        height={props.pixelHeight}
        far={far}
        near={near}
      />
      <RootContainer
        sizeX={props.pixelWidth}
        sizeY={props.pixelHeight}
        pixelSize={1}
        precision={precision}
      >
        {children}
      </RootContainer>
    </CylinderLayerPortal>
  );
});

/**
 * expects the Koestlich container to be at 0,0,0 with anchor center
 */
export const KoestlichFullscreenCamera = forwardRef<
  OrthographicCamera,
  { near?: number; far?: number; zoom?: number; width: number; height: number }
>(({ near = 100, far = -1, zoom = 1, width, height }, ref) => {
  const store = useStore();
  const internalRef = useRef<OrthographicCamera>(null);
  useImperativeHandle(ref, () => internalRef.current!, []);

  useEffect(() => {
    const newCamera = internalRef.current;
    if (newCamera == null) {
      return;
    }
    const prevCamera = store.getState().camera;
    store.setState({ camera: newCamera });

    return () => {
      if (store.getState().camera != newCamera) {
        //camera was already changed to another one
        return;
      }
      store.setState({ camera: prevCamera });
    };
  }, [store]);

  useLayoutEffect(() => internalRef.current?.updateProjectionMatrix(), [zoom, near, far]);

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  //the camera automatically retrieves the width and height and positions itself and the view bounds accordingly
  return (
    <orthographicCamera
      position={[0, 0, near]}
      left={-halfWidth}
      right={halfWidth}
      top={halfHeight}
      bottom={-halfHeight}
      zoom={zoom}
      near={0}
      far={near - far}
      ref={internalRef}
    />
  );
});
