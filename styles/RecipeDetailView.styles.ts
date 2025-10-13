import { StyleSheet } from "react-native";
import { widthPercentageToDP as wp } from "react-native-responsive-screen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  backBtn: { padding: 6 },
  headerBtn: { padding: 6 },
  image: {
    width: wp("95%"),
    height: wp("55%"),
    borderRadius: 10,
    margin: 10,
    alignSelf: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 8,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  author: { fontWeight: "bold", fontSize: 16 },
  time: { color: "#888", fontSize: 12 },
  title: { fontSize: 22, fontWeight: "bold", margin: 12 },
  card: {
    backgroundColor: "#f9f9f9",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
  },
  cardLarge: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 8,
  },
  cardTitle: { fontWeight: "bold", marginBottom: 4 },
  cardDesc: { color: "#666" },
  section: { fontWeight: "bold", margin: 12, fontSize: 16 },
  videoCard: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#e6f2ff",
    margin: 12,
    borderRadius: 8,
  },
});

export default styles;
