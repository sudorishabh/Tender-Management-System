"use client";
import React from "react";
import { MessageCircleQuestion } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { RecentActivityPanel } from "@/components/Dashboard/RecentActivityPanel";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { formatDisplayDate } from "@/utils/dateUtils";
import SidebarRow from "./SidebarRow";

/**
 * Latest answered vendor questions on open tenders, each linking to the
 * tender's questions section. Hidden when there are none.
 */
const AnsweredQuestionsCard = () => {
  const { data } = trpc.clarification.getRecentAnswered.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const clarifications = data?.clarifications ?? [];
  if (clarifications.length === 0) return null;

  return (
    <RecentActivityPanel
      title='Recently answered'
      icon={MessageCircleQuestion}
      emptyMessage='No answered questions yet'
      isEmpty={false}>
      {clarifications.map((item) => (
        <SidebarRow
          key={item.clar_id}
          href={`/tender/${item.tender_id}#clarifications`}
          title={item.clar_question}
          note={item.clar_answer}
          meta={capitalizeFirstLetter(item.tender_title) || "Untitled tender"}>
          {item.clar_answered_at && (
            <span className='shrink-0 text-xs text-slate-400'>
              {formatDisplayDate(item.clar_answered_at, {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </SidebarRow>
      ))}
    </RecentActivityPanel>
  );
};

export default AnsweredQuestionsCard;
