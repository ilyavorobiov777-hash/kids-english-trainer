import { WordLearningFlow } from "@/components/word-learning-flow";

export default function TopicWordsPage({ params }: { params: { topicId: string } }) {
  return <WordLearningFlow mode="topic" topicId={params.topicId} />;
}
