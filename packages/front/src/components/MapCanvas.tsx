import { assert } from 'console';
import React from 'react';

import mapImage from '../assets/maps/m0-overworld.png';
// import mapImage from '../assets/maps/m0-overworld.png';
import { MarkerDescriptionRaw } from '../types';

import './MapCanvas.css';

type ContentProps = {
  data: MarkerDescriptionRaw[];
};

type Size = {
  width: number,
  height: number,
};

type Position = {
  x: number,
  y: number,
}

type Frame = {
  origin: Position,
  size: Size,
}

type Props = React.CanvasHTMLAttributes<HTMLCanvasElement> & ContentProps;

const referenceFrame: Frame = {
  origin: {
    x: 10,
    y: 15,
  },
  size: {
    width: 235,
    height: 220,
  },
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.stroke();
}

function drawItem(ctx: CanvasRenderingContext2D, x: number, y: number, marker: MarkerDescriptionRaw) {
  // I need to take some item description here
  const mapPosition = { x: x, y: y };
  // console.log(`Drawing location: ${marker.name} from { x: ${marker.y}, y: ${marker.x} } at ${JSON.stringify(mapPosition)}`)
  ctx.fillStyle = "rgb(255 0 0 / 50%)";
  const width = 10;
  const height = 10;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
}

function mapPositionFromMarkerRawPosition(rx: number, ry: number): Position {
  // X spans from 10 to 245 -> 235
  // Y from 18 to 238 -> 220
  // Manual correction right now by 1 and 4, cause can't get exact dimensions...
  return {
    x: rx - referenceFrame.origin.x - 1,
    y: ry - referenceFrame.origin.y - 4,
  }
}

function scalePosition(position: Position, scaleX: number, scaleY: number) {
  return {
    x: position.x * scaleX,
    y: position.y * scaleY,
  }
}

function drawAllMarkers(ctx: CanvasRenderingContext2D, markers: MarkerDescriptionRaw[], imageSize: Size) {
  const scaleX = imageSize.width / referenceFrame.size.width;
  const scaleY = imageSize.height / referenceFrame.size.height;

  // const scaleX = referenceFrame.size.width / imageSize.width;
  // const scaleY = referenceFrame.size.height / imageSize.height;
  // console.log(`ScaleX: ${scaleX}, ScaleY: ${scaleY}, imageSize: ${JSON.stringify(imageSize)} referenceFrame: ${JSON.stringify(referenceFrame)}`);

  // markers.filter(marker => marker.category === 'Locations').forEach(marker => {
  markers.forEach(marker => {
    const mapPosition = scalePosition(mapPositionFromMarkerRawPosition(Number(marker.y), Math.abs(Number(marker.x))), scaleX, scaleY);
    drawItem(ctx, mapPosition.x, mapPosition.y, marker);
  });
}


export default function MapCanvas(props: Props) {
  console.log("Rendering MapCanvas");
  const [imageSize, setImageSize] = React.useState<Size>({ width: 0, height: 0 });

  const ref = React.useRef<HTMLCanvasElement>(null);

  const image = React.useMemo(() => {
    const image = new Image();
    image.src = mapImage;
    return image;
  }, []);

  React.useEffect(() => {
    image.addEventListener('load', () => {
      console.log("Image loaded");
      setImageSize({ width: image.width, height: image.height });
    });
  }, [image]);

  React.useEffect(() => {
    console.log("useEffect");
    if (!ref.current) {
      console.warn("Nullish reference");
      return;
    }

    const ctx = ref.current.getContext("2d");

    if (!ctx) {
      console.log("No context present")
      return;
    }

    ctx.clearRect(0, 0, imageSize.width, imageSize.height);
    ctx.drawImage(image, 0, 0);

    drawAllMarkers(ctx, props.data, imageSize);
  }, [imageSize]);

  return (
    <canvas ref={ref} width={imageSize.width} height={imageSize.height} {...props}>Fallback text</canvas>
  );
}

export type MapCanvasProps = Props;

