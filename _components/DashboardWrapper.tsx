import React from "react";
import BackButton from "./Shared/BackButton";
import CustomButton from "./Shared/CustomButton";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showBackButton?: boolean;
  className?: string;
  button?: {
    label: string;
    icon?: React.JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
    onClick?: () => void;
  };
}

const DashboardWrapper: React.FC<Props> = ({
  children,
  title = "",
  description = "",
  showBackButton = false,
  className = "",
  button = undefined,
}) => {
  return (
    <div className={cn("w-full px-8 pb-6 pt-8", className)}>
      <div className='mb-6 flex items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          {showBackButton && <BackButton />}
          <div>
            {title ? (
              <h1 className='text-xl font-semibold tracking-tight text-slate-900'>
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className='mt-1 max-w-2xl text-sm text-slate-500'>
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {button && (
          <CustomButton
            btnName={button.label}
            variant='primary'
            LeftIcon={button.icon}
            onClick={button.onClick}
          />
        )}
      </div>

      {/* The dashboard layout already provides the page's <main> landmark */}
      {children}
    </div>
  );
};

export default DashboardWrapper;
