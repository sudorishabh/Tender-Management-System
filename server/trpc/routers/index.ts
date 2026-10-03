import { router, t } from "../trpc";
import { authQueryRoute } from "./auth/auth.query.route";
import { authMutationRoute } from "./auth/auth.mutation.route";
import { tenderQueryRoute } from "./tender/tender.query.route";
import { tenderMutationRoute } from "./tender/tender.mutation.route";
import { bidQueryRoute } from "./bid/bid.query.route";
import { bidMutationRoute } from "./bid/bid.mutation.route";
import { vendorQueryRoute } from "./vendor/vendor.query.route";
import { vendorMutationRoute } from "./vendor/vendor.mutation.route";
import { adminQueryRoute } from "./admin/admin.query.route";
import { adminMutationRoute } from "./admin/admin.mutation.route";
import { departmentRouter } from "./department";
import { s3Router } from "./s3/s3.route";
import { notificationRouter } from "./notification/notification.route";

// Merge query and mutation routes into single namespaces
const vendorRouter = t.mergeRouters(vendorQueryRoute, vendorMutationRoute);
const adminRouter = t.mergeRouters(adminQueryRoute, adminMutationRoute);
const authRouter = t.mergeRouters(authQueryRoute, authMutationRoute);
const tenderRouter = t.mergeRouters(tenderQueryRoute, tenderMutationRoute);
const bidRouter = t.mergeRouters(bidQueryRoute, bidMutationRoute);

export const appRouter = router({
  // Unified routers (all queries and mutations merged under single namespace)
  vendor: vendorRouter,
  admin: adminRouter,
  auth: authRouter,
  tender: tenderRouter,
  bid: bidRouter,

  // Other routers
  department: departmentRouter,
  s3: s3Router,
  notification: notificationRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
