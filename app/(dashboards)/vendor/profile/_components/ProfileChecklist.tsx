import React from "react";
import { ArrowRight, CircleCheck, CircleDashed, ListChecks } from "lucide-react";
import ProfileSection from "./ProfileSection";
import CompletenessMeter from "../../_components/CompletenessMeter";
import {
  getProfileCompleteness,
  type ProfileFormField,
  type VendorProfileDetails,
} from "../../_components/profileCompleteness";

interface Props {
  profile: VendorProfileDetails;
  /** Opens the edit form at the given field */
  onCompleteField: (field: ProfileFormField) => void;
}

const ProfileChecklist = ({ profile, onCompleteField }: Props) => {
  const { percent, missing, total } = getProfileCompleteness(profile);

  return (
    <ProfileSection
      title='Profile completeness'
      icon={ListChecks}
      action={
        <span className='text-sm font-semibold text-slate-900'>{percent}%</span>
      }>
      <p
        id='profile-checklist-progress'
        className='text-xs text-slate-500'>
        {total - missing.length} of {total} details added
      </p>
      <CompletenessMeter
        percent={percent}
        labelledBy='profile-checklist-progress'
        className='mt-2'
      />

      {missing.length > 0 ? (
        <ul className='-mx-2 mt-3'>
          {missing.map((check) => (
            <li key={check.field}>
              <button
                type='button'
                onClick={() => onCompleteField(check.field)}
                className='group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40'>
                <CircleDashed
                  aria-hidden
                  className='size-4 shrink-0 text-slate-300'
                />
                <span className='flex-1'>Add {check.label}</span>
                <ArrowRight
                  aria-hidden
                  className='size-3.5 shrink-0 text-slate-300 transition-colors group-hover:text-primary'
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className='mt-3 flex items-center gap-2 text-sm text-emerald-700'>
          <CircleCheck
            aria-hidden
            className='size-4 shrink-0'
          />
          All business details are filled in.
        </p>
      )}
    </ProfileSection>
  );
};

export default ProfileChecklist;
