type PostCardProps = {
  name: string;
  content: string;
  likes: number;
  comments: number;
};

export default function PostCard({ name, content, likes, comments }: PostCardProps) {
  return (
    <div className="mt-6 bg-white border border-[#E5E7EB] rounded-2xl p-5">
      <h2 className="font-semibold">
        {name}
      </h2>

      <p className="text-[#14161F] mt-3">
        {content}
      </p>

      <div className="text-[#6B7280] mt-4">
        ❤️ {likes} 💬 {comments}
      </div>
    </div>
  );
}