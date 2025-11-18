from PIL import Image, ExifTags
import os
from collections import defaultdict

def dms_to_deg(dms, ref):
    deg = dms[0][0] / dms[0][1]
    minutes = dms[1][0] / dms[1][1]
    seconds = dms[2][0] / dms[2][1]
    value = deg + minutes/60.0 + seconds/3600.0
    if ref in ["S", "W"]:
        value = -value
    return value

def get_gps(path):
    try:
        img = Image.open(path)
        exif = img.getexif()  # <--- important change

        if not exif:
            return None

        gps_raw = None
        for tag_id, value in exif.items():
            tag = ExifTags.TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                gps_raw = value
                break

        if not gps_raw:
            return None

        gps = {}
        for key in gps_raw:
            name = ExifTags.GPSTAGS.get(key, key)
            gps[name] = gps_raw[key]

        if "GPSLatitude" in gps and "GPSLongitude" in gps:
            lat = dms_to_deg(gps["GPSLatitude"], gps.get("GPSLatitudeRef", "N"))
            lon = dms_to_deg(gps["GPSLongitude"], gps.get("GPSLongitudeRef", "E"))
            return lat, lon

        return None

    except Exception as e:
        print(f"Error reading {path}: {e}")
        return None

def group_photos(base_dir):
    exts = {".jpg", ".jpeg", ".JPG", ".JPEG"}

    clusters = defaultdict(list)

    for root, _, files in os.walk(base_dir):
        for name in files:
            if os.path.splitext(name)[1] not in exts:
                continue
            full_path = os.path.join(root, name)
            gps = get_gps(full_path)
            if not gps:
                print(f"No GPS for: {full_path}")
                continue

            lat, lon = gps
            key = (round(lat, 4), round(lon, 4))  # group by approx location
            clusters[key].append({
                "path": full_path,
                "lat": lat,
                "lon": lon,
            })

    if not clusters:
        print("No photos with GPS data found.")
        return

    print("\n=== GROUPED JOBS BY LOCATION ===\n")
    for i, ((lat_r, lon_r), photos) in enumerate(clusters.items(), start=1):
        print(f"Job {i}  (approx {lat_r}, {lon_r})")
        for p in photos:
            print(f"  - {os.path.basename(p['path'])}")
        print()

if __name__ == "__main__":
    base_dir = r"D:\html websites\pergola-builder\images"
    group_photos(base_dir)
