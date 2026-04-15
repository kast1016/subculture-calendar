import json
import os
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_PATHS = [ROOT / 'assets' / 'icon-source.png', ROOT / 'assets' / 'icon-source.jpg', ROOT / 'assets' / 'icon-source.jpeg']
ICON_PATH = ROOT / 'assets' / 'icon.ico'
ANDROID_RES = ROOT / 'android' / 'app' / 'src' / 'main' / 'res'
IOS_APPICONSET = ROOT / 'ios' / 'App' / 'App' / 'Assets.xcassets' / 'AppIcon.appiconset'

ANDROID_ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

IOS_APPICON_SIZES = []


def find_source():
    for path in SOURCE_PATHS:
        if path.exists():
            return path
    raise FileNotFoundError(
        '아이콘 소스 이미지가 없습니다. assets/icon-source.png 또는 assets/icon-source.jpg 파일을 추가해 주세요.'
    )


def ensure_square(img: Image.Image) -> Image.Image:
    width, height = img.size
    if width == height:
        return img
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    return img.crop((left, top, left + side, top + side))


def ensure_minimum_size(img: Image.Image, min_size: int = 256) -> Image.Image:
    width, height = img.size
    if width >= min_size and height >= min_size:
        return img
    return img.resize((min_size, min_size), Image.LANCZOS)


def save_windows_icon(img: Image.Image):
    sizes = [(size, size) for size in (256, 128, 64, 48, 32, 16)]
    icon_img = ensure_minimum_size(img, 256).convert('RGBA')
    icon_img.save(ICON_PATH, sizes=sizes)
    print(f'Windows icon saved: {ICON_PATH}')


def save_android_icons(img: Image.Image):
    for folder, size in ANDROID_ICON_SIZES.items():
        target_dir = ANDROID_RES / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        for name in ('ic_launcher.png', 'ic_launcher_round.png', 'ic_launcher_foreground.png'):
            output_path = target_dir / name
            img.resize((size, size), Image.LANCZOS).save(output_path, format='PNG')
            print(f'Android icon saved: {output_path}')


def save_ios_icons(img: Image.Image):
    contents_json = IOS_APPICONSET / 'Contents.json'
    if not contents_json.exists():
        print('iOS AppIcon asset set이 없습니다. iOS 앱 아이콘 경로를 찾을 수 없습니다.')
        return
    with open(contents_json, 'r', encoding='utf-8') as f:
        contents = json.load(f)

    images = contents.get('images', [])
    for item in images:
        filename = item.get('filename')
        if not filename:
            continue
        scale = int(item['scale'].replace('x', ''))
        size = item['size'].split('x')
        width = int(float(size[0]) * scale)
        height = int(float(size[1]) * scale)
        output_path = IOS_APPICONSET / filename
        img.resize((width, height), Image.LANCZOS).save(output_path, format='PNG')
        print(f'iOS icon saved: {output_path}')


def main():
    source = find_source()
    print(f'Using source icon: {source}')
    with Image.open(source) as src:
        image = ensure_square(src)
        image = image.convert('RGBA')
        save_windows_icon(image)
        save_android_icons(image)
        save_ios_icons(image)


if __name__ == '__main__':
    main()
