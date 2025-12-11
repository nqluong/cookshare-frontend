// app/admin/reports/[id].tsx
import { useLocalSearchParams } from "expo-router";
import ReportDetailScreen from "../../../screens/admin/ReportDetailScreen";

export default function ReportDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return <ReportDetailScreen recipeId={id || ""} />;
}
