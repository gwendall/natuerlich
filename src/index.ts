export const DEFAULT_PROFILES_PATH =
  "https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles";

const xrPlaneIdMap = new Map<XRPlane, number>();

export function getPlaneId(plane: XRPlane): number {
  let id = xrPlaneIdMap.get(plane);
  if (id == null) {
    xrPlaneIdMap.set(plane, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const xrMeshIdMap = new Map<XRMesh, number>();

export function getMeshId(mesh: XRMesh): number {
  let id = xrMeshIdMap.get(mesh);
  if (id == null) {
    xrMeshIdMap.set(mesh, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

const xrInputSourceIdMap = new Map<XRInputSource, number>();

export function getInputSourceId(inputSource: XRInputSource): number {
  let id = xrInputSourceIdMap.get(inputSource);
  if (id == null) {
    xrInputSourceIdMap.set(inputSource, (id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)));
  }
  return id;
}

export * from "./motion-hand.js";
export * from "./motion-controller.js";
export * from "./anchor.js";
export * from "./pose.js";
