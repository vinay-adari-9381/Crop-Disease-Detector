
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useRouter } from "expo-router";





const plant_disease_info = {
  "Tomato___Late_blight": {
    description: "Devastating fungal disease caused by Phytophthora infestans.",
    symptoms: "Dark water-soaked lesions on leaves and stems, with white mold under humid conditions.",
    management: "Remove infected plants, apply copper-based fungicides, ensure proper air flow.",
    risk_factors: "Cool and wet weather."
  },
     "Tomato___Early_blight": {
        "description": "Fungal disease (Alternaria solani) affecting leaves/stems",
        "symptoms": "Concentric rings on leaves, yellowing, defoliation",
        "management": "Crop rotation, fungicide sprays (chlorothalonil), remove debris"
    },

    "Tomato___Septoria_leaf_spot": {
        "description": "Fungal disease (Septoria lycopersici) causing leaf spots",
        "symptoms": "Small circular spots with gray centers and dark edges",
        "management": "Avoid overhead watering, apply sulfur-based fungicides"
    },

    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": {
        "description": "Viral disease transmitted by whiteflies",
        "symptoms": "Upward leaf curling, yellowing, stunted growth",
        "management": "Control whiteflies (neem oil), remove infected plants"
    },
    "Tomato___Bacterial_spot": {
        "description": "Bacterial disease (Xanthomonas spp.)",
        "symptoms": "Small dark spots with yellow halos on leaves/fruits",
        "management": "Copper sprays, resistant varieties, avoid wet foliage"
    },
    "Tomato___Leaf_Mold": {
        "description": "Fungal disease (Passalora fulva) in humid conditions",
        "symptoms": "Yellow patches on upper leaves, gray mold underneath",
        "management": "Improve airflow, reduce humidity, apply fungicides"
    },

    "Tomato___Spider_mites Two-spotted_spider_mite": {
        "description": "Pest infestation (Tetranychus urticae)",
        "symptoms": "Fine webbing, stippling on leaves",
        "management": "Predatory mites, insecticidal soap, neem oil"
    },

  "Potato___Early_blight": {
    description: "Fungal disease (Alternaria solani)",
    symptoms: "Target-like leaf spots",
    management: "Reduce leaf wetness, fungicides"
  },
  "Pepper,bell__Bacterial_spot": {
    description: "Bacterial disease (Xanthomonas spp.)",
    symptoms: "Water-soaked leaf spots",
    management: "Copper sprays, resistant varieties"
  },
  "Strawberry___Leaf_scorch": {
    description: "Fungal disease (Diplocarpon earliana)",
    symptoms: "Purple spots with scorched appearance",
    management: "Remove infected leaves, improve airflow"
  },
   "Peach___healthy": {
        "description": "Healthy peach tree",
        "key_indicators": "No leaf curl, normal fruit set"
    },
    
    "Potato___Late_blight": {
        "description": "Same pathogen as tomato late blight",
        "symptoms": "Dark lesions on leaves/tubers",
        "management": "Destroy infected plants, fungicides"
    },
    
    "Tomato___Tomato_mosaic_virus": {
        "description": "Viral disease (ToMV)",
        "symptoms": "Mottled leaves, stunted growth",
        "management": "Remove infected plants, disinfect tools"
    },

        "Tomato___healthy": {
        "description": "Disease-free tomato plant",
        "key_indicators": "Vibrant green leaves, uniform fruit set"
    },
    "Grape___healthy": {
        "description": "Healthy grapevine",
        "key_indicators": "Firm canes, no leaf discoloration"
    },
    "Soybean___healthy": {
        "description": "Healthy soybean crop",
        "key_indicators": "Proper nodulation, uniform stand"
    },
    "Potato___healthy": {
        "description": "Disease-free potato plant",
        "key_indicators": "No lesions, vigorous growth"
    },
    "Corn_(maize)___healthy": {
        "description": "Healthy corn plants",
        "key_indicators": "Dark green leaves, proper ear development"
    },
    "Strawberry___healthy": {
        "description": "Disease-free strawberry plant",
        "key_indicators": "No leaf spots, normal fruit"
    },
    "Apple___healthy": {
        "description": "Healthy apple tree",
        "key_indicators": "No cankers, uniform fruit size"
    },
};


export default function ImageUploadMobile() {


  const [imageUri, setImageUri] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [speakEnabled, setSpeakEnabled] = useState(true); 
 
const router = useRouter();
  


  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert("Permission Denied", "Camera and media access are required.");
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setPrediction(null);
      await sendImageToBackend(uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setPrediction(null);
      await sendImageToBackend(uri);
    }
  };
const speakPrediction = (label) => {
  if (!speakEnabled) return;

  const info = plant_disease_info[label];
  if (!info) return;

  let speechText = `Prediction: ${label.replace(/[_]/g, ' ')}. 
  Description: ${info.description || "No description available"}. 
  Symptoms: ${info.symptoms || "No symptoms available"}. 
  Management: ${info.management || "No management tips available"}.`;

  Speech.speak(speechText, {
    rate: 1.0,
    pitch: 1.0,
    language: "en-US"
  });
};



