"use client";
import React, { use } from "react";
import { MessageCircleQuestion } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { surfaceStyle } from "@/app/styles";
import DashboardWrapper from "@/components/DashboardWrapper";
import PageLoading from "@/_components/Shared/PageLoading";
import PageError from "@/_components/Shared/PageError";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDateTime } from "@/utils/dateUtils";
import { normalizeDbDate } from "@/utils/normalizeDbDate";
import ClarificationItem from "./_components/ClarificationItem";

const describeQuestionWindow = (deadline: Date | string | null) => {
  const closesAt = normalizeDbDate(deadline);
  if (!closesAt) return "No question deadline is set for this tender.";

  return closesAt > new Date()
    ? `Vendors can ask questions until ${formatDisplayDateTime(deadline)}.`
    : `The question period closed on ${formatDisplayDateTime(deadline)}.`;
};

const TenderClarificationsPage = ({
  params,
}: {
  params: Promise<{ tenderId: string }>;
}) => {
  const { tenderId } = use(params);
  const id = Number(tenderId);

  const { data, isLoading, isError, refetch } =
    trpc.clarification.getForAdmin.useQuery({ tenderId: id });

  return (
    <DashboardWrapper
      title='Tender Clarifications'
      description="Answer vendor questions. Answers are published on the tender page without the vendor's name."
      showBackButton={true}>
      {isLoading ? (
        <PageLoading />
      ) : isError || !data ? (
        <PageError onRetry={() => refetch()} />
      ) : (
        <div className='space-y-6'>
          <section className={cn(surfaceStyle, "px-5 py-4")}>
            <p className='text-xs font-medium text-slate-500'>
              Tender #{data.tender.tender_number || data.tender.tender_id}
            </p>
            <h2 className='mt-0.5 text-base font-semibold text-slate-900'>
              {capitalizeFirstLetter(data.tender.tender_title) ||
                "Untitled tender"}
            </h2>
            <p className='mt-1 text-xs text-slate-500'>
              {describeQuestionWindow(data.tender.questionDeadline)}
            </p>
          </section>

          {data.clarifications.length === 0 ? (
            <section
              className={cn(
                surfaceStyle,
                "flex flex-col items-center px-5 py-16 text-center",
              )}>
              <span className='flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <MessageCircleQuestion
                  aria-hidden
                  className='size-5'
                />
              </span>
              <p className='mt-3 text-sm font-medium text-slate-900'>
                No questions yet
              </p>
              <p className='mt-1 text-sm text-slate-500'>
                Questions from vendors about this tender will appear here.
              </p>
            </section>
          ) : (
            <ul className='space-y-4'>
              {data.clarifications.map((clarification) => (
                <ClarificationItem
                  key={clarification.clar_id}
                  tenderId={id}
                  clarification={clarification}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </DashboardWrapper>
  );
};

export default TenderClarificationsPage;
