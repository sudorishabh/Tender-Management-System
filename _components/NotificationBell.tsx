"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { normalizeDbDate } from "@/utils/normalizeDbDate";
import { Button } from "@/_components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";

const POLL_INTERVAL_MS = 60_000;

interface NotificationItem {
  notif_id: number;
  notif_title: string;
  notif_message: string;
  notif_link: string | null;
  notif_is_read: boolean;
  created_at: Date | string;
}

const timeAgo = (value: Date | string) => {
  const date = normalizeDbDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "";
};

const NotificationRow = ({
  notification,
  onSelect,
}: {
  notification: NotificationItem;
  onSelect: (notification: NotificationItem) => void;
}) => {
  const className = cn(
    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none",
    !notification.notif_is_read && "bg-sky-50/50",
  );
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          notification.notif_is_read ? "bg-transparent" : "bg-primary",
        )}
      />
      <span className='min-w-0'>
        <span className='block text-sm font-medium text-slate-900'>
          {notification.notif_title}
          {!notification.notif_is_read && (
            <span className='sr-only'> (unread)</span>
          )}
        </span>
        <span className='mt-0.5 line-clamp-2 block text-xs text-slate-600'>
          {notification.notif_message}
        </span>
        <span className='mt-1 block text-[11px] text-slate-400'>
          {timeAgo(notification.created_at)}
        </span>
      </span>
    </>
  );

  return notification.notif_link ? (
    <Link
      href={notification.notif_link}
      onClick={() => onSelect(notification)}
      className={className}>
      {content}
    </Link>
  ) : (
    <button
      type='button'
      onClick={() => onSelect(notification)}
      className={className}>
      {content}
    </button>
  );
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data, isError } = trpc.notification.getMine.useQuery(undefined, {
    // Stop polling if the request fails, e.g. before the migration is applied
    refetchInterval: (query) =>
      query.state.status === "error" ? false : POLL_INTERVAL_MS,
    retry: false,
  });

  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.getMine.invalidate(),
  });

  // Keep the top bar unchanged when notifications are unavailable
  if (isError || !data) return null;

  const { notifications, unreadCount } = data;
  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleSelect = (notification: NotificationItem) => {
    if (!notification.notif_is_read) {
      markRead.mutate({ ids: [notification.notif_id] });
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          className='relative size-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900'>
          <Bell className='size-[18px]' />
          {unreadCount > 0 && (
            <span
              aria-hidden
              className='absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white'>
              {unreadLabel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='end'
        className='w-80 overflow-hidden p-0'>
        <div className='flex items-center justify-between border-b border-slate-100 px-4 py-3'>
          <p className='text-sm font-semibold text-slate-900'>Notifications</p>
          {unreadCount > 0 && (
            <button
              type='button'
              onClick={() => markRead.mutate({})}
              disabled={markRead.isPending}
              className='text-xs font-medium text-primary hover:underline disabled:opacity-50'>
              Mark all as read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <p className='px-4 py-10 text-center text-sm text-slate-500'>
            No notifications yet
          </p>
        ) : (
          <ul className='max-h-96 divide-y divide-slate-100 overflow-y-auto'>
            {notifications.map((notification) => (
              <li key={notification.notif_id}>
                <NotificationRow
                  notification={notification}
                  onSelect={handleSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
