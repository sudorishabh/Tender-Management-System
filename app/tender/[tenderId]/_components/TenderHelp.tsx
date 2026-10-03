import React from "react";
import { Mail, Phone, type LucideIcon } from "lucide-react";

const ContactLink = ({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <a
    href={href}
    className='flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5'>
    <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10'>
      <Icon
        className='size-4 text-primary'
        aria-hidden='true'
      />
    </div>
    <div className='min-w-0'>
      <p className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
        {label}
      </p>
      <p className='truncate text-sm font-semibold text-slate-900'>{value}</p>
    </div>
  </a>
);

/** Support contacts, last on the page once the details are read. */
const TenderHelp = () => (
  <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
    <div className='px-5 py-4 border-b border-neutral-100'>
      <h2 className='text-sm font-semibold text-slate-900'>
        Help & Support
      </h2>
      <p className='text-xs text-slate-600 mt-1'>
        Contact us for assistance with this tender
      </p>
    </div>
    <div className='p-5 grid grid-cols-1 sm:grid-cols-2 gap-4'>
      <ContactLink
        href='tel:+918560064756'
        icon={Phone}
        label='Helpline Number'
        value='+91 8560064756'
      />
      <ContactLink
        href='mailto:etender@teri.res.in'
        icon={Mail}
        label='Email Support'
        value='etender@teri.res.in'
      />
    </div>
  </div>
);

export default TenderHelp;
