import React from "react";
import LogbookStatsCard from "../../Fragment/UserFragment/LogbookStatsCard";
import { ArrowUpDown, Clock, CheckCircle } from "lucide-react";

function LogbookCard({ logbooks }) {
  // Hitung statistik dari data logbooks
  const totalEntries = logbooks?.length || 0;
  const pendingReview = logbooks?.filter(log => log.status === 'pending').length || 0;
  const approved = logbooks?.filter(log => log.status === 'approved').length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <LogbookStatsCard
        icon={<ArrowUpDown className="text-blue-600 h-6 w-6" />}
        title="Total Entries"
        value={totalEntries.toString()}
        color="bg-blue-100"
      />
      <LogbookStatsCard
        icon={<Clock className="text-orange-500 h-6 w-6" />}
        title="Pending Review"
        value={pendingReview.toString()}
        color="bg-orange-100"
      />
      <LogbookStatsCard
        icon={<CheckCircle className="text-green-600 h-6 w-6" />}
        title="Approved"
        value={approved.toString()}
        color="bg-green-100"
      />
    </div>
  );
}

export default LogbookCard;