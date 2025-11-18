from PIL import Image, ExifTags

path = r"D:\html websites\pergola-builder\images\outdoor bbq island cinco ranch northwest tamarron.jpg"

try:
    img = Image.open(path)
    print("Opened OK:", img.format, img.size, img.mode)

    exif = img.getexif()
    print("EXIF entries:", len(exif))

    gps_raw = None
    for tag_id, value in exif.items():
        tag = ExifTags.TAGS.get(tag_id, tag_id)
        if tag == "GPSInfo":
            gps_raw = value
            break

    if gps_raw is None:
        print("No GPSInfo tag found")
    else:
        gps = {}
        for key in gps_raw:
            name = ExifTags.GPSTAGS.get(key, key)
            gps[name] = gps_raw[key]
        print("GPS keys:", gps.keys())
        print("Raw GPS:", gps)

except Exception as e:
    print("Error:", e)
