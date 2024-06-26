// import { format } from "date-fns";

import { searchParamsSchema } from "@/lib/schemas";
import { ChaptersClient } from "./components/client";
import { getChapters } from "@/server/chapter/service";
import { ServerTableStoreProvider } from "@/providers/server-table-provider";

const ChaptersPage = async ({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) => {
  const { page, limit, query } = searchParamsSchema.parse(searchParams);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ServerTableStoreProvider
          initialData={await getChapters({ page, limit, query })}
        >
          <ChaptersClient />
        </ServerTableStoreProvider>
      </div>
    </div>
  );
};

export default ChaptersPage;

export const dynamic = true;
