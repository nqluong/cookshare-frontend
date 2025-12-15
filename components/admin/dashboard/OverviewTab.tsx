import { RecipeCompletionStatsDTO, RecipeOverviewDTO } from "@/types/admin/report.types";
import { View } from "react-native";
import CategoriesDistribution from "./overview/CategoriesDistribution";
import CompletionStats from "./overview/CompletionStats";
import DifficultyDistribution from "./overview/DifficultyDistribution";
import StatsCards from "./overview/StatsCards";

interface OverviewTabProps {
  overview: RecipeOverviewDTO | null;
  completionStats: RecipeCompletionStatsDTO | null;
}

export default function OverviewTab({ overview, completionStats }: OverviewTabProps) {
  return (
    <View>
      <StatsCards overview={overview} />
      {/* <GrowthRates overview={overview} /> */}
      <CategoriesDistribution overview={overview} />
      <DifficultyDistribution overview={overview} />
      {completionStats && <CompletionStats completionStats={completionStats} />}
    </View>
  );
}