import requests as req
import sqlite3 as sql
from bs4 import BeautifulSoup
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

FEXTRALIFE_MAP_URL = "https://eldenring.wiki.fextralife.com/Interactive+Map#"
MAPGENIE_BOSS_CHECKLIST_URL = "https://mapgenie.io/elden-ring/checklist"
MAPGENIE_DLC_CHECKLIST_URL = "https://mapgenie.io/elden-ring/checklists/shadow-of-the-erdtree-checklist"
KEY_MAPCACHE = "map"
KEY_BOSS_CHECKLIST = "boss_checklist"
KEY_DLC_CHECKLIST = "dlc_checklist"


@dataclass
class ScrapedFileCacheEntry:
    url: str
    local_path: Path


def page_path_from_store_key(key: str) -> Path:
    if key == KEY_MAPCACHE:
        return Path(f"pages/{key}.html2")
    return Path(f"pages/{key}.html")


file_store = {
    KEY_MAPCACHE: ScrapedFileCacheEntry(FEXTRALIFE_MAP_URL, page_path_from_store_key(KEY_MAPCACHE)),
    KEY_BOSS_CHECKLIST: ScrapedFileCacheEntry(MAPGENIE_BOSS_CHECKLIST_URL, page_path_from_store_key(KEY_BOSS_CHECKLIST)),
    KEY_DLC_CHECKLIST: ScrapedFileCacheEntry(MAPGENIE_DLC_CHECKLIST_URL, page_path_from_store_key(KEY_DLC_CHECKLIST))
}


def write_string_to_file(string: str, file: Path, append: bool = False):
    # https://stackoverflow.com/questions/30686701/python-get-size-of-string-in-bytes
    string_byte_count = len(string.encode('utf-8'))
    open_mode = 'w+' if append else 'w'

    writed_bytes_count = 0
    with open(file, mode=open_mode, encoding='utf-8') as writer:
        writed_bytes_count = writer.write(string)

    assert string_byte_count == writed_bytes_count


def write_bytes_to_file(data: bytes, file: Path, append: bool = False):
    # https://stackoverflow.com/questions/30686701/python-get-size-of-string-in-bytes
    data_byte_count = len(data)
    open_mode = 'wb+' if append else 'wb'

    writed_bytes_count = 0
    with open(file, mode=open_mode) as writer:
        writed_bytes_count = writer.write(data)

    assert data_byte_count == writed_bytes_count, f"Failed to write all the data to the file. Wrote: {writed_bytes_count}, while expected: {data_byte_count}"


def read_data_from_local_file(local_path: Path):
    response_bytes = None
    with open(local_path, 'r') as file:
        response_bytes = file.read()

    if response_bytes is None:
        raise RuntimeError(
            f"Failed to read cached data for path {file.local_path}. Remove the file and run again")

    response_content = response_bytes
    return response_content


def fetch_data_from_remote_url(url: str, cache_path: Optional[Path] = None):
    response = req.get(url)

    if response.status_code != 200:
        raise RuntimeError(f"Received non-success status code for request: {response.status_code}. Url: {url}")

    if cache_path is not None:
        write_bytes_to_file(response.content, cache_path, append=False)

    return response.content


def load_file(file: ScrapedFileCacheEntry):
    if file.local_path.is_file():
        return read_data_from_local_file(file.local_path)
    else:
        return fetch_data_from_remote_url(file.url, file.local_path)


def get_html_cursor_from_file(file: ScrapedFileCacheEntry):
    return BeautifulSoup(load_file(file), 'html.parser')


def main():
    soup = get_html_cursor_from_file(file_store[KEY_MAPCACHE])
    print(soup)

    pass


if __name__ == '__main__':
    main()
