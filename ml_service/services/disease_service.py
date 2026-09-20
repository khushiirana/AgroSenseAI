"""
Plant Disease Detection Service
Lightweight CNN trained on PlantVillage (38 classes).
Includes Top-3 prediction, Grad-CAM heatmap generation, and Health Guidance layer.
Preserves exact architecture and post-sowing separation from agrosenseai (1).ipynb.
"""

import os
from pathlib import Path
import base64
from io import BytesIO
import numpy as np
from PIL import Image

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "plant_disease_cnn_final.keras"

# 38 classes from PlantVillage dataset (sorted order as in train_generator)
PLANT_VILLAGE_CLASSES = [
    "Apple___Apple_scab",
    "Apple___Black_rot",
    "Apple___Cedar_apple_rust",
    "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew",
    "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight",
    "Corn_(maize)___healthy",
    "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot",
    "Peach___healthy",
    "Pepper,_bell___Bacterial_spot",
    "Pepper,_bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch",
    "Strawberry___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

HEALTH_GUIDANCE = {
    "Corn_(maize)___Common_rust_": 
        "Monitor the crop regularly and remove severely affected leaves. Maintain proper field ventilation and avoid excessive moisture on foliage. Apply appropriate bio-fungicide if infection spreads.",

    "Apple___Apple_scab": 
        "Remove infected leaves and fallen fruit to maintain orchard sanitation. Prune tree canopy to improve air circulation and prevent prolonged leaf wetness.",

    "Apple___Black_rot":
        "Prune dead or diseased branches and remove mummified fruits. Apply targeted copper-based protectants during early spring budding.",

    "Apple___Cedar_apple_rust":
        "Remove nearby cedar/juniper galls within orchard perimeter. Apply sulfur or preventative fungicides at tight cluster stage.",

    "Potato___Early_blight":
        "Practice 2-3 year crop rotation. Maintain balanced nitrogen fertilization and avoid overhead irrigation to minimize leaf wetness periods.",

    "Potato___Late_blight": 
        "Severely destroy infected foliage immediately to prevent tuber rot. Avoid excess irrigation and ensure wide plant spacing for aeration.",

    "Tomato___Early_blight": 
        "Remove lower diseased leaves, apply straw mulching to prevent soil splashing, and irrigate at the soil base rather than overhead.",

    "Tomato___Late_blight": 
        "Remove severely infected plant material and improve air circulation. Avoid overhead irrigation and monitor disease spread across neighboring rows.",

    "Tomato___Bacterial_spot":
        "Use certified disease-free seeds and transplants. Avoid handling plants when wet. Apply copper-mancozeb sprays if conditions remain warm and humid.",

    "Tomato___Leaf_Mold":
        "Increase greenhouse or tunnel ventilation. Reduce relative humidity below 85% and prune dense suckers to facilitate sunlight penetration.",

    "Tomato___Septoria_leaf_spot":
        "Discard infected lower foliage and maintain strict crop debris cleanup. Avoid overhead sprinklers and sanitize trellising stakes.",

    "Tomato___Spider_mites Two-spotted_spider_mite":
        "Spray underside of leaves with forceful water or insecticidal soap/neem oil. Avoid dusty field conditions which foster mite proliferation.",

    "Tomato___Target_Spot":
        "Ensure wide plant spacing and prune suckers to promote rapid drying. Practice crop rotation with non-solanaceous species.",

    "Tomato___Tomato_Yellow_Leaf_Curl_Virus":
        "Control whitefly vectors using yellow sticky traps or insect netting. Promptly rogue out infected plants showing severe stunting.",

    "Tomato___Tomato_mosaic_virus":
        "Wash hands and tools thoroughly with soapy water or milk solution before handling plants. Disinfect seed beds and remove infected specimens.",

    "Peach___Bacterial_spot":
        "Avoid high-nitrogen fertilizers that produce excess succulent growth. Apply recommended bactericides during dormant and petal fall stages.",

    "Pepper,_bell___Bacterial_spot":
        "Rotate fields away from solanaceous crops for at least 1 year. Avoid working in the field while foliage is damp from rain or dew.",

    "Squash___Powdery_mildew":
        "Ensure full sunlight exposure and adequate spacing. Apply potassium bicarbonate or sulfur sprays at the very first sign of white powdery spots.",

    "Strawberry___Leaf_scorch":
        "Remove dried, purple-spotted leaves after harvest. Maintain good bed drainage and avoid over-fertilizing with nitrogen in spring.",

    "Orange___Haunglongbing_(Citrus_greening)":
        "Control Asian citrus psyllid vector populations. Immediately remove and quarantine trees testing positive for Candidatus Liberibacter.",

    "Grape___Black_rot":
        "Destroy all mummified grapes and prune infected canes during winter. Apply preventative fungicides starting from pre-bloom to 4 weeks post-bloom.",

    "Grape___Esca_(Black_Measles)":
        "Protect pruning wounds with wound sealant. Remove and burn heavily infected dead vine trunks during the dormant season.",

    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)":
        "Collect and destroy fallen leaf debris after harvest. Ensure adequate canopy airflow through shoot positioning and canopy thinning."
}


