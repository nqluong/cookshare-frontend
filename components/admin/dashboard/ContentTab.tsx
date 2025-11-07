// components/admin/dashboard/ContentTab.tsx
import {
  RecipeContentAnalysisDTO,
  RecipePerformanceDTO,
} from "@/types/admin/report.types";
import { View } from "react-native";
import LowPerformanceRecipes from "./content/LowPerformanceRecipes";
import MediaStats from "./content/MediaStats";
import RecipeComposition from "./content/RecipeComposition";
import TextLengthStats from "./content/TextLengthStats";
import TimeStats from "./content/TimeStats";

interface ContentTabProps {
  contentAnalysis: RecipeContentAnalysisDTO | null;
  lowPerformance: RecipePerformanceDTO[];
}

export default function ContentTab({ contentAnalysis, lowPerformance }: ContentTabProps) {
  return (
    <View>
      {contentAnalysis && (
        <>
          <TimeStats contentAnalysis={contentAnalysis} />
          <RecipeComposition contentAnalysis={contentAnalysis} />
          <MediaStats contentAnalysis={contentAnalysis} />
          <TextLengthStats contentAnalysis={contentAnalysis} />
        </>
      )}
      <LowPerformanceRecipes lowPerformance={lowPerformance} />
    </View>
  );
}