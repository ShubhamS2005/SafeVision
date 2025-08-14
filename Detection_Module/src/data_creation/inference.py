from ultralytics import YOLO

model = YOLO("weights/yolo9e.pt")

# results = model.predict(source=r"C:\WorkSpace\\projects\DataScience\DeepLearning\SafeVision\dataset\sh17_ppe\\images\\train\\pexels-photo-2310483.jpg", save=True, conf=0.4)


allowed_classes = ['helmet', 'vest','gloves', 'mask','shoes', 'no_helmet', 'no_vest', 'no_mask']

results = model.predict(source=r"C:\WorkSpace\\projects\DataScience\DeepLearning\SafeVision\dataset\sh17_ppe\\images\\train\\pexels-photo-266047.jpg", save=True, conf=0.4)

for result in results:
    result.show()  
    for box in result.boxes:
        cls_id = int(box.cls)
        class_name = model.names[cls_id]
        if class_name in allowed_classes:
            print(f"{class_name} detected with confidence {box.conf}")

