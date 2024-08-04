import React from 'react';

import mapImage from '../assets/maps/m0-overworld-downscaled-4x.png';
// import mapImage from '../assets/maps/m0-overworld.png';
import { CategoryMapping, Frame, MarkerDescription, Position, Size } from '../types';

import './MapCanvas.css';
import useCounter from '../hooks/useCounter';
import { getViewportFrame } from '../core/tools';

type ContentProps = {
  data: MarkerDescription[];
  categoryMapping: CategoryMapping;
};

type Props = React.CanvasHTMLAttributes<HTMLCanvasElement> & ContentProps;

type PositionedMarker = {
  marker: MarkerDescription,
  mapPosition: Position,
}

type MapTile = {
  bitmap: ImageBitmap,
  frame: Frame,
}

// Dimensions of the data-source map.
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

const TILE_COUNT = 8;
const TILES_ROW = TILE_COUNT;
const TILES_COL = TILE_COUNT;

function mapPositionFromMarkerRawPosition(rx: number, ry: number): Position {
  // X spans from 10 to 245 -> 235
  // Y from 19 to 238 -> 220
  // Manual correction right now by 1 and 4, cause can't get exact dimensions...
  return {
    x: rx - referenceFrame.origin.x - 1,
    y: ry - referenceFrame.origin.y - 4,
  }
}

function scalePosition(position: Position, scaleX: number, scaleY: number): Position {
  return {
    x: position.x * scaleX,
    y: position.y * scaleY,
  }
}

const markerWidth = 20;
const markerHeight = 20;
const positionMapping: Record<MarkerDescription['id'], Frame> = {};
const visitedMarkers: Set<MarkerDescription['id']> = new Set();

function drawTile(ctx: CanvasRenderingContext2D, tile: MapTile) {
  ctx.drawImage(tile.bitmap, tile.frame.origin.x, tile.frame.origin.y);
  ctx.strokeStyle = 'green';
  ctx.strokeRect(tile.frame.origin.x, tile.frame.origin.y, tile.frame.size.width, tile.frame.size.height);
}

function tilesFilter(tile: MapTile): boolean {
  const viewportFrame = getViewportFrame();
  const returnValue = (tile.frame.origin.x + tile.frame.size.width >= viewportFrame.origin.x &&
    tile.frame.origin.x <= viewportFrame.origin.x + viewportFrame.size.width) &&
    (tile.frame.origin.y + tile.frame.size.height >= viewportFrame.origin.y &&
    tile.frame.origin.y <= viewportFrame.origin.y + viewportFrame.size.height);

  // if (returnValue) {
  //   console.log(`Accept tile at ${JSON.stringify(tile.frame)}, viewport: ${JSON.stringify(viewportFrame)}`);
  // } else {
  //   console.log(`Reject tile at ${JSON.stringify(tile.frame)}, viewport: ${JSON.stringify(viewportFrame)}`);
  //
  // }

  return returnValue;
}

