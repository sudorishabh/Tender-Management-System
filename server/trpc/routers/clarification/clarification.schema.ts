import { z } from "zod";

export const tenderClarificationsSchema = z.object({
  tenderId: z.number().int().positive(),
});

export const askClarificationSchema = z.object({
  tenderId: z.number().int().positive(),
  question: z
    .string()
    .trim()
    .min(10, "Please describe your question in at least 10 characters")
    .max(1000, "Questions can be up to 1000 characters"),
});

export const answerClarificationSchema = z.object({
  clarificationId: z.number().int().positive(),
  answer: z
    .string()
    .trim()
    .min(1, "Answer is required")
    .max(2000, "Answers can be up to 2000 characters"),
});

export type AskClarificationInput = z.infer<typeof askClarificationSchema>;
export type AnswerClarificationInput = z.infer<
  typeof answerClarificationSchema
>;
