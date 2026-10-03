"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, MessageCircleQuestion } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ROLES } from "@/lib/server/constants";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import StatusBadge from "@/_components/Shared/StatusBadge";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateUtils";

const MAX_QUESTION_LENGTH = 1000;

const AskQuestionForm = ({ tenderId }: { tenderId: number }) => {
  const [question, setQuestion] = useState("");
  const utils = trpc.useUtils();

  const ask = trpc.clarification.ask.useMutation({
    onSuccess: () => {
      toast.success("Question submitted. You'll be notified when it is answered.");
      setQuestion("");
      utils.clarification.getForTender.invalidate({ tenderId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    ask.mutate({ tenderId, question });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-2'>
      <label
        htmlFor='clarification-question'
        className='text-sm font-medium text-slate-900'>
        Ask a question
      </label>
      <Textarea
        id='clarification-question'
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={MAX_QUESTION_LENGTH}
        rows={3}
        placeholder='For example: Can the project duration be extended for phased delivery?'
        className='resize-y bg-white'
      />
      <div className='flex items-center justify-between gap-3'>
        <p className='text-xs text-slate-500'>
          Your name is not shown with published answers.{" "}
          <span className='tabular-nums'>
            {question.length}/{MAX_QUESTION_LENGTH}
          </span>
        </p>
        <Button
          type='submit'
          size='sm'
          disabled={ask.isPending || question.trim().length < 10}>
          {ask.isPending && <Loader2 className='size-4 animate-spin' />}
          Submit question
        </Button>
      </div>
    </form>
  );
};

interface Props {
  tenderId: number;
}

const TenderClarifications = ({ tenderId }: Props) => {
  const { data: session, status } = useSession();
  const { data, isError } = trpc.clarification.getForTender.useQuery(
    { tenderId },
    { retry: false },
  );

  // Hidden while loading and when clarifications are unavailable
  if (isError || !data) return null;

  const { clarifications, myPending, questionDeadline, isWindowOpen, canAsk } =
    data;
  const isVendor = session?.user?.role === ROLES.VENDOR;

  return (
    <section
      id='clarifications'
      aria-labelledby='clarifications-heading'
      className='scroll-mt-20 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm'>
      <div className='border-b border-neutral-100 px-5 py-4'>
        <h2
          id='clarifications-heading'
          className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
          <MessageCircleQuestion
            aria-hidden
            className='size-4 text-primary'
          />
          Clarifications
        </h2>
        <p className='mt-1 text-xs text-slate-600'>
          {isWindowOpen && questionDeadline
            ? `Questions are accepted until ${formatDisplayDateTime(questionDeadline)}.`
            : "The question period for this tender has closed."}
        </p>
      </div>

      <div className='space-y-6 p-5'>
        {canAsk && <AskQuestionForm tenderId={tenderId} />}

        {isWindowOpen && !canAsk && status !== "loading" && (
          <p className='rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600'>
            {!session ? (
              <>
                <Link
                  href='/sign-in'
                  className='font-medium text-primary hover:underline'>
                  Sign in
                </Link>{" "}
                as a vendor to ask a question about this tender.
              </>
            ) : isVendor ? (
              "Only approved vendors can ask questions."
            ) : (
              "Questions are asked by vendors and answered from the admin console."
            )}
          </p>
        )}

        {myPending.length > 0 && (
          <div>
            <h3 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
              Your questions
            </h3>
            <ul className='mt-2 space-y-2'>
              {myPending.map((item) => (
                <li
                  key={item.clar_id}
                  className='flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2'>
                  <div className='min-w-0'>
                    <p className='text-sm text-slate-800'>
                      {item.clar_question}
                    </p>
                    <p className='mt-0.5 text-xs text-slate-500'>
                      Asked {formatDisplayDate(item.created_at)}
                    </p>
                  </div>
                  <StatusBadge
                    status='pending'
                    label='Awaiting response'
                    className='shrink-0'
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {clarifications.length === 0 ? (
          <p className='text-sm text-slate-500'>
            No clarifications have been published yet.
          </p>
        ) : (
          <ol className='space-y-4'>
            {clarifications.map((item, index) => (
              <li
                key={item.clar_id}
                className='rounded-md border border-slate-200'>
                <p className='px-4 pt-3 text-sm font-medium text-slate-900'>
                  <span className='mr-1.5 text-slate-400'>Q{index + 1}.</span>
                  {item.clar_question}
                </p>
                <div className='mt-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3'>
                  <p className='whitespace-pre-line text-sm text-slate-700'>
                    {item.clar_answer}
                  </p>
                  {item.clar_answered_at && (
                    <p className='mt-1 text-xs text-slate-500'>
                      Answered {formatDisplayDate(item.clar_answered_at)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
};

export default TenderClarifications;
