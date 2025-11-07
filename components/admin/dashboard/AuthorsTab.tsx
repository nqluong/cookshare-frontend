// components/admin/dashboard/AuthorsTab.tsx
import { TopAuthorDTO } from "@/types/admin/report.types";
import { View } from "react-native";
import AuthorsList from "./authors/AuthorsList";

interface AuthorsTabProps {
  topAuthors: TopAuthorDTO[];
}

export default function AuthorsTab({ topAuthors }: AuthorsTabProps) {
  return (
    <View>
      <AuthorsList topAuthors={topAuthors} />
    </View>
  );
}