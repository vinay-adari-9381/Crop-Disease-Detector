from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
from torchvision import transforms
from PIL import Image, UnidentifiedImageError
import io
import logging
import torch.nn as nn
import torch.nn.functional as F

# ========== LOGGING SETUP ==========
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ========== MODEL UTILITIES ==========
def accuracy(outputs, labels):
    _, preds = torch.max(outputs, dim=1)
    return torch.tensor(torch.sum(preds == labels).item() / len(preds))

def ConvBlock(in_channels, out_channels, pool=False):
    layers = [
        nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1),
        nn.BatchNorm2d(out_channels),
        nn.ReLU(inplace=True),
    ]
    if pool:
        layers.append(nn.MaxPool2d(4))
    return nn.Sequential(*layers)

class ImageClassificationBase(nn.Module):
    def training_step(self, batch):
        images, labels = batch
        out = self(images)
        return F.cross_entropy(out, labels)

    def validation_step(self, batch):
        images, labels = batch
        out = self(images)
        loss = F.cross_entropy(out, labels)
        acc = accuracy(out, labels)
        return {"val_loss": loss.detach(), "val_acc": acc}

    def validation_epoch_end(self, outputs):
        batch_losses = [x["val_loss"] for x in outputs]
        batch_accs = [x["val_acc"] for x in outputs]
        return {
            "val_loss": torch.stack(batch_losses).mean().item(),
            "val_acc": torch.stack(batch_accs).mean().item(),
        }

class CNN_NeuralNet(ImageClassificationBase):
    def __init__(self, in_channels, num_diseases):
        super().__init__()
        self.conv1 = ConvBlock(in_channels, 64)
        self.conv2 = ConvBlock(64, 128, pool=True)
        self.res1 = nn.Sequential(ConvBlock(128, 128), ConvBlock(128, 128))
        self.conv3 = ConvBlock(128, 256, pool=True)
        self.conv4 = ConvBlock(256, 512, pool=True)
        self.res2 = nn.Sequential(ConvBlock(512, 512), ConvBlock(512, 512))
        self.classifier = nn.Sequential(
            nn.MaxPool2d(4), nn.Flatten(), nn.Linear(512, num_diseases)
        )

    def forward(self, x):
        out = self.conv1(x)
        out = self.conv2(out)
        out = self.res1(out) + out
        out = self.conv3(out)
        out = self.conv4(out)
        out = self.res2(out) + out
        return self.classifier(out)

# ========== LOAD MODEL ==========
def load_model(checkpoint_path):
    checkpoint = torch.load(checkpoint_path, map_location=torch.device("cpu"))
    model = CNN_NeuralNet(
        in_channels=checkpoint["input_channels"],
        num_diseases=checkpoint["num_classes"]
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    idx_to_class = {v: k for k, v in checkpoint["class_to_idx"].items()}
    return model, checkpoint["transform"], idx_to_class

# ========== APP SETUP ==========
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
model, transform_config, idx_to_class = load_model("plant_disease_model.pth")

transform = transforms.Compose([
    transforms.Resize(transform_config["resize"]),
    transforms.ToTensor()
])

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        if not contents or len(contents) == 0:
            raise ValueError("Empty file uploaded.")

        image_bytes = io.BytesIO(contents)

        try:
            image = Image.open(image_bytes)
            image.verify()  # Ensure image isn't corrupted
            image_bytes.seek(0)
            image = Image.open(image_bytes)
        except UnidentifiedImageError:
            raise ValueError("Invalid image format or unreadable image.")

        if image.mode != "RGB":
            image = image.convert("RGB")

        image_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)

        prediction = idx_to_class[predicted_idx.item()]
        confidence_score = round(confidence.item() * 100, 2)

        return JSONResponse(content={
            "label": prediction,
            "confidence": confidence_score
        })

    except Exception as e:
        logger.exception("Prediction error")
        return JSONResponse(status_code=500, content={
            "error": str(e)
        })

@app.get("/")
def health_check():
    return {"status": "OK", "message": "Plant disease detection API running"}
