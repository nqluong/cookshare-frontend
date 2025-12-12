import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../../styles/colors";
import { IndividualReport } from "../../../types/admin/groupedReport.types";
import ReportItemCard from "./ReportItemCard";

interface IndividualReportsListProps {
  reports: IndividualReport[];
}

export default function IndividualReportsList({ reports }: IndividualReportsListProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Chi tiết các báo cáo ({reports?.length || 0})
      </Text>
      {reports && reports.length > 0 ? (
        reports.map((report, index) => (
          <ReportItemCard key={report.reportId || index} report={report} />
        ))
      ) : (
        <Text style={styles.noReportsText}>Không có báo cáo nào</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  noReportsText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    paddingVertical: 20,
  },
});
