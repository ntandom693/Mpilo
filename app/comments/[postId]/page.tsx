"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CommentLikeButton from "@/components/CommentLikeButton";

type Comment = {
  id: number;
  content: string;
  authorName: string;
  authorAvatar: string | null;
  parent_comment_id: number | null;
  replies: Comment[];
};

type PostPreview = {
  content: string;
  authorName: string;
  authorAvatar: string | null;
};

export default function CommentsPage() {
  const params = useParams();
  const postId = params.postId as string;

  const [post, setPost] = useState<PostPreview | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    async function load() {
      const { data: postData } = await supabase
        .from("posts")
        .select("content, user_id")
        .eq("id", postId)
        .single();

      if (postData) {
        let authorName = "Someone";
        let authorAvatar = null;

        if (postData.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("user_id", postData.user_id)
            .single();

          if (profile) {
            authorName = `${profile.first_name} ${profile.last_name?.charAt(0) || ""}.`;
            authorAvatar = profile.avatar_url;
          }
        }

        setPost({
          content: postData.content,
          authorName,
          authorAvatar,
        });
      }

      await loadComments();
      setLoading(false);
    }

    load();
  }, [postId]);


  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });


    if (data) {
      const withDetails = await Promise.all(
        data.map(async (comment) => {

          let authorName = "Someone";
          let authorAvatar = null;


          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, avatar_url")
            .eq("user_id", comment.user_id)
            .single();


          if (profile) {
            authorName = `${profile.first_name} ${profile.last_name?.charAt(0) || ""}.`;
            authorAvatar = profile.avatar_url;
          }


          return {
            ...comment,
            authorName,
            authorAvatar,
            replies: [] as Comment[],
          };

        })
      );


      const topLevel = withDetails.filter(
        (comment) => !comment.parent_comment_id
      );


      const withReplies = topLevel.map((comment) => ({
        ...comment,
        replies: withDetails.filter(
          (reply) =>
            reply.parent_comment_id === comment.id
        ),
      }));


      setComments(withReplies);
    }
  }


  async function handlePostComment() {
    setPosting(true);


    const { data: sessionData } =
      await supabase.auth.getSession();


    if (!sessionData.session) {
      window.location.href = "/signup";
      return;
    }


    await supabase.from("comments").insert({
      post_id: Number(postId),
      user_id: sessionData.session.user.id,
      content: text,
    });


    setText("");
    setPosting(false);

    loadComments();
  }



  async function handlePostReply(parentId: number) {

    const { data: sessionData } =
      await supabase.auth.getSession();


    if (!sessionData.session) {
      window.location.href = "/signup";
      return;
    }


    await supabase.from("comments").insert({
      post_id: Number(postId),
      user_id: sessionData.session.user.id,
      content: replyText,
      parent_comment_id: parentId,
    });


    setReplyText("");
    setReplyingTo(null);

    loadComments();
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <p className="text-[#9297A1] text-sm">
          Loading comments...
        </p>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#111318] pb-28">

      {/* TOP BAR */}
      <header className="px-5 pt-6 flex items-center justify-between">

        <Link href="/feed">
          <div className="w-10 h-10 rounded-full bg-white border border-[#E7E9ED] flex items-center justify-center active:scale-90 transition">
            <span className="text-[20px]">
              ←
            </span>
          </div>
        </Link>

        <p className="text-[12px] font-semibold tracking-[0.12em] text-[#9297A1]">
          COMMENTS
        </p>

        <div className="w-10 h-10" />

      </header>



      {/* POST PREVIEW */}

      {post && (

        <section className="px-6 mt-8">

          <div className="bg-white border border-[#E7E9ED] rounded-[24px] p-4">

            <div className="flex gap-3">

              {post.authorAvatar ? (

                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                />

              ) : (

                <div className="w-11 h-11 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold">
                  {post.authorName.charAt(0)}
                </div>

              )}


              <div className="min-w-0">

                <p className="text-[15px] font-semibold">
                  {post.authorName}
                </p>

                <p className="text-[14px] text-[#333842] mt-1 leading-relaxed">
                  {post.content}
                </p>

              </div>


            </div>

          </div>

        </section>

      )}




      {/* COMMENTS LIST */}

      <section className="px-6 mt-7 space-y-5">


        {comments.length === 0 && (

          <div className="bg-white border border-[#E7E9ED] rounded-[22px] px-6 py-12 text-center">

            <p className="text-[15px] font-semibold">
              No comments yet.
            </p>

            <p className="text-[12px] text-[#9297A1] mt-2">
              Start the conversation.
            </p>

          </div>

        )}




        {comments.map((comment)=>(

          <div key={comment.id}>


            {/* COMMENT */}

            <div className="flex gap-3">


              {comment.authorAvatar ? (

                <img
                  src={comment.authorAvatar}
                  alt={comment.authorName}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />

              ) : (

                <div className="w-10 h-10 rounded-full bg-[#111318] text-white flex items-center justify-center font-semibold">
                  {comment.authorName.charAt(0)}
                </div>

              )}




              <div className="flex-1">


                <div className="bg-white border border-[#E7E9ED] rounded-[20px] px-4 py-3">


                  <p className="text-[14px] font-semibold">
                    {comment.authorName}
                  </p>


                  <p className="text-[14px] text-[#333842] mt-1 leading-relaxed">
                    {comment.content}
                  </p>



                  <div className="flex items-center gap-4 mt-3">


                    <CommentLikeButton
                      commentId={comment.id}
                    />


                    <button
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id
                            ? null
                            : comment.id
                        )
                      }
                      className="text-[12px] font-semibold text-[#9297A1]"
                    >
                      Reply
                    </button>


                  </div>




                  {replyingTo === comment.id && (

                    <div className="flex gap-2 mt-3">


                      <input
                        value={replyText}
                        onChange={(e)=>setReplyText(e.target.value)}
                        placeholder={`Reply to ${comment.authorName}`}
                        className="flex-1 bg-[#F7F8FA] border border-[#E7E9ED] rounded-full px-4 py-2 text-[13px] outline-none"
                      />


                      <button
                        onClick={()=>handlePostReply(comment.id)}
                        disabled={replyText.trim()===""}
                        className="bg-[#111318] text-white px-4 rounded-full text-[12px] font-semibold disabled:opacity-40"
                      >
                        Send
                      </button>


                    </div>

                  )}


                </div>






                {/* REPLIES */}

                {comment.replies.length > 0 && (

                  <div className="ml-10 mt-3 space-y-3">


                    {comment.replies.map((reply)=>(


                      <div
                        key={reply.id}
                        className="flex gap-3"
                      >


                        {reply.authorAvatar ? (

                          <img
                            src={reply.authorAvatar}
                            alt={reply.authorName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />

                        ) : (

                          <div className="w-8 h-8 rounded-full bg-[#111318] text-white flex items-center justify-center text-xs">
                            {reply.authorName.charAt(0)}
                          </div>

                        )}



                        <div className="bg-white border border-[#E7E9ED] rounded-[18px] px-3 py-2">


                          <p className="text-[12px] font-semibold">
                            {reply.authorName}
                          </p>


                          <p className="text-[13px] mt-1 leading-relaxed">
                            {reply.content}
                          </p>


                          <div className="mt-2">
                            <CommentLikeButton
                              commentId={reply.id}
                            />
                          </div>


                        </div>


                      </div>


                    ))}


                  </div>

                )}


              </div>


            </div>


          </div>


        ))}


      </section>





      {/* COMMENT INPUT */}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7E9ED] px-5 py-3">


        <div className="flex items-center gap-3">


          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-[#F7F8FA] border border-[#E7E9ED] rounded-full px-5 py-3 text-[14px] outline-none"
          />


          <button
            onClick={handlePostComment}
            disabled={
              text.trim()==="" || posting
            }
            className="w-12 h-12 rounded-full bg-[#111318] text-white text-lg font-semibold active:scale-95 transition disabled:opacity-40"
          >
            ↑
          </button>


        </div>


      </div>


    </main>
  );
}