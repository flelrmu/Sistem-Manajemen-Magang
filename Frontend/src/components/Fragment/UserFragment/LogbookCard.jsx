import React from "react";
import LogbookStatsCard from "../../Fragment/UserFragment/LogbookStatsCard";
import { ArrowUpDown, Clock, CheckCircle } from "lucide-react";


function LogbookCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <LogbookStatsCard
        icon={<ArrowUpDown className="text-blue-600 h-6 w-6" />}
        title="Total Entries"
        value="28"
        color="bg-blue-100"
      />
      <LogbookStatsCard
        icon={<Clock className="text-orange-500 h-6 w-6" />}
        title="Pending Review"
        value="2"
        color="bg-orange-100"
      />
      <LogbookStatsCard
        icon={<CheckCircle className="text-green-600 h-6 w-6" />}
        title="Approved"
        value="26"
        color="bg-green-100"
      />
    </div>
  );
}

export default LogbookCard;
