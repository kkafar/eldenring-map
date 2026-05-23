import React from "react";
import type { CategoryMapping, MarkerDescription } from "../types";

import mapImage from "../assets/maps/m0-overworld.png";

type ContentProps = {
  data: MarkerDescription[];
  categoryMapping: CategoryMapping;
};

type Props = React.CanvasHTMLAttributes<HTMLCanvasElement> & ContentProps;

export default function EldenRingMap(props: Props) {
  return (
    <div>
      <img src={mapImage} alt="Elden Ring Map" />
    </div>
  );
}

export function SomeNewComponent() {
  return (
    <div>
      <h1>Some New Component</h1>
      <p>This is a new component that can be used in the application.</p>
    </div>
  );
}