export default function MapCanvas(props: Props) {
  const {
    data,
    categoryMapping,
    ...canvasProps
  } = props;

  const [renderKey, triggerRender] = useCounter(0);

  const [imageSize, setImageSize] = React.useState<Size>({ width: 0, height: 0 });

  const isMouseDown = React.useRef<boolean>(false);
  const tileSet = React.useRef<Array<MapTile> | null>(null)

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const dialogRef = React.useRef<HTMLDivElement>(null);

  const image = React.useMemo(() => {
    const image = new Image();
    image.src = mapImage;
    return image;
  }, [mapImage]);

  const drawItem = React.useCallback((ctx: CanvasRenderingContext2D, frame: Frame, marker: MarkerDescription) => {
    // I need to take some item description here
    // console.log(`Drawing location: ${marker.name} from { x: ${marker.y}, y: ${marker.x} } at ${JSON.stringify(frame.origin)}`)
    const fillStyleLiteral = visitedMarkers.has(marker.id) ? "rgb(0 0 255 / 50%)" : "rgb(255 0 0 / 50%)";
    ctx.fillStyle = fillStyleLiteral;
    ctx.fillRect(frame.origin.x, frame.origin.y, frame.size.width, frame.size.height);
  }, []);

  const drawAllMarkers = React.useCallback((ctx: CanvasRenderingContext2D, markers: MarkerDescription[], imageSize: Size) => {
    const scaleX = imageSize.width / referenceFrame.size.width;
    const scaleY = imageSize.height / referenceFrame.size.height;
    // console.log(`ScaleX: ${scaleX}, ScaleY: ${scaleY}, imageSize: ${JSON.stringify(imageSize)} referenceFrame: ${JSON.stringify(referenceFrame)}`);
    markers.filter(marker => marker.category === 'Locations').forEach(marker => {
      // markers.forEach(marker => {
      const exactPosition = scalePosition(mapPositionFromMarkerRawPosition(marker.x, marker.y), scaleX, scaleY);
      const markerFrame: Frame = {
        origin: {
          x: exactPosition.x - markerWidth / 2,
          y: exactPosition.y - markerHeight / 2,
        },
        size: {
          width: markerWidth,
          height: markerHeight,
        },
      }
      positionMapping[marker.id] = markerFrame;
      drawItem(ctx, markerFrame, marker);
    });
  }, [drawItem]);

  const handleImageLoad = React.useCallback(async () => {
    console.log(`Setting imageSize to ${image.naturalWidth} x ${image.naturalHeight}`);
    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
    const tileSize: Size = {
      width: Math.floor(image.naturalWidth / TILES_ROW),
      height: Math.floor(image.naturalHeight / TILES_COL),
    };

    tileSet.current = await Promise.all([...Array(TILES_ROW * TILES_COL).keys()].map(i => {
      const origin = {
        x: Math.floor(i / TILES_COL) * tileSize.width,
        y: Math.floor(i % TILES_ROW) * tileSize.height,
      }
      return new Promise<MapTile>(async (resolve) => {
        resolve({
          bitmap: await createImageBitmap(image, origin.x, origin.y, tileSize.width, tileSize.height),
          frame: {
            origin: origin,
            size: tileSize,
          }
        })
      })
    }));
  }, [image]);

  const handleClick = React.useCallback((event: MouseEvent) => {
    const x = event.pageX;
    const y = event.pageY;
    for (const itemId in positionMapping) {
      const itemPosition = positionMapping[itemId];
      if (x >= itemPosition.origin.x && x <= itemPosition.origin.x + itemPosition.size.width && y >= itemPosition.origin.y && y <= itemPosition.origin.y + itemPosition.size.height) {
        console.log(`Hit item with id ${itemId}`);
        visitedMarkers.add(Number(itemId));
        triggerRender();
        break;
      }
    }
  }, [triggerRender]);

  const handleMouseDown = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDown.current = true;
    // console.log("MouseDown");
  }, []);

  const handleMouseUp = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDown.current = false;
    // console.log("MouseUp");
  }, []);

  const handleMouseMove = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDown.current === true) {
      // console.log(`scrollBy: (${event.movementX}, ${event.movementY})`)
      window.scrollBy(-event.movementX * 0.5, -event.movementY * 0.5);
    }
  }, []);

  const handleWheel = React.useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
  }, []);

  React.useEffect(() => {
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  React.useEffect(() => {
    image.addEventListener('load', handleImageLoad);
    return () => {
      image.removeEventListener('load', handleImageLoad);
    };
  }, [image, handleImageLoad]);

  React.useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const ctx = canvasRef.current.getContext("2d");

    if (!ctx) {
      return;
    }

    ctx.clearRect(0, 0, imageSize.width, imageSize.height);

    // ctx.drawImage(image, 0, 0);
    tileSet.current?.filter(tilesFilter).forEach(tile => drawTile(ctx, tile));

    drawAllMarkers(ctx, props.data, imageSize);
  }, [renderKey, imageSize, drawAllMarkers, image, props.data]);

  if (imageSize.width === 0) {
    return (
      <div>
        <p>Loading the map...</p>
      </div>
    )
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseUp={handleMouseUp}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        width={imageSize.width}
        height={imageSize.height}
        {...canvasProps}
      >
        Fallback text
      </canvas>
      <div ref={dialogRef}></div>
    </div>
  );
}

export type MapCanvasProps = Props;

