from ultralytics import YOLO

def train_yolov8():
    model = YOLO('yolov8n.pt') 

    model.train(
        data='../config/sh17_ppe.yaml',
        epochs=20,
        imgsz=640,
        batch=16,
        workers=2,
        project='ppe_yolo_train',
        name='yolov8n_results',
        exist_ok=True
    )
    
# from google.colab import files
# files.download("ppe_yolo_colab/yolov8n_results/weights/best.pt")

if __name__ == "__main__":
    train_yolov8()

