import * as WebXRMotionControllers from "@webxr-input-profiles/motion-controllers";
import type {
  Component,
  VisualResponse,
  MotionController,
} from "@webxr-input-profiles/motion-controllers";
import { Mesh, MeshBasicMaterial, Object3D, SphereGeometry } from "three";
import { DEFAULT_PROFILES_PATH } from "./index.js";

const { Constants } = WebXRMotionControllers;

//from https://github.com/mrdoob/three.js/blob/dev/examples/jsm/webxr/XRControllerModelFactory.js

const DEFAULT_CONTROLLER_PROFILE = "generic-trigger";

export type XRInputSourceData = Readonly<{
  /**
   * array of profile ids from XRInputSource.profiles
   */
  profiles: ReadonlyArray<string>;
  /**
   * handedness of the input source
   * can be "left", "right", "any", or any additional by the profile supported handedness
   */
  handedness: string;
}>;

export type ControllerComponent = {
  type: "trigger" | "squeeze" | "touchpad" | "thumbstick" | "button" | string;
  gamepadIndices: {
    [Key in string | "button" | "xAxis" | "yAxis"]?: number;
  };
  rootNodeName: string;
  visualResponses: any;
};

export type ControllerLayout = {
  selectComponentId: string;
  components: {
    [Key in string]: ControllerComponent;
  };
  gamepadMapping: string;
  rootNodeName: string;
  assetPath: string;
};

export type ControllerProfile = {
  profileId: string;
  fallbackProfileIds: Array<string>;
  deprecatedProfileIds?: Array<string>;
  profilePath: string;
  layouts: {
    [Key in
      | "left"
      | "right"
      | "none"
      | "left-right"
      | "left-right-none"
      | string]?: ControllerLayout;
  };
};

export async function fetchControllerProfile(
  inputSourceProfiles: ReadonlyArray<string>,
  basePath = DEFAULT_PROFILES_PATH,
  defaultProfileId = DEFAULT_CONTROLLER_PROFILE,
): Promise<ControllerProfile> {
  // Get the list of profiles

  const profileListFileName = "profilesList.json";
  let response = await fetch(`${basePath}/${profileListFileName}`);

  if (!response.ok) {
    return Promise.reject(new Error(response.statusText));
  }

  const supportedProfilesList = await response.json();

  // Find the relative path to the first requested profile that is recognized
  const supportedProfileId =
    inputSourceProfiles.find((profileId) => supportedProfilesList[profileId] != null) ??
    defaultProfileId;

  if (defaultProfileId == null) {
    throw new Error("No matching profile name found");
  }

  const supportedProfile = supportedProfilesList[supportedProfileId];

  if (supportedProfile == null) {
    throw new Error(
      `No matching profile name found and default profile "${defaultProfileId}" missing.`,
    );
  }

  const profilePath = `${basePath}/${supportedProfile.path}`;

  response = await fetch(profilePath);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return Object.assign(await response.json(), { profilePath });
}

export function getAssetPath(profile: ControllerProfile, handedness: string): string {
  const layout =
    profile.layouts[handedness === "any" ? Object.keys(profile.layouts)[0] : handedness];
  if (layout == null) {
    throw new Error(`No matching handedness, ${handedness}, in profile ${profile.profileId}`);
  }

  return profile.profilePath.replace("profile.json", layout.assetPath);
}

export function bindMotionControllerToObject(
  motionController: MotionController,
  controller: Object3D,
) {
  // Loop through the components and find the nodes needed for each components' visual responses
  for (const component of Object.values<Component & { touchPointNode?: Object3D }>(
    motionController.components,
  )) {
    const { type, touchPointNodeName, visualResponses } = component;

    if (type === Constants.ComponentType.TOUCHPAD) {
      component.touchPointNode = controller.getObjectByName(touchPointNodeName);
      if (component.touchPointNode != null) {
        // Attach a touch dot to the touchpad.
        const sphereGeometry = new SphereGeometry(0.001);
        const material = new MeshBasicMaterial({ color: 0x0000ff, toneMapped: false });
        const sphere = new Mesh(sphereGeometry, material);
        component.touchPointNode.add(sphere);
      } else {
        console.warn(
          `Could not find touch dot, ${component.touchPointNodeName}, in touchpad component ${component.id}`,
        );
      }
    }

    // Loop through all the visual responses to be applied to this component
    for (const visualResponse of Object.values<
      VisualResponse & {
        minNode?: Object3D;
        maxNode?: Object3D;
        valueNode?: Object3D;
      }
    >(visualResponses)) {
      const { valueNodeName, minNodeName, maxNodeName, valueNodeProperty } = visualResponse;

      // If animating a transform, find the two nodes to be interpolated between.
      if (
        minNodeName != null &&
        maxNodeName != null &&
        valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM
      ) {
        visualResponse.minNode = controller.getObjectByName(minNodeName);
        visualResponse.maxNode = controller.getObjectByName(maxNodeName);

        // If the extents cannot be found, skip this animation
        if (visualResponse.minNode == null) {
          console.warn(`Could not find ${minNodeName} in the model`);
          return;
        }

        if (visualResponse.maxNode == null) {
          console.warn(`Could not find ${maxNodeName} in the model`);
          return;
        }
      }

      // If the target node cannot be found, skip this animation
      visualResponse.valueNode = controller.getObjectByName(valueNodeName);
      if (visualResponse.valueNode == null) {
        console.warn(`Could not find ${valueNodeName} in the model`);
      }
    }
  }
}

export function updateMotionController(motionController: MotionController) {
  // Cause the MotionController to poll the Gamepad for data
  motionController.updateFromGamepad();

  // Update the 3D model to reflect the button, thumbstick, and touchpad state
  for (const component of Object.values(motionController.components)) {
    // Update node data based on the visual responses' current states
    for (const visualResponse of Object.values<
      VisualResponse & {
        minNode?: Object3D;
        maxNode?: Object3D;
        valueNode?: Object3D;
      }
    >(component.visualResponses)) {
      const { valueNode, minNode, maxNode, value, valueNodeProperty } = visualResponse;

      // Skip if the visual response node is not found. No error is needed,
      // because it will have been reported at load time.
      if (valueNode == null || minNode == null || maxNode == null) {
        return;
      }

      // Calculate the new properties based on the weight supplied
      if (valueNodeProperty === Constants.VisualResponseProperty.VISIBILITY) {
        valueNode.visible = value as boolean;
      } else if (valueNodeProperty === Constants.VisualResponseProperty.TRANSFORM) {
        valueNode.quaternion.slerpQuaternions(
          minNode.quaternion,
          maxNode.quaternion,
          value as number,
        );

        valueNode.position.lerpVectors(minNode.position, maxNode.position, value as number);
      }
    }
  }
}
