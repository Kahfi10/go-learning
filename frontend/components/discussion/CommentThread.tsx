"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, Reply, Trash2, Pin, ChevronDown, ChevronUp } from "lucide-react";
import { api, type Comment } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { timeAgo, cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  topicSlug: string;
  lessonId: string;
  lang?: "id" | "en";
}

function draftKey(topicSlug: string, lessonId: string) {
  return `golearn_discussion_draft_${topicSlug}_${lessonId}`;
}

function replyDraftKey(topicSlug: string, lessonId: string, parentId: string) {
  return `golearn_discussion_reply_${topicSlug}_${lessonId}_${parentId}`;
}

export default function CommentThread({ topicSlug, lessonId, lang = "id" }: Props) {
  const router = useRouter();
  const { state } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [sort, setSort] = useState<"newest" | "upvotes">("newest");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setContent(localStorage.getItem(draftKey(topicSlug, lessonId)) ?? "");
  }, [lessonId, topicSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(draftKey(topicSlug, lessonId), content);
  }, [content, lessonId, topicSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || !replyTo) return;
    setReplyContent(localStorage.getItem(replyDraftKey(topicSlug, lessonId, replyTo)) ?? "");
  }, [lessonId, replyTo, topicSlug]);

  useEffect(() => {
    if (typeof window === "undefined" || !replyTo) return;
    localStorage.setItem(replyDraftKey(topicSlug, lessonId, replyTo), replyContent);
  }, [lessonId, replyContent, replyTo, topicSlug]);

  useEffect(() => {
    setLoading(true);
    api.discussions.get(topicSlug, lessonId, sort)
      .then((d) => setComments(d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicSlug, lessonId, sort]);

  useEffect(() => {
    if (!comments.length) return;
    import("gsap").then(({ gsap }) => {
      gsap.fromTo(
        ".comment-thread-item",
        { y: 10, opacity: 0.001 },
        { y: 0, opacity: 1, duration: 0.35, ease: "expo.out", stagger: 0.04 }
      );
    });
  }, [comments]);

  const loginHref = `/login?next=${encodeURIComponent(`/modules/${topicSlug}/${lessonId}?tab=discussion`)}`;

  function redirectToLogin(message: string) {
    toast.error(message);
    router.push(loginHref);
  }

  async function submitComment(parentId?: string) {
    const text = parentId ? replyContent : content;
    if (!text.trim()) return;
    if (!state.user) { redirectToLogin("Login untuk berkomentar"); return; }
    setSubmitting(true);
    try {
      await api.discussions.create({ topic_slug: topicSlug, lesson_id: lessonId, content: text, parent_id: parentId });
      if (typeof window !== "undefined") {
        if (parentId) {
          localStorage.removeItem(replyDraftKey(topicSlug, lessonId, parentId));
        } else {
          localStorage.removeItem(draftKey(topicSlug, lessonId));
        }
      }
      if (parentId) { setReplyContent(""); setReplyTo(null); }
      else setContent("");
      const updated = await api.discussions.get(topicSlug, lessonId, sort);
      setComments(updated ?? []);
      toast.success("Komentar ditambahkan");
    } catch (e: any) {
      toast.error(e.message ?? "Gagal mengirim komentar");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleUpvote(id: string) {
    if (!state.user) { redirectToLogin("Login untuk upvote"); return; }
    try {
      const res = await api.discussions.upvote(id) as any;
      setComments(prev => prev.map(c => {
        if (c.id === id) return { ...c, upvotes: c.upvotes + (res.upvoted ? 1 : -1) };
        return c;
      }));
    } catch {}
  }

  async function deleteComment(id: string) {
    try {
      await api.discussions.delete(id);
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success("Komentar dihapus");
    } catch (e: any) {
      toast.error(e.message ?? "Gagal menghapus");
    }
  }

  const roots = comments.filter(c => !c.parent_id);
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="mt-6 rounded-[22px] border border-[#D2D2D7]/35 dark:border-white/6 bg-[#FAFAFB] dark:bg-[#111214] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0071E3] mb-2">
            Community Notes
          </p>
          <p className="font-display font-semibold text-[22px] text-foreground tracking-tight">
            {lang === "id" ? "Diskusi lesson" : "Lesson discussion"}
          </p>
          <p className="mt-1 text-[13px] text-[#86868B]">
            {roots.length} thread aktif untuk lesson ini.
          </p>
        </div>
        <div className="flex gap-2">
          {(["newest", "upvotes"] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
              className={cn("text-[12px] font-medium px-3 py-1 rounded-full transition-colors",
                sort === s ? "bg-[#0071E3] text-white" : "bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868B] hover:text-foreground")}>
              {s === "newest" ? (lang === "id" ? "Terbaru" : "Newest") : (lang === "id" ? "Terpopuler" : "Top")}
            </button>
          ))}
        </div>
      </div>

      {/* New comment form */}
      {state.user ? (
        <div className="mb-6 rounded-[18px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#17181A] p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86868B] mb-3">
            Tulis insight atau pertanyaan
          </p>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder={lang === "id" ? "Tulis komentar atau pertanyaan..." : "Write a comment or question..."}
            rows={3}
            className="w-full bg-[#F7F7F8] dark:bg-[#111214] rounded-[14px] border border-[#D2D2D7]/35 dark:border-white/6 px-4 py-3 text-[14px] text-foreground outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]/30 resize-none transition-all" />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[12px] text-[#86868B]">
              {lang === "id" ? "Berbagi konteks akan membantu learner lain lebih cepat paham." : "Sharing context helps other learners faster."}
            </p>
            <button onClick={() => submitComment()} disabled={submitting || !content.trim()}
            className="bg-[#0071E3] text-white text-[13px] font-medium px-4 py-2 rounded-full hover:bg-[#0077ED] transition-colors disabled:opacity-50 shrink-0">
            {submitting ? "Mengirim..." : lang === "id" ? "Kirim" : "Send"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-[18px] border border-[#D2D2D7]/35 dark:border-white/6 bg-white dark:bg-[#17181A] p-4 sm:p-5">
          <p className="text-[#86868B] text-[13px]">
            <a href={loginHref} className="text-[#0071E3] hover:underline">Login</a> untuk berkomentar.
          </p>
        </div>
      )}

      {/* Comments */}
      {loading && <p className="text-[#86868B] text-[13px]">Memuat diskusi...</p>}
      <div className="space-y-4">
        {roots.map(c => (
          <CommentItem key={c.id} comment={c} replies={replies(c.id)}
            onUpvote={toggleUpvote} onDelete={deleteComment}
            onReply={setReplyTo} replyTo={replyTo}
            replyContent={replyContent} onReplyChange={setReplyContent}
            onReplySubmit={() => submitComment(c.id)}
            isMe={state.user?.id === c.user_id} submitting={submitting} lang={lang} />
        ))}
      </div>
    </div>
  );
}

function CommentItem({ comment: c, replies, onUpvote, onDelete, onReply, replyTo, replyContent, onReplyChange, onReplySubmit, isMe, submitting, lang }: any) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="comment-thread-item bg-white dark:bg-[#17181A] rounded-[18px] p-4 sm:p-5 border border-[#D2D2D7]/35 dark:border-white/6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#0071E3] flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0 shadow-sm">
          {c.user_name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[13px] font-semibold text-foreground">{c.user_name}</span>
            {c.is_pinned && <span className="text-[10px] bg-[#0071E3]/10 text-[#0071E3] px-2 py-0.5 rounded-full flex items-center gap-1"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
            <span className="text-[11px] text-[#86868B]">{timeAgo(c.created_at)}</span>
          </div>
          <p className="text-[14px] text-foreground leading-relaxed mt-2">{c.content}</p>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => onUpvote(c.id)} className="flex items-center gap-1 text-[12px] text-[#86868B] hover:text-[#0071E3] transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" /> {c.upvotes}
            </button>
            <button onClick={() => onReply(replyTo === c.id ? null : c.id)} className="flex items-center gap-1 text-[12px] text-[#86868B] hover:text-[#0071E3] transition-colors">
              <Reply className="w-3.5 h-3.5" /> {lang === "id" ? "Balas" : "Reply"}
            </button>
            {isMe && (
              <button onClick={() => onDelete(c.id)} className="flex items-center gap-1 text-[12px] text-[#FF453A] hover:opacity-80 transition-opacity ml-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyTo === c.id && (
            <div className="mt-4 rounded-[14px] border border-[#D2D2D7]/30 dark:border-white/5 bg-[#F7F7F8] dark:bg-[#111214] p-3.5">
              <textarea value={replyContent} onChange={e => onReplyChange(e.target.value)}
                placeholder="Tulis balasan..." rows={2}
                className="w-full bg-background rounded-[10px] px-3 py-2 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-[#0071E3]/20 resize-none border border-[#D2D2D7]/40 dark:border-white/8" />
              <button onClick={onReplySubmit} disabled={submitting || !replyContent.trim()}
                className="mt-1.5 bg-[#0071E3] text-white text-[12px] font-medium px-3 py-1.5 rounded-full hover:bg-[#0077ED] transition-colors disabled:opacity-50">
                Kirim Balasan
              </button>
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-[#D2D2D7]/40 dark:border-white/8 pl-4">
              {replies.map((r: Comment) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#34C759] flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 shadow-sm">
                    {r.user_name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="rounded-[12px] bg-[#F7F7F8] dark:bg-[#111214] px-3 py-2 border border-[#D2D2D7]/25 dark:border-white/5">
                    <span className="text-[12px] font-semibold text-foreground">{r.user_name} </span>
                    <span className="text-[11px] text-[#86868B]">{timeAgo(r.created_at)}</span>
                    <p className="text-[13px] text-foreground mt-0.5">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
