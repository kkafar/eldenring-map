import React from 'react';
import type { CategoryMapping, MarkerDescription } from '../types';

type ContentProps = {
  data: MarkerDescription[];
  categoryMapping: CategoryMapping;
};

type Props = React.CanvasHTMLAttributes<HTMLCanvasElement> & ContentProps;

export default function EldenRingMap(props: Props) {
  return (
    <div>
      Hello world from EldenRingMap
    </div>
  )
}
