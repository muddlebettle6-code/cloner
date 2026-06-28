import React from "react";
import { Composition } from "remotion";
import { Reel } from "./Reel";
import { TOTAL_FRAMES } from "./data";
import { FPS, WIDTH, HEIGHT } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CumulantReel"
    component={Reel}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
