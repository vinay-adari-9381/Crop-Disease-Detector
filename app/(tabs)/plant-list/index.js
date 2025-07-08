import { ScrollView, StyleSheet, Text } from "react-native";
const supportedPlants = [
  "Apple",
  "Corn",
  "Grape",
  "Orange",
  "Peach",
  "Bell Pepper",
  "Blueberry",
  "Cherry",
  "Potato",
  "Tomato",
  "Raspberry",
  "Soybean",
  "Squash",
  "Strawberry"
];

export default function PlantListScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Crops Whose Diseases Can Be Detected</Text>

      <Text style={styles.description}>
        This app can detect up to 38 diseases in 14 different plants and trees. Only a picture of the leaf is needed.
      </Text>

      <Text style={styles.subheading}>Those are:</Text>
      {supportedPlants.map((plant, index) => (
        <Text key={index} style={styles.plantItem}>{index + 1}) {plant}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "flex-start",
    backgroundColor: "#e0ffe0",
    flexGrow: 1
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    marginBottom: 12,
    marginTop:30
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333"
  },
  subheading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  plantItem: {
    fontSize: 16,
    marginVertical: 4
  }
});