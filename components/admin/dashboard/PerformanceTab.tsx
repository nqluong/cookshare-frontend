import {
  CategoryPerformanceDTO,
  RecipePerformanceDTO,
  TimeSeriesStatDTO,
  TrendingRecipeDTO,
} from "@/types/admin/report.types";
import { View } from "react-native";
import CategoryPerformance from "./performance/CategoryPerformance";
import TimeSeriesChart from "./performance/TimeSeriesChart";
import TopRecipesList from "./performance/TopRecipesList";
import TrendingRecipes from "./performance/TrendingRecipes";

interface PerformanceTabProps {
  timeSeries: TimeSeriesStatDTO[];
  trending: TrendingRecipeDTO[];
  topViewed: RecipePerformanceDTO[];
  topLiked: RecipePerformanceDTO[];
  categoryPerformance: CategoryPerformanceDTO[];
  timeRangeDays: number;
  onTimeRangeChange: (days: number) => void;
}

export default function PerformanceTab({
  timeSeries,
  trending,
  topViewed,
  topLiked,
  categoryPerformance,
  timeRangeDays,
  onTimeRangeChange,
}: PerformanceTabProps) {
  return (
    <View>
      <TimeSeriesChart
        timeSeries={timeSeries}
        timeRangeDays={timeRangeDays}
        onTimeRangeChange={onTimeRangeChange}
      />
      <TrendingRecipes trending={trending} />
      <TopRecipesList
        title="👁️ Xem Nhiều Nhất"
        recipes={topViewed}
        showStats={["views", "likes", "saves"]}
      />
      <TopRecipesList
        title="❤️ Yêu Thích Nhất"
        recipes={topLiked}
        showStats={["likes", "rating"]}
      />
      <CategoryPerformance categoryPerformance={categoryPerformance} />
    </View>
  );
}