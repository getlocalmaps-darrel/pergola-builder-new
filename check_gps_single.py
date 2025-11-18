from PIL import Image, ExifTags

def dms_to_deg(dms, ref):
    deg = dms[0][0] / dms[0][1]
    minutes = dms[1][0] / dms[1][1]
    seconds = dms[2][0] / dms[2][1]
    value = deg + minutes/60.0 + seconds/3600.0
    if ref in ["S", "W"]:
        value = -value
    return value

def get_gps(path):
    img = Image.open(path)
    exif = img.getexif()  # <-- newer API

    if not exif:
        print("No EXIF data found")
        return

    gps_raw = None
    for tag_id, value in exif.items():
        tag = ExifTags.TAGS.get(tag_id, tag_id)
        if tag == "GPSInfo":
            gps_raw = value
            break

    if not gps_raw:
        print("No GPSInfo tag found")
        return

    gps = {}
    for key in gps_raw:
        name = ExifTags.GPSTAGS.get(key, key)
        gps[name] = gps_raw[key]

    if "GPSLatitude" in gps and "GPSLongitude" in gps:
        lat = dms_to_deg(gps["GPSLatitude"], gps.get("GPSLatitudeRef", "N"))
        lon = dms_to_deg(gps["GPSLongitude"], gps.get("GPSLongitudeRef", "E"))
        print("Latitude:", lat)
        print("Longitude:", lon)
    else:
        print("No GPSLatitude/GPSLongitude keys found")

if __name__ == "__main__":
    path = r"D:\html websites\pergola-builder\images\outdoor bbq island cinco ranch northwest tamarron.jpg"
    get_gps(path)
