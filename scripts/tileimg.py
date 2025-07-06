from pathlib import Path
from PIL import Image
from tqdm import tqdm
import sys


def output_file_path_for_tile(
    source_image: Path, output_dir: Path, tile: tuple[int, int]
) -> Path:
    return output_dir / f"{source_image.stem}-{tile[0]}-{tile[1]}.png"


def split_image_into_tiles(
    image_path: Path, output_dir: Path, tile_count_hor: int, tile_count_ver: int
):
    source_image = Image.open(image_path)
    width, height = source_image.size

    assert width % tile_count_hor == 0
    assert height % tile_count_ver == 0

    tile_width = width // tile_count_hor
    tile_height = height // tile_count_ver

    progress_bar = tqdm(total=tile_count_hor * tile_count_ver)
    completed_count = 0

    for row_i in range(tile_count_hor):
        for col_i in range(tile_count_ver):
            left = col_i * tile_width
            top = row_i * tile_height

            right = left + tile_width
            bottom = top + tile_height

            tile_image = source_image.crop((left, top, right, bottom))
            tile_output_path = output_file_path_for_tile(
                image_path, output_dir, (row_i, col_i)
            )

            tile_image.save(tile_output_path)

            completed_count += 1
            progress_bar.update(completed_count)

    progress_bar.close()


def main():
    assert len(sys.argv) == 4

    image_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])
    tile_count = int(sys.argv[3])

    split_image_into_tiles(
        image_path, output_dir, tile_count_hor=tile_count, tile_count_ver=tile_count
    )


if __name__ == "__main__":
    main()
