"""Remove a connected bright neutral backdrop from a generated sprite sheet.

This is intentionally conservative: only background-like pixels connected to the
image border are removed. It keeps interior highlights and emits a Phaser-ready
sheet whose dimensions are divisible by the requested grid.
"""

from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, _ = pixel
    return min(red, green, blue) >= 190 and max(red, green, blue) - min(red, green, blue) <= 18


def prepare(source: Path, destination: Path, columns: int, rows: int) -> None:
    image = Image.open(source).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((x, 0)); queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y)); queue.append((width - 1, y))
    visited = bytearray(width * height)
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index]:
            continue
        visited[index] = 1
        if not is_background(pixels[x, y]):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        if x: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))

    target_width = width - width % columns
    target_height = height - height % rows
    image = image.crop((0, 0, target_width, target_height))
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, "PNG", optimize=True)


def split_sheet(source: Path, destination: Path, names: list[str], columns: int, rows: int) -> None:
    image = Image.open(source).convert("RGBA")
    cell_width, cell_height = image.width // columns, image.height // rows
    destination.mkdir(parents=True, exist_ok=True)
    for index, name in enumerate(names):
        column, row = index % columns, index // columns
        cell = image.crop((column * cell_width, row * cell_height, (column + 1) * cell_width, (row + 1) * cell_height))
        alpha_box = cell.getchannel("A").getbbox()
        if alpha_box:
            cell = cell.crop(alpha_box)
        cell.save(destination / f"{name}.png", "PNG", optimize=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--columns", type=int, default=4)
    parser.add_argument("--rows", type=int, default=2)
    parser.add_argument("--split-dir", type=Path)
    parser.add_argument("--names", nargs="*")
    args = parser.parse_args()
    prepare(args.source, args.destination, args.columns, args.rows)
    if args.split_dir:
        if not args.names or len(args.names) != args.columns * args.rows:
            parser.error("--names must contain exactly columns × rows values when --split-dir is used")
        split_sheet(args.destination, args.split_dir, args.names, args.columns, args.rows)
