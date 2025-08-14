import os
import shutil
from sklearn.model_selection import train_test_split
import yaml 
import os

class SH17DatasetPreprocessor:
    def __init__(self, raw_images_dir, raw_labels_dir, output_dir, class_map,
                 max_train=1000, max_val=300, max_test=200):
        self.raw_images_dir = raw_images_dir
        self.raw_labels_dir = raw_labels_dir
        self.output_dir = output_dir
        self.class_map = class_map
        self.splits = ['train', 'val', 'test']
        self.max_samples = {'train': max_train, 'val': max_val, 'test': max_test}

    def create_folders(self):
        for split in self.splits:
            os.makedirs(f"{self.output_dir}/images/{split}", exist_ok=True)
            os.makedirs(f"{self.output_dir}/labels/{split}", exist_ok=True)

    def split_dataset(self):
        label_files = [f for f in os.listdir(self.raw_labels_dir) if f.endswith('.txt')]
        train_files, temp_files = train_test_split(label_files, test_size=0.3, random_state=42)
        val_files, test_files = train_test_split(temp_files, test_size=0.33, random_state=42)
        return train_files[:self.max_samples['train']], val_files[:self.max_samples['val']], test_files[:self.max_samples['test']]

    def process_and_copy(self, files, split):
        remap_dict = {original_id: idx for idx, original_id in enumerate(self.class_map.values())}
        total_valid = 0

        for label_file in files:
            label_path = os.path.join(self.raw_labels_dir, label_file)
            image_base = label_file.replace('.txt', '')
            possible_exts = ['.jpg', '.jpeg', '.png', '.JPG']

            image_path = None
            for ext in possible_exts:
                test_path = os.path.join(self.raw_images_dir, image_base + ext)
                if os.path.exists(test_path):
                    image_path = test_path
                    break

            if image_path is None:
                print(f"⚠️ No image found for label: {label_file}")
                continue

            with open(label_path, 'r') as f:
                lines = f.readlines()

            filtered_lines = []
            for line in lines:
                parts = line.strip().split()
                if len(parts) != 5:
                    continue
                class_id, x, y, w, h = parts
                class_id = int(class_id)

                if class_id in remap_dict:
                    new_id = remap_dict[class_id]
                    filtered_lines.append(f"{new_id} {x} {y} {w} {h}\n")

            if filtered_lines:
                total_valid += 1
                with open(f"{self.output_dir}/labels/{split}/{label_file}", 'w') as f:
                    f.writelines(filtered_lines)

                shutil.copy(image_path, f"{self.output_dir}/images/{split}/{label_file.replace('.txt', '.jpg')}")

        print(f"✅ Total images added to '{split}': {total_valid}")

    def run(self):
        print("📁 Creating folder structure...")
        self.create_folders()

        print("🔀 Splitting dataset...")
        train_files, val_files, test_files = self.split_dataset()

        print("🟩 Processing training data...")
        self.process_and_copy(train_files, 'train')

        print("🟨 Processing validation data...")
        self.process_and_copy(val_files, 'val')

        print("🟦 Processing test data...")
        self.process_and_copy(test_files, 'test')

        print("✅ Dataset preprocessing completed with sample limits.")

if __name__ == "__main__":
    with open("config/sh17_ppe.yaml", "r") as file:
        config = yaml.safe_load(file)

    RAW_IMAGES_DIR = config["RAW_IMAGES_DIR"]
    RAW_LABELS_DIR = config["RAW_LABELS_DIR"]
    OUTPUT_DIR = config["OUTPUT_DIR"]
    CLASS_MAP = config["CLASS_MAP"]

    from collections import Counter

    counter = Counter()
    for file in os.listdir(RAW_LABELS_DIR):
        with open(os.path.join(RAW_LABELS_DIR, file), "r") as f:
            for line in f:
                class_id = int(line.strip().split()[0])
                counter[class_id] += 1
    
    print(counter)

    preprocessor = SH17DatasetPreprocessor(
        RAW_IMAGES_DIR,
        RAW_LABELS_DIR,
        OUTPUT_DIR,
        CLASS_MAP,
        max_train=800,  
        max_val=200,
        max_test=100
    )
    preprocessor.run()