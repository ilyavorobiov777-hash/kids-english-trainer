import { TextReader } from "@/components/text-reader";

export default function ChildTextPage({ params }: { params: { textId: string } }) {
  return <TextReader textId={params.textId} />;
}