const sendImageToBackend = async (uri) => {
  setLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: `leaf_${Date.now()}.jpg`,
      type: "image/jpeg"
    });

    const response = await axios.post(
      
      "https://95bf-2409-408c-2606-b6b3-fdfa-9849-9d44-9a8b.ngrok-free.app/predict/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true"
        },
        timeout: 15000
      }
    );

    const label = response.data.label;
    let confidence = parseFloat(response.data.confidence);
    if (isNaN(confidence)) confidence = 0.0;

    if (confidence < 60) {
      Alert.alert(
        "⚠️ Low Confidence",
        `The prediction confidence is only ${confidence.toFixed(2)}%. The result might not be accurate.`,
        [{ text: "OK" }]
      );
    }

    setPrediction({ class: label, confidence });
    speakPrediction(label);
  } catch (error) {
    console.log("Prediction Error:", error.message);
    Alert.alert("Something went wrong", "Check your backend server or internet.");
  } finally {
    setLoading(false);
  }
};


  const clearAll = () => {
    setImageUri(null);
    setPrediction(null);
    Speech.stop();
  };

  const toggleSpeech = () => {
    setSpeakEnabled(!speakEnabled);
    Speech.stop(); // stop ongoing speech
  };

  return (
    <ImageBackground
      source={require("../../assets/images/Backgroundimage.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>🌿 Crop Disease Detection</Text>


          {!imageUri && (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.choiceButton} onPress={pickImage}>
                <Text style={styles.choiceText}>📁 Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.choiceButton} onPress={takePhoto}>
                <Text style={styles.choiceText}>📷 Camera</Text>
              </TouchableOpacity>
            </View>
          )}
            

     
{!prediction && !loading && (
<TouchableOpacity style={styles.diseaseCard} onPress={() => router.push("/plant-list")}>
  <View style={styles.cardContent}>
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>Crops Whose Diseases Can Be Detected</Text>
      <Text style={styles.cardSubtitle}>
        Tap to view the list of crops whose diseases this app can detect.
      </Text>
    </View>
    <Image
      source={require("../../assets/images/virus.png")} // Update with actual image if needed
      style={styles.cardImage}
    />
  </View>
</TouchableOpacity>
)}


          {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}

          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#8BC34A" />
              <Text style={styles.processing}>Processing...</Text>
            </View>
          )}

          {prediction && (
            
 

            <View style={styles.result}>
              <Text style={styles.resultText}>prediction: {prediction.class}</Text>
              <Text style={styles.resultText}>
                Confidence: {prediction.confidence.toFixed(2)}%
              </Text>

              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Description</Text>
                <Text style={styles.infoText}>
                  {plant_disease_info[prediction.class]?.description || "N/A"}
                </Text>
                <Text style={styles.infoTitle}>Symptoms</Text>
                <Text style={styles.infoText}>
                  {plant_disease_info[prediction.class]?.symptoms || "N/A"}
                </Text>
                <Text style={styles.infoTitle}>Management</Text>
                <Text style={styles.infoText}>
                  {plant_disease_info[prediction.class]?.management || "N/A"}
                </Text>
              </View>
           
       <View style={{ alignItems: 'center' }}>
  <TouchableOpacity
    style={[styles.clearButton, { backgroundColor: "#2196F3" }]}
    onPress={() => speakPrediction(prediction.class)}
  >
    <Text style={styles.clearButtonText}>🔊 Speak Info</Text>
  </TouchableOpacity>

  <TouchableOpacity style={[styles.toggleButton, { marginTop: 10 }]} onPress={toggleSpeech}>
    <Text style={styles.toggleText}>{speakEnabled ? "🔈 Mute" : "🔇 Unmute"}</Text>
  </TouchableOpacity>
</View>


              
            </View>
          )}

          {prediction && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAll}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  container: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    flexGrow: 1
  },
  header: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "white" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 15
  },
  choiceButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 30,
  marginHorizontal: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  elevation: 4, // for Android shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 6
},
choiceText: {
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: 16,
  marginLeft: 6
},

 
  loader: { alignItems: "center", marginTop: 20 },
  processing: { marginTop: 10, fontSize: 16, color: "#fff" },
  result: {
    marginTop: 20,
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    width: "90%"
  },
  resultText: { fontSize: 18, color: "#333", marginVertical: 5 },
  infoBox: {
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 12,
    borderRadius: 8
  },
  infoTitle: { fontSize: 16, fontWeight: "bold", marginTop: 8 },
  infoText: { fontSize: 14, marginTop: 4, color: "#333" },
  clearButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    width: "60%",
    alignItems: "center"
  },
  clearButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  toggleButton: {
    backgroundColor: "#FFD700",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    width:"60%",
    alignItems:"centre"
  },
  toggleText: {
    fontSize: 14,
    color: "black",
    fontWeight: "bold"
  },

diseaseCard: {
  backgroundColor: '#f0f4f8', // Soft neutral blue-gray
  borderRadius: 12,
  padding: 15,
  marginVertical: 20,
  width: '100%',
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
},

cardContent: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

cardTextContainer: {
  flex: 1,
  paddingRight: 10,
},

cardTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#37474f', // Dark gray-blue for contrast
  marginBottom: 6,
},

cardSubtitle: {
  fontSize: 14,
  color: '#607d8b', // Muted slate blue
},

cardImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
},

});