def get_health_guidance(disease_name: str) -> str:
    if "healthy" in disease_name.lower():
        crop = disease_name.split("___")[0].replace("_", " ")
        return f"The {crop} foliage appears healthy with no visible signs of pathogen infection. Continue standard balanced irrigation, nutrient management, and regular scout monitoring."
    return HEALTH_GUIDANCE.get(
        disease_name,
        "Monitor the crop regularly, remove severely affected plant material, maintain proper field sanitation, and consult a local agricultural extension specialist."
    )


class DiseaseService:
    def __init__(self):
        self.model = None
        self.tf = None
        self.grad_model = None
        self.model_loaded = False
        self._init_tensorflow()

    def _init_tensorflow(self):
        try:
            import tensorflow as tf
            self.tf = tf
            if MODEL_PATH.exists():
                self.model = tf.keras.models.load_model(str(MODEL_PATH))
                self.model_loaded = True
                print(f"Loaded trained CNN model from {MODEL_PATH}")
                try:
                    self.grad_model = tf.keras.models.Model(
                        inputs=self.model.inputs,
                        outputs=[
                            self.model.get_layer("conv2d_2").output,
                            self.model.outputs[0]
                        ]
                    )
                except Exception as e:
                    print(f"Notice: Could not construct Grad-CAM submodel: {e}")
            else:
                print(f"Notice: Trained CNN weights not found at {MODEL_PATH}. Fallback mode active.")
        except Exception as e:
            print(f"Notice: TensorFlow not available or model load failed ({e}). Fallback mode active.")

    def predict(self, image_bytes: bytes):
        try:
            pil_img = Image.open(BytesIO(image_bytes)).convert("RGB")
        except Exception as e:
            raise ValueError(f"Invalid image file: {e}")

        # Resize to (128, 128) as in notebook cell 59
        resized_img = pil_img.resize((128, 128))
        img_array = np.array(resized_img, dtype=np.float32) / 255.0
        input_batch = np.expand_dims(img_array, axis=0)

        if self.model_loaded and self.model is not None:
            preds = self.model.predict(input_batch, verbose=0)[0]
            top_indices = np.argsort(preds)[::-1][:3]
            
            top3 = []
            for rank, idx in enumerate(top_indices, start=1):
                top3.append({
                    "rank": rank,
                    "disease": PLANT_VILLAGE_CLASSES[idx],
                    "confidence": round(float(preds[idx]) * 100, 2)
                })

            top_disease = top3[0]["disease"]
            top_confidence = top3[0]["confidence"]
            gradcam_base64 = self._generate_tf_gradcam(input_batch, resized_img, top_indices[0])
            source = "trained_cnn"
        else:
            top3, gradcam_base64 = self._generate_fallback_prediction(img_array, resized_img)
            top_disease = top3[0]["disease"]
            top_confidence = top3[0]["confidence"]
            source = "heuristic_prototype (place plant_disease_cnn_final.keras in models/ for trained weights)"

        clean_disease_name = top_disease.replace("___", " - ").replace("_", " ")

        return {
            "predicted_disease": top_disease,
            "display_name": clean_disease_name,
            "confidence": top_confidence,
            "top_3": top3,
            "health_guidance": get_health_guidance(top_disease),
            "gradcam_image": gradcam_base64,
            "model_source": source
        }

    def _generate_tf_gradcam(self, input_batch, pil_img, predicted_class_idx):
        try:
            tf = self.tf
            with tf.GradientTape() as tape:
                conv_outputs, predictions = self.grad_model(input_batch, training=False)
                class_output = predictions[:, predicted_class_idx]

            gradients = tape.gradient(class_output, conv_outputs)
            pooled_gradients = tf.reduce_mean(gradients, axis=(0, 1, 2))
            conv_outputs = conv_outputs[0]

            heatmap = conv_outputs @ pooled_gradients[..., tf.newaxis]
            heatmap = tf.squeeze(heatmap)
            heatmap = tf.maximum(heatmap, 0)
            heatmap /= tf.maximum(tf.reduce_max(heatmap), 1e-8)
            heatmap_np = heatmap.numpy()

            return self._blend_heatmap(pil_img, heatmap_np)
        except Exception as e:
            print(f"Error computing TF Grad-CAM: {e}")
            return None

    def _generate_fallback_prediction(self, img_array, pil_img):
        r = img_array[:, :, 0]
        g = img_array[:, :, 1]
        b = img_array[:, :, 2]
        
        chlorophyll = np.mean(g) / (np.mean(r) + np.mean(b) + 1e-5)
        necrosis = (r > 0.45) & (g < 0.45) & (b < 0.35)
        necrosis_ratio = np.mean(necrosis)

        if chlorophyll > 0.8 and necrosis_ratio < 0.05:
            pred1 = "Tomato___healthy"
            pred2 = "Potato___healthy"
            pred3 = "Apple___healthy"
            conf1 = 88.45
            conf2 = 6.20
            conf3 = 3.15
        elif necrosis_ratio > 0.15:
            pred1 = "Tomato___Early_blight"
            pred2 = "Potato___Early_blight"
            pred3 = "Tomato___Septoria_leaf_spot"
            conf1 = 81.65
            conf2 = 11.20
            conf3 = 4.50
        else:
            pred1 = "Peach___Bacterial_spot"
            pred2 = "Corn_(maize)___Common_rust_"
            pred3 = "Apple___Apple_scab"
            conf1 = 76.50
            conf2 = 14.30
            conf3 = 5.80

        top3 = [
            {"rank": 1, "disease": pred1, "confidence": conf1},
            {"rank": 2, "disease": pred2, "confidence": conf2},
            {"rank": 3, "disease": pred3, "confidence": conf3}
        ]

        diff = np.abs(g - (r + b) / 2)
        heatmap = diff / (np.max(diff) + 1e-5)
        gradcam_base64 = self._blend_heatmap(pil_img, heatmap)

        return top3, gradcam_base64

    def _blend_heatmap(self, pil_img, heatmap_np):
        """Exact Jet colormap overlay without requiring matplotlib."""
        # Jet colormap formula:
        x = np.clip(heatmap_np, 0.0, 1.0)
        r = np.clip(1.5 - np.abs(4.0 * x - 3.0), 0.0, 1.0)
        g = np.clip(1.5 - np.abs(4.0 * x - 2.0), 0.0, 1.0)
        b = np.clip(1.5 - np.abs(4.0 * x - 1.0), 0.0, 1.0)
        jet_rgb = np.stack([r, g, b], axis=-1)
        jet_uint8 = np.uint8(jet_rgb * 255)

        heatmap_img = Image.fromarray(jet_uint8).resize(pil_img.size, resample=Image.BILINEAR)
        heatmap_arr = np.array(heatmap_img)

        base_img = np.array(pil_img)
        # 50% base leaf image + 50% attention heatmap
        blended = np.uint8(0.5 * base_img + 0.5 * heatmap_arr)

        output_pil = Image.fromarray(blended)
        buffer = BytesIO()
        output_pil.save(buffer, format="PNG")
        encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{encoded}"


disease_service = DiseaseService()
