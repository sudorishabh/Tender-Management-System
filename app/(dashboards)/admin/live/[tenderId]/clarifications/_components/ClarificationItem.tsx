"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/Shared/StatusBadge";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateUtils";

const MAX_ANSWER_LENGTH = 2000;

export interface AdminClarification {
  clar_id: number;
  clar_question: string;
  clar_answer: string | null;
  clar_answered_at: Date | string | null;
  created_at: Date | string;
  business_name: string | null;
}

interface Props {
  tenderId: number;
  clarification: AdminClarification;
}

const ClarificationItem = ({ tenderId, clarification }: Props) => {
  const isAnswered = clarification.clar_answer !== null;
  const [isEditing, setIsEditing] = useState(!isAnswered);
  const [draft, setDraft] = useState(clarification.clar_answer ?? "");
  const utils = trpc.useUtils();

  const answer = trpc.clarification.answer.useMutation({
    onSuccess: () => {
      toast.success(isAnswered ? "Answer updated" : "Answer published");
      setIsEditing(false);
      utils.clarification.getForAdmin.invalidate({ tenderId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    answer.mutate({ clarificationId: clarification.clar_id, answer: draft });
  };

  const handleCancel = () => {
    setDraft(clarification.clar_answer ?? "");
    setIsEditing(false);
  };

  const answerFieldId = `clarification-answer-${clarification.clar_id}`;

  return (
    <li className={cn(surfaceStyle, "overflow-hidden")}>
      <div className='flex items-start justify-between gap-4 p-5'>
        <div className='min-w-0'>
          <p className='whitespace-pre-line text-sm font-medium text-slate-900'>
            {clarification.clar_question}
          </p>
          <p className='mt-1 text-xs text-slate-500'>
            {clarification.business_name || "Unknown vendor"} · Asked{" "}
            {formatDisplayDateTime(clarification.created_at)}
          </p>
        </div>
        <StatusBadge
          status={isAnswered ? "published" : "pending"}
          label={isAnswered ? "Answered" : "Awaiting answer"}
          className='shrink-0'
        />
      </div>

      <div className='border-t border-slate-100 bg-slate-50/60 px-5 py-4'>
        {isEditing ? (
          <form
            onSubmit={handleSubmit}
            className='space-y-2'>
            <label
              htmlFor={answerFieldId}
              className='text-xs font-medium text-slate-700'>
              {isAnswered ? "Edit answer" : "Your answer"}
            </label>
            <Textarea
              id={answerFieldId}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={MAX_ANSWER_LENGTH}
              rows={3}
              className='resize-y bg-white'
            />
            <div className='flex items-center justify-between gap-3'>
              <p className='text-xs text-slate-500'>
                Published on the tender page without the vendor&apos;s name.
              </p>
              <div className='flex items-center gap-2'>
                {isAnswered && (
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
                <Button
                  type='submit'
                  size='sm'
                  disabled={answer.isPending || draft.trim().length === 0}>
                  {answer.isPending && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  {isAnswered ? "Save answer" : "Publish answer"}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <p className='whitespace-pre-line text-sm text-slate-700'>
                {clarification.clar_answer}
              </p>
              {clarification.clar_answered_at && (
                <p className='mt-1 text-xs text-slate-500'>
                  Answered {formatDisplayDate(clarification.clar_answered_at)}
                </p>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              className='shrink-0 text-primary hover:text-primary'
              onClick={() => setIsEditing(true)}>
              Edit answer
            </Button>
          </div>
        )}
      </div>
    </li>
  );
};

export default ClarificationItem;
