import React from "react";

function LogbookCard() {
  const stats = [
    { title: "Total Logbook", value: "24" },
    { title: "Approved", value: "20" },
    { title: "Pending Review", value: "3" }
  ];
  const getColorClass = (title) => {
    switch (title) {
      case "Total Logbook":
        return "text-black";
      case "Approved":
        return "text-green-500";
      case "Pending Review":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="group bg-white p-6 rounded-lg shadow hover:scale-105 duration-500">
          <h3 className="text-gray-600 mb-2 group-hover:text-red-500">{stat.title}</h3>
          <p className={`text-3xl font-bold ${getColorClass(stat.title)}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default LogbookCard;
