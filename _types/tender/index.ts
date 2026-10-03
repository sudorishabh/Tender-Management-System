export interface ITender {
  tender_id: number;
  tender_department: string | null;
  tender_remark: string | null;
  tender_number: string | null;
  tender_type: string | null;
  tender_scope: string | null;
  tender_title: string | null;
  tender_description: string | null;
  tender_comm_prebid?: string | null;
  tender_contract_document: string | null;
  tender_doc_fee: string | null;
  tender_emd: string | null;
  tender_location: string | null;
  // New timeline fields
  tender_release_date: string | Date | null;
  tender_query_deadline: string | Date | null;
  tender_query_response_date: string | Date | null;
  tender_bid_submission_deadline: string | Date | null;
  tender_technical_bid_opening: string | Date | null;
  tender_financial_bid_opening: string | Date | null;
  tender_opening_venue: string | null;
  tender_project_duration: string | null;
  // Whether the bid form asks for a technical / financial bid upload
  tender_is_technical_doc?: boolean | null;
  tender_is_financial_doc?: boolean | null;
  tender_status: string | null;
  tender_select_all?: boolean;
  tender_created_by_id?: number | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ITenderCard {
  tender_id: number;
  tender_title: string | null;
  tender_number: string | null;
  tender_description: string | null;
  tender_bid_end_date: Date | null;
  tender_doc_fee: string | null;
  tender_emd: string | null;
  tender_department: string | null;
  tender_scope: string | null;
  tender_location: string | null;
  tender_type: string | null;
  isLive: boolean;
  tender_is_active?: boolean;
  tender_status?: "draft" | "review" | "rescheduled" | "published";
}

export interface IBidderDocumentsReq {
  vdr_id: number;
  vdr_name: string | null;
  tender_id: number;
  created_at: Date;
  updated_at: Date;
}
